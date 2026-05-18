from __future__ import annotations

import uuid
from statistics import mean

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.agents.factory import get_agent
from app.evals.engine import EvaluationEngine
from app.models.persistence import AgentRun, ComparisonResult, EvalResult, FailureMode, RetrievedContext, ToolCall
from app.schemas.api import (
    AgentRunOut,
    ComparisonOut,
    EvalResultOut,
    EvalSummaryOut,
    FailureModeOut,
    RetrievedContextOut,
    RunReportOut,
    ToolCallOut,
)
from app.services import seed_loader


def create_run(db: Session, scenario_id: str, agent_version_id: str) -> AgentRunOut:
    scenario = seed_loader.get_scenario(scenario_id)
    if scenario is None:
        raise HTTPException(status_code=404, detail=f"Unknown scenario: {scenario_id}")
    if seed_loader.get_agent_version(agent_version_id) is None:
        raise HTTPException(status_code=404, detail=f"Unknown agent version: {agent_version_id}")

    agent = get_agent(agent_version_id)
    agent_result = agent.run(scenario)
    eval_result = EvaluationEngine().score(scenario, agent_result)

    run_id = f"run_{uuid.uuid4().hex}"
    run = AgentRun(
        id=run_id,
        scenario_id=scenario.id,
        agent_version_id=agent_version_id,
        status="completed",
        final_response=agent_result.final_response,
        structured_decision=agent_result.structured_decision,
        total_tokens=agent_result.total_tokens,
        latency_ms=agent_result.latency_ms,
    )
    db.add(run)

    for call in agent_result.tool_calls:
        db.add(
            ToolCall(
                id=f"tool_{uuid.uuid4().hex}",
                run_id=run_id,
                tool_name=call["tool_name"],
                input=call["input"],
                output=call["output"],
                success=call["success"],
                sequence_order=call["sequence_order"],
                latency_ms=call["latency_ms"],
            )
        )

    for context in agent_result.retrieved_contexts:
        db.add(
            RetrievedContext(
                id=f"ctx_{uuid.uuid4().hex}",
                run_id=run_id,
                kb_chunk_id=context["kb_chunk_id"],
                relevance_score=context["relevance_score"],
                content_snapshot=context["content_snapshot"],
            )
        )

    eval_id = f"eval_{uuid.uuid4().hex}"
    db.add(
        EvalResult(
            id=eval_id,
            run_id=run_id,
            overall_score=eval_result.overall_score,
            status=eval_result.status,
            risk_level=eval_result.risk_level,
            groundedness_score=eval_result.scores["groundedness"],
            policy_compliance_score=eval_result.scores["policy_compliance"],
            escalation_correctness_score=eval_result.scores["escalation_correctness"],
            tool_use_score=eval_result.scores["tool_use_correctness"],
            tone_score=eval_result.scores["tone"],
            missing_data_honesty_score=eval_result.scores["missing_data_honesty"],
            business_risk_score=eval_result.scores["business_risk"],
            judge_notes=eval_result.judge_notes,
            suggested_fix=eval_result.suggested_fix,
        )
    )
    for failure in eval_result.failure_modes:
        db.add(
            FailureMode(
                id=f"fail_{uuid.uuid4().hex}",
                eval_result_id=eval_id,
                failure_type=failure.failure_type,
                severity=failure.severity,
                offending_text=failure.offending_text,
                expected_behavior=failure.expected_behavior,
                business_risk=failure.business_risk,
                suggested_fix=failure.suggested_fix,
            )
        )

    db.commit()
    return get_run(db, run_id)


def get_run(db: Session, run_id: str, include_scenario: bool = True) -> AgentRunOut:
    run = db.get(AgentRun, run_id)
    if run is None:
        raise HTTPException(status_code=404, detail=f"Unknown run: {run_id}")
    return _run_to_schema(db, run, include_scenario=include_scenario)


def get_trace(db: Session, run_id: str) -> list[ToolCallOut]:
    run = db.get(AgentRun, run_id)
    if run is None:
        raise HTTPException(status_code=404, detail=f"Unknown run: {run_id}")
    calls = db.scalars(select(ToolCall).where(ToolCall.run_id == run_id).order_by(ToolCall.sequence_order)).all()
    return [_tool_call_to_schema(call) for call in calls]


def get_report(db: Session, run_id: str) -> RunReportOut:
    run = get_run(db, run_id)
    scenario = seed_loader.get_scenario(run.scenario_id)
    if scenario is None:
        raise HTTPException(status_code=404, detail=f"Unknown scenario for run: {run.scenario_id}")
    failures = run.eval_result.failure_modes if run.eval_result else []
    return RunReportOut(
        run=run,
        scenario=scenario,
        agent_decision=run.structured_decision,
        tool_trace=run.tool_calls,
        retrieved_context=run.retrieved_contexts,
        eval_result=run.eval_result,
        failures=failures,
        suggested_fix=run.eval_result.suggested_fix if run.eval_result else "",
    )


def create_comparison(db: Session, scenario_id: str, agent_versions: list[str]) -> ComparisonOut:
    if not agent_versions:
        agent_versions = ["baseline_agent", "guarded_agent"]
    runs = [create_run(db, scenario_id, agent_version) for agent_version in agent_versions]
    first_score = runs[0].eval_result.overall_score if runs[0].eval_result else 0
    last_score = runs[-1].eval_result.overall_score if runs[-1].eval_result else 0
    delta = round(last_score - first_score, 1)
    comparison_id = f"cmp_{uuid.uuid4().hex}"
    summary = (
        f"Guarded agent improved by {delta} points and reduced risk from "
        f"{runs[0].eval_result.risk_level if runs[0].eval_result else 'unknown'} to "
        f"{runs[-1].eval_result.risk_level if runs[-1].eval_result else 'unknown'}."
    )
    comparison = ComparisonResult(
        id=comparison_id,
        scenario_id=scenario_id,
        agent_versions=agent_versions,
        run_ids=[run.id for run in runs],
        improvement_delta=delta,
        summary=summary,
    )
    db.add(comparison)
    db.commit()
    return _comparison_to_schema(db, comparison)


def run_best_demo(db: Session) -> ComparisonOut:
    return create_comparison(db, "refund_trap", ["baseline_agent", "guarded_agent"])


def get_eval_summary(db: Session) -> EvalSummaryOut:
    runs = db.scalars(select(AgentRun).order_by(AgentRun.created_at.desc())).all()
    evals = db.scalars(select(EvalResult)).all()
    failures = db.scalars(select(FailureMode)).all()
    total_runs = len(runs)
    avg_score = round(mean([result.overall_score for result in evals]), 1) if evals else 0
    high_risk = sum(1 for result in evals if result.risk_level in {"high", "critical"})
    escalation_failures = sum(1 for failure in failures if failure.failure_type == "missing_escalation")
    escalation_accuracy = round(100 * (1 - (escalation_failures / total_runs)), 1) if total_runs else 0
    hallucination_flags = sum(1 for failure in failures if failure.failure_type in {"forbidden_phrase", "access_code_disclosure"})
    policy_violations = sum(1 for failure in failures if failure.severity == "critical")
    latest = [_run_to_schema(db, run, include_scenario=True) for run in runs[:5]]
    return EvalSummaryOut(
        total_runs=total_runs,
        avg_score=avg_score,
        high_risk_failures=high_risk,
        escalation_accuracy=escalation_accuracy,
        hallucination_flags=hallucination_flags,
        policy_violations=policy_violations,
        latest_runs=latest,
    )


def _comparison_to_schema(db: Session, comparison: ComparisonResult) -> ComparisonOut:
    runs = [get_run(db, run_id) for run_id in comparison.run_ids]
    return ComparisonOut(
        id=comparison.id,
        scenario_id=comparison.scenario_id,
        scenario=seed_loader.get_scenario(comparison.scenario_id),
        agent_versions=comparison.agent_versions,
        runs=runs,
        improvement_delta=comparison.improvement_delta,
        summary=comparison.summary,
        created_at=comparison.created_at.isoformat(),
    )


def _run_to_schema(db: Session, run: AgentRun, include_scenario: bool = True) -> AgentRunOut:
    calls = db.scalars(select(ToolCall).where(ToolCall.run_id == run.id).order_by(ToolCall.sequence_order)).all()
    contexts = db.scalars(select(RetrievedContext).where(RetrievedContext.run_id == run.id)).all()
    eval_result = db.scalar(select(EvalResult).where(EvalResult.run_id == run.id))
    return AgentRunOut(
        id=run.id,
        scenario_id=run.scenario_id,
        scenario=seed_loader.get_scenario(run.scenario_id) if include_scenario else None,
        agent_version_id=run.agent_version_id,
        status=run.status,
        final_response=run.final_response,
        structured_decision=run.structured_decision,
        total_tokens=run.total_tokens,
        latency_ms=run.latency_ms,
        tool_calls=[_tool_call_to_schema(call) for call in calls],
        retrieved_contexts=[_context_to_schema(context) for context in contexts],
        eval_result=_eval_to_schema(db, eval_result) if eval_result else None,
        created_at=run.created_at.isoformat(),
    )


def _tool_call_to_schema(call: ToolCall) -> ToolCallOut:
    return ToolCallOut(
        id=call.id,
        tool_name=call.tool_name,
        input=call.input,
        output=call.output,
        success=call.success,
        sequence_order=call.sequence_order,
        latency_ms=call.latency_ms,
    )


def _context_to_schema(context: RetrievedContext) -> RetrievedContextOut:
    return RetrievedContextOut(
        id=context.id,
        kb_chunk_id=context.kb_chunk_id,
        relevance_score=context.relevance_score,
        content_snapshot=context.content_snapshot,
    )


def _eval_to_schema(db: Session, eval_result: EvalResult) -> EvalResultOut:
    failures = db.scalars(select(FailureMode).where(FailureMode.eval_result_id == eval_result.id)).all()
    return EvalResultOut(
        id=eval_result.id,
        overall_score=eval_result.overall_score,
        status=eval_result.status,
        risk_level=eval_result.risk_level,
        scores={
            "groundedness": eval_result.groundedness_score,
            "policy_compliance": eval_result.policy_compliance_score,
            "escalation_correctness": eval_result.escalation_correctness_score,
            "tool_use_correctness": eval_result.tool_use_score,
            "tone": eval_result.tone_score,
            "missing_data_honesty": eval_result.missing_data_honesty_score,
            "business_risk": eval_result.business_risk_score,
        },
        failure_modes=[
            FailureModeOut(
                id=failure.id,
                failure_type=failure.failure_type,
                severity=failure.severity,
                offending_text=failure.offending_text,
                expected_behavior=failure.expected_behavior,
                business_risk=failure.business_risk,
                suggested_fix=failure.suggested_fix,
            )
            for failure in failures
        ],
        judge_notes=eval_result.judge_notes,
        suggested_fix=eval_result.suggested_fix,
    )

