from typing import Any, Literal

from pydantic import BaseModel, Field


ScenarioMode = Literal["chat", "voice_transcript"]


class ScenarioMessage(BaseModel):
    sender: str
    channel: str
    message_text: str
    sequence_order: int
    emotion: str


class ExpectedBehavior(BaseModel):
    must_escalate: bool = False
    must_create_case: bool = False
    must_not_promise_refund: bool = False
    must_check_reservation: bool = False
    must_reference_policy: bool = False
    must_ask_clarifying_question: bool = False
    must_verify_identity: bool = False
    must_not_disclose_access_code: bool = False
    expected_decision: str = "answer"
    forbidden_phrases: list[str] = Field(default_factory=list)
    required_tools: list[str] = Field(default_factory=list)
    notes: str = ""


class Scenario(BaseModel):
    id: str
    title: str
    description: str
    category: str
    difficulty: str
    channel: str
    mode: ScenarioMode
    risk_type: str
    risk_tags: list[str]
    property_id: str
    booking_id: str | None = None
    business_impact: str
    expected_action: str
    messages: list[ScenarioMessage]
    expected_behavior: ExpectedBehavior


class Property(BaseModel):
    id: str
    name: str
    location: str
    property_type: str
    timezone: str


class Reservation(BaseModel):
    booking_id: str
    guest_name: str
    guest_phone: str
    property_id: str
    check_in: str
    check_out: str
    status: str
    channel: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class AgentVersion(BaseModel):
    id: str
    name: str
    description: str
    model_name: str
    temperature: float
    config: dict[str, Any] = Field(default_factory=dict)


class StructuredDecision(BaseModel):
    intent: str
    urgency: str
    guest_emotion: str
    required_tools: list[str]
    decision: str
    risk_flags: list[str]
    can_answer_directly: bool
    guest_response: str


class ToolCallOut(BaseModel):
    id: str | None = None
    tool_name: str
    input: dict[str, Any]
    output: dict[str, Any]
    success: bool
    sequence_order: int
    latency_ms: int = 24


class RetrievedContextOut(BaseModel):
    id: str | None = None
    kb_chunk_id: str
    relevance_score: float
    content_snapshot: str


class FailureModeOut(BaseModel):
    id: str | None = None
    failure_type: str
    severity: str
    offending_text: str = ""
    expected_behavior: str
    business_risk: str
    suggested_fix: str


class EvalResultOut(BaseModel):
    id: str | None = None
    overall_score: float
    status: Literal["passed", "risky", "failed"]
    risk_level: Literal["low", "medium", "high", "critical"]
    scores: dict[str, float]
    failure_modes: list[FailureModeOut] = Field(default_factory=list)
    judge_notes: str
    suggested_fix: str


class RunRequest(BaseModel):
    scenario_id: str
    agent_version: str = "guarded_agent"


class AgentRunOut(BaseModel):
    id: str
    scenario_id: str
    scenario: Scenario | None = None
    agent_version_id: str
    status: str
    final_response: str
    structured_decision: dict[str, Any]
    total_tokens: int
    latency_ms: int
    tool_calls: list[ToolCallOut]
    retrieved_contexts: list[RetrievedContextOut]
    eval_result: EvalResultOut | None = None
    created_at: str


class CompareRequest(BaseModel):
    scenario_id: str
    agent_versions: list[str] = Field(default_factory=lambda: ["baseline_agent", "guarded_agent"])


class ComparisonOut(BaseModel):
    id: str
    scenario_id: str
    scenario: Scenario | None = None
    agent_versions: list[str]
    runs: list[AgentRunOut]
    improvement_delta: float
    summary: str
    created_at: str


class EvalSummaryOut(BaseModel):
    total_runs: int
    avg_score: float
    high_risk_failures: int
    escalation_accuracy: float
    hallucination_flags: int
    policy_violations: int
    latest_runs: list[AgentRunOut]


class RunReportOut(BaseModel):
    run: AgentRunOut
    scenario: Scenario
    agent_decision: dict[str, Any]
    tool_trace: list[ToolCallOut]
    retrieved_context: list[RetrievedContextOut]
    eval_result: EvalResultOut | None
    failures: list[FailureModeOut]
    suggested_fix: str

