import type { AgentRun, ComparisonResult, EvalSummary, RunReport, Scenario } from "@/types/guestops";
import { fallbackScenarios, fallbackSummary, mockBaselineRun, mockComparison, mockGuardedRun } from "@/lib/mockFallback";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

export async function getScenarios(): Promise<Scenario[]> {
  try {
    return await request<Scenario[]>("/api/scenarios", { cache: "no-store" });
  } catch {
    return fallbackScenarios;
  }
}

export async function getEvalSummary(): Promise<EvalSummary> {
  try {
    return await request<EvalSummary>("/api/evals/summary", { cache: "no-store" });
  } catch {
    return fallbackSummary;
  }
}

export async function createRun(scenarioId: string, agentVersion: string): Promise<AgentRun> {
  try {
    return await request<AgentRun>("/api/runs", {
      method: "POST",
      body: JSON.stringify({ scenario_id: scenarioId, agent_version: agentVersion }),
    });
  } catch {
    const fallbackRun = agentVersion === "baseline_agent" ? mockBaselineRun : mockGuardedRun;
    return { ...fallbackRun, scenario_id: scenarioId, agent_version_id: agentVersion };
  }
}

export async function runBestDemo(): Promise<ComparisonResult> {
  try {
    return await request<ComparisonResult>("/api/demo/best", { method: "POST" });
  } catch {
    return mockComparison;
  }
}

export async function compareAgents(scenarioId: string): Promise<ComparisonResult> {
  try {
    return await request<ComparisonResult>("/api/compare", {
      method: "POST",
      body: JSON.stringify({ scenario_id: scenarioId, agent_versions: ["baseline_agent", "guarded_agent"] }),
    });
  } catch {
    return { ...mockComparison, scenario_id: scenarioId };
  }
}

export async function getRun(runId: string): Promise<AgentRun> {
  return request<AgentRun>(`/api/runs/${runId}`, { cache: "no-store" });
}

export async function getRunReport(runId: string): Promise<RunReport> {
  return request<RunReport>(`/api/runs/${runId}/report`, { cache: "no-store" });
}

export function storeLastRun(run: AgentRun) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("guestops:lastRun", JSON.stringify(run));
  }
}

export function loadLastRun(): AgentRun | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("guestops:lastRun");
  try {
    return raw ? (JSON.parse(raw) as AgentRun) : null;
  } catch {
    return null;
  }
}

export function storeReplayRun(run: AgentRun) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("guestops:replayRun", JSON.stringify(run));
  }
}

export function loadReplayRun(): AgentRun | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("guestops:replayRun");
  try {
    return raw ? (JSON.parse(raw) as AgentRun) : null;
  } catch {
    return null;
  }
}

export function storeLastComparison(comparison: ComparisonResult) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("guestops:lastComparison", JSON.stringify(comparison));
    const baseline = comparison.runs.find((run) => run.agent_version_id === "baseline_agent") || comparison.runs[0];
    const guarded = comparison.runs.find((run) => run.agent_version_id === "guarded_agent") || comparison.runs[comparison.runs.length - 1];
    if (baseline) storeReplayRun(baseline);
    if (guarded) storeLastRun(guarded);
  }
}

export function loadLastComparison(): ComparisonResult | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("guestops:lastComparison");
  try {
    return raw ? (JSON.parse(raw) as ComparisonResult) : null;
  } catch {
    return null;
  }
}

export function fallbackRefundComparison(): ComparisonResult {
  return mockComparison;
}
