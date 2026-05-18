"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Download, PlayCircle } from "lucide-react";

import { AgentOutput } from "@/components/lab/AgentOutput";
import { EvalScorecard } from "@/components/lab/EvalScorecard";
import { GuestSimulator } from "@/components/lab/GuestSimulator";
import { ToolTrace } from "@/components/lab/ToolTrace";
import { FailureReplayPanel } from "@/components/replay/FailureReplayPanel";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState, LoadingState } from "@/components/ui/StateBlocks";
import { createRun, getRunReport, getScenarios, loadLastRun, storeLastRun } from "@/lib/api";
import type { AgentRun, Scenario } from "@/types/guestops";

export default function RunLabPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState("refund_trap");
  const [agentVersion, setAgentVersion] = useState("guarded_agent");
  const [run, setRun] = useState<AgentRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [reportState, setReportState] = useState<string>("");
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cached = loadLastRun();
    if (cached && cached.scenario_id === "refund_trap" && cached.agent_version_id === "guarded_agent") setRun(cached);
    getScenarios()
      .then((items) => {
        if (cancelled) return;
        setScenarios(items);
        if (!(cached && cached.scenario_id === "refund_trap" && cached.agent_version_id === "guarded_agent")) {
          return createRun("refund_trap", "guarded_agent").then((created) => {
            if (cancelled) return;
            setRun(created);
            storeLastRun(created);
          });
        }
      })
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRun() {
    setRunning(true);
    const created = await createRun(selectedScenario, agentVersion);
    setRun(created);
    storeLastRun(created);
    setRunning(false);
  }

  async function exportReport() {
    if (!run) return;
    try {
      const report = await getRunReport(run.id);
      setReportState(JSON.stringify(report, null, 2));
      setShowReport(true);
    } catch {
      setReportState(JSON.stringify({ run, note: "Backend report endpoint unavailable; showing cached run." }, null, 2));
      setShowReport(true);
    }
  }

  if (loading) return <LoadingState label="Loading run lab..." />;

  const scenario = run?.scenario || scenarios.find((item) => item.id === selectedScenario);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black text-text">Run Lab</h1>
          <p className="mt-3 max-w-2xl text-muted">Run a scenario, inspect the response, tool trace, structured decision, and eval score in one cockpit.</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-panel/92">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">cockpit controls</p>
            <p className="mt-1 break-words text-sm text-muted">Default reviewer path: Refund Trap with the Guarded Agent.</p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row lg:justify-end">
            <select className="min-w-0 rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-text" value={selectedScenario} onChange={(event) => setSelectedScenario(event.target.value)}>
              {scenarios.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
            <select className="min-w-0 rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-text" value={agentVersion} onChange={(event) => setAgentVersion(event.target.value)}>
              <option value="guarded_agent">Guarded Agent</option>
              <option value="baseline_agent">Baseline Agent</option>
            </select>
            <Button onClick={handleRun} disabled={running}>
              <PlayCircle className="h-4 w-4" />
              {running ? "Running..." : "Run"}
            </Button>
          </div>
        </div>
      </Card>

      {!run || !scenario ? (
        <EmptyState title="No run selected" body="Choose a scenario and run an agent. No hallucinated checkout extensions on our watch." />
      ) : (
        <>
          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)_minmax(0,0.85fr)]">
            <GuestSimulator scenario={scenario} />
            <AgentOutput run={run} />
            <EvalScorecard evalResult={run.eval_result} />
          </div>
          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <ToolTrace calls={run.tool_calls} />
            <FailureReplayPanel run={run} />
          </div>
          <Card>
            <CardHeader
              title="Reliability Report"
              eyebrow="export artifact"
              action={
                <div className="flex flex-wrap gap-2">
                  {reportState ? (
                    <Button className="min-h-9 px-3 py-1 text-xs" variant="secondary" onClick={() => setShowReport((value) => !value)}>
                      {showReport ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      Raw JSON
                    </Button>
                  ) : null}
                  <Button variant="secondary" onClick={exportReport}><Download className="h-4 w-4" />Export Reliability Report</Button>
                </div>
              }
            />
            {reportState && showReport ? (
              <pre className="max-h-96 max-w-full overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-white/10 bg-[#050A13] p-4 font-mono text-xs text-muted scrollbar-thin">{reportState}</pre>
            ) : (
              <p className="text-sm text-muted">Use this to export scenario, agent decision, trace, eval result, failures, and suggested fix.</p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
