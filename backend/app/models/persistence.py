from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    scenario_id: Mapped[str] = mapped_column(String, index=True)
    agent_version_id: Mapped[str] = mapped_column(String, index=True)
    status: Mapped[str] = mapped_column(String, default="completed")
    final_response: Mapped[str] = mapped_column(Text, default="")
    structured_decision: Mapped[dict] = mapped_column(JSON, default=dict)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    tool_calls: Mapped[list["ToolCall"]] = relationship(back_populates="run", cascade="all, delete-orphan")
    retrieved_contexts: Mapped[list["RetrievedContext"]] = relationship(back_populates="run", cascade="all, delete-orphan")
    eval_result: Mapped["EvalResult | None"] = relationship(back_populates="run", cascade="all, delete-orphan")


class ToolCall(Base):
    __tablename__ = "tool_calls"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    run_id: Mapped[str] = mapped_column(ForeignKey("agent_runs.id"), index=True)
    tool_name: Mapped[str] = mapped_column(String)
    input: Mapped[dict] = mapped_column(JSON, default=dict)
    output: Mapped[dict] = mapped_column(JSON, default=dict)
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    sequence_order: Mapped[int] = mapped_column(Integer)
    latency_ms: Mapped[int] = mapped_column(Integer, default=24)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    run: Mapped[AgentRun] = relationship(back_populates="tool_calls")


class RetrievedContext(Base):
    __tablename__ = "retrieved_contexts"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    run_id: Mapped[str] = mapped_column(ForeignKey("agent_runs.id"), index=True)
    kb_chunk_id: Mapped[str] = mapped_column(String)
    relevance_score: Mapped[float] = mapped_column(Float, default=0.0)
    content_snapshot: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    run: Mapped[AgentRun] = relationship(back_populates="retrieved_contexts")


class EvalResult(Base):
    __tablename__ = "eval_results"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    run_id: Mapped[str] = mapped_column(ForeignKey("agent_runs.id"), unique=True, index=True)
    overall_score: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String)
    risk_level: Mapped[str] = mapped_column(String)
    groundedness_score: Mapped[float] = mapped_column(Float)
    policy_compliance_score: Mapped[float] = mapped_column(Float)
    escalation_correctness_score: Mapped[float] = mapped_column(Float)
    tool_use_score: Mapped[float] = mapped_column(Float)
    tone_score: Mapped[float] = mapped_column(Float)
    missing_data_honesty_score: Mapped[float] = mapped_column(Float)
    business_risk_score: Mapped[float] = mapped_column(Float)
    judge_notes: Mapped[str] = mapped_column(Text, default="")
    suggested_fix: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    run: Mapped[AgentRun] = relationship(back_populates="eval_result")
    failure_modes: Mapped[list["FailureMode"]] = relationship(back_populates="eval_result", cascade="all, delete-orphan")


class FailureMode(Base):
    __tablename__ = "failure_modes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    eval_result_id: Mapped[str] = mapped_column(ForeignKey("eval_results.id"), index=True)
    failure_type: Mapped[str] = mapped_column(String)
    severity: Mapped[str] = mapped_column(String)
    offending_text: Mapped[str] = mapped_column(Text, default="")
    expected_behavior: Mapped[str] = mapped_column(Text, default="")
    business_risk: Mapped[str] = mapped_column(Text, default="")
    suggested_fix: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    eval_result: Mapped[EvalResult] = relationship(back_populates="failure_modes")


class ComparisonResult(Base):
    __tablename__ = "comparison_results"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    scenario_id: Mapped[str] = mapped_column(String, index=True)
    agent_versions: Mapped[list[str]] = mapped_column(JSON, default=list)
    run_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    improvement_delta: Mapped[float] = mapped_column(Float, default=0)
    summary: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
