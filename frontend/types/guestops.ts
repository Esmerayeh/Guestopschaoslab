export type ScenarioMode = "chat" | "voice_transcript";
export type EvalStatus = "passed" | "risky" | "failed";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ScenarioMessage {
  sender: string;
  channel: string;
  message_text: string;
  sequence_order: number;
  emotion: string;
}

export interface ExpectedBehavior {
  must_escalate: boolean;
  must_create_case: boolean;
  must_not_promise_refund: boolean;
  must_check_reservation: boolean;
  must_reference_policy: boolean;
  must_ask_clarifying_question: boolean;
  must_verify_identity: boolean;
  must_not_disclose_access_code: boolean;
  expected_decision: string;
  forbidden_phrases: string[];
  required_tools: string[];
  notes: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  channel: string;
  mode: ScenarioMode;
  risk_type: string;
  risk_tags: string[];
  property_id: string;
  booking_id?: string | null;
  business_impact: string;
  expected_action: string;
  messages: ScenarioMessage[];
  expected_behavior: ExpectedBehavior;
}

export interface ToolCall {
  id?: string | null;
  tool_name: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  success: boolean;
  sequence_order: number;
  latency_ms: number;
}

export interface RetrievedContext {
  id?: string | null;
  kb_chunk_id: string;
  relevance_score: number;
  content_snapshot: string;
}

export interface FailureMode {
  id?: string | null;
  failure_type: string;
  severity: string;
  offending_text: string;
  expected_behavior: string;
  business_risk: string;
  suggested_fix: string;
}

export interface EvalResult {
  id?: string | null;
  overall_score: number;
  status: EvalStatus;
  risk_level: RiskLevel;
  scores: Record<string, number>;
  failure_modes: FailureMode[];
  judge_notes: string;
  suggested_fix: string;
}

export interface AgentRun {
  id: string;
  scenario_id: string;
  scenario?: Scenario | null;
  agent_version_id: string;
  status: string;
  final_response: string;
  structured_decision: Record<string, unknown>;
  total_tokens: number;
  latency_ms: number;
  tool_calls: ToolCall[];
  retrieved_contexts: RetrievedContext[];
  eval_result: EvalResult | null;
  created_at: string;
}

export interface ComparisonResult {
  id: string;
  scenario_id: string;
  scenario?: Scenario | null;
  agent_versions: string[];
  runs: AgentRun[];
  improvement_delta: number;
  summary: string;
  created_at: string;
}

export interface EvalSummary {
  total_runs: number;
  avg_score: number;
  high_risk_failures: number;
  escalation_accuracy: number;
  hallucination_flags: number;
  policy_violations: number;
  latest_runs: AgentRun[];
}

export interface RunReport {
  run: AgentRun;
  scenario: Scenario;
  agent_decision: Record<string, unknown>;
  tool_trace: ToolCall[];
  retrieved_context: RetrievedContext[];
  eval_result: EvalResult | null;
  failures: FailureMode[];
  suggested_fix: string;
}

