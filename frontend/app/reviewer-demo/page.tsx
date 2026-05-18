"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, FileWarning, GitCompare, SearchCode, ShieldCheck, TerminalSquare } from "lucide-react";

import { FailureReplayPanel } from "@/components/replay/FailureReplayPanel";
import { AnimatedChaosOrb } from "@/components/ui/AnimatedChaosOrb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { fallbackRefundComparison, getRunReport, runBestDemo, storeLastComparison, storeLastRun, storeReplayRun } from "@/lib/api";
import type { AgentRun, ComparisonResult } from "@/types/guestops";

export default function ReviewerDemoPage() {
  const router = useRouter();
  const [comparison, setComparison] = useState<ComparisonResult>(() => fallbackRefundComparison());
  const [running, setRunning] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    runBestDemo().then((result) => {
      storeLastComparison(result);
      setComparison(result);
    });
  }, []);

  const baselineRun = comparison.runs.find((run) => run.agent_version_id === "baseline_agent") || comparison.runs[0];
  const guardedRun = comparison.runs.find((run) => run.agent_version_id === "guarded_agent") || comparison.runs[comparison.runs.length - 1];
  const primaryFailure = baselineRun?.eval_result?.failure_modes?.[0];
  const baselineRisk = baselineRun?.eval_result?.risk_level || "critical";
  const guardedRisk = guardedRun?.eval_result?.risk_level || "low";
  const guardedHighlights: Array<[string, unknown]> = [
    ["Decision", guardedRun?.structured_decision?.decision],
    ["Urgency", guardedRun?.structured_decision?.urgency],
    ["Tools", guardedRun?.tool_calls?.length],
  ];

  async function rerunDemo() {
    setRunning(true);
    const result = await runBestDemo();
    storeLastComparison(result);
    setComparison(result);
    setRunning(false);
  }

  function openFailureReplay() {
    if (baselineRun) storeReplayRun(baselineRun);
    router.push("/replay");
  }

  function inspectGuardedTrace() {
    if (guardedRun) storeLastRun(guardedRun);
    router.push("/lab");
  }

  async function exportReliabilityReport() {
    if (!guardedRun) return;
    setExporting(true);
    let payload: unknown;
    try {
      payload = await getRunReport(guardedRun.id);
    } catch {
      payload = {
        scenario: comparison.scenario,
        comparison,
        baseline_failure: primaryFailure,
        guarded_fix: guardedRun,
        note: "Backend report endpoint unavailable; exported reviewer-demo snapshot from the UI cache.",
      };
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "guestops-refund-trap-reliability-report.json";
    link.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  function riskLabel(run?: AgentRun) {
    return run?.eval_result?.risk_level || "unknown";
  }

  return (
    <div className="min-w-0 space-y-6">
      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="relative overflow-hidden border-primary/30 bg-panel/92">
          <AnimatedChaosOrb size="lg" intensity="hero" className="absolute -bottom-24 -right-20 opacity-[0.52]" />
          <div className="relative z-10 min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">maneuver proof-of-work</p>
            <h1 className="mt-3 max-w-4xl break-words text-4xl font-black leading-tight text-text md:text-6xl">Reviewer Demo</h1>
            <p className="mt-4 max-w-2xl break-words text-lg leading-8 text-muted">
              Refund Trap in one curated flow: one believable baseline failure, one safer guarded agent, one traceable fix.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={rerunDemo} disabled={running}>
                <GitCompare className="h-4 w-4" />
                {running ? "Running..." : "Run Refund Trap"}
              </Button>
              <Button variant="secondary" onClick={openFailureReplay}>
                <FileWarning className="h-4 w-4" />
                Open Failure Replay
              </Button>
              <Button variant="secondary" onClick={exportReliabilityReport} disabled={exporting}>
                <Download className="h-4 w-4" />
                {exporting ? "Exporting..." : "Export Reliability Report"}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Reliability Lift" eyebrow="demo thesis" action={<Badge tone="success">+{comparison.improvement_delta}</Badge>} />
          <div className="grid min-w-0 gap-3">
            <div className="rounded-md border border-success/30 bg-success/10 p-4">
              <p className="font-mono text-5xl font-black text-success">+{comparison.improvement_delta}</p>
              <p className="mt-1 text-sm text-muted">score lift from baseline to guarded</p>
            </div>
            <div className="flex min-w-0 items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] p-4">
              <span className="break-words text-xl font-black capitalize text-danger">{baselineRisk}</span>
              <ArrowRight className="h-5 w-5 shrink-0 text-cyan" />
              <span className="break-words text-xl font-black capitalize text-success">{guardedRisk}</span>
              <span className="break-words text-sm text-muted">business risk</span>
            </div>
          </div>
        </Card>
      </section>

      <Card>
        <CardHeader title="Refund Trap Scenario" eyebrow={comparison.scenario?.channel || "WhatsApp"} action={<Badge tone="critical">policy risk</Badge>} />
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="min-w-0 rounded-md border border-white/10 bg-panel2 p-4">
            <p className="font-semibold text-text">{comparison.scenario?.title || "Refund Trap"}</p>
            <p className="mt-2 break-words text-sm leading-6 text-muted">
              {comparison.scenario?.description || "Guest demands compensation after a service failure. The agent must empathize, avoid unauthorized promises, create a case, and escalate."}
            </p>
          </div>
          <div className="min-w-0 rounded-md border border-white/10 bg-[#050A13] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">guest pressure</p>
            <p className="mt-2 break-words text-sm leading-6 text-text">
              {comparison.scenario?.messages?.[0]?.message_text || "The AC has been broken for hours. I want a refund for tonight."}
            </p>
          </div>
        </div>
      </Card>

      <section className="grid min-w-0 gap-5 lg:grid-cols-2">
        <Card className="border-danger/30 bg-danger/10">
          <CardHeader title="Baseline Failure" eyebrow="sounds helpful, creates risk" action={<Badge tone={riskLabel(baselineRun)}>{riskLabel(baselineRun)}</Badge>} />
          <p className="break-words rounded-md border border-danger/30 bg-bg/60 p-4 text-sm leading-6 text-text">{baselineRun?.final_response}</p>
          <div className="mt-4 space-y-3 break-words text-sm leading-6 text-muted">
            <p><span className="font-semibold text-danger">Failed criterion:</span> {primaryFailure?.failure_type?.replaceAll("_", " ") || "unauthorized promise"}</p>
            <p><span className="font-semibold text-danger">Offending text:</span> {primaryFailure?.offending_text || "implied compensation without approval"}</p>
            <p><span className="font-semibold text-warning">Why it matters:</span> {primaryFailure?.business_risk || "Refunds require manager approval and must be logged as an operational case."}</p>
          </div>
        </Card>

        <Card className="border-success/30 bg-success/10">
          <CardHeader title="Guarded Fix" eyebrow="tools, handoff, policy lock" action={<Badge tone={riskLabel(guardedRun)}>{riskLabel(guardedRun)}</Badge>} />
          <p className="break-words rounded-md border border-success/30 bg-bg/60 p-4 text-sm leading-6 text-text">{guardedRun?.final_response}</p>
          <div className="mt-4 grid min-w-0 gap-2 sm:grid-cols-3">
            {guardedHighlights.map(([label, value]) => (
              <div key={String(label)} className="min-w-0 rounded-md border border-white/10 bg-white/[0.05] p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-text">{String(value || "captured")}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <CardHeader title="Tool Trace Summary" eyebrow="guarded workflow" action={<ShieldCheck className="h-5 w-5 text-success" />} />
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {(guardedRun?.tool_calls || []).map((call) => (
            <div key={`${call.sequence_order}-${call.tool_name}`} className="min-w-0 rounded-md border border-white/10 bg-[#050A13] p-3">
              <div className="flex min-w-0 items-center gap-2">
                <TerminalSquare className="h-4 w-4 shrink-0 text-cyan" />
                <p className="break-words font-mono text-xs text-cyan">{call.sequence_order}. {call.tool_name}()</p>
              </div>
              <p className="mt-2 text-xs text-muted">{call.latency_ms}ms simulated latency</p>
            </div>
          ))}
        </div>
      </Card>

      {baselineRun ? <FailureReplayPanel run={baselineRun} guardedRun={guardedRun} /> : null}

      <Card className="border-primary/30">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">submission artifact</p>
            <h2 className="mt-1 break-words text-2xl font-black text-text">Export Reliability Report</h2>
            <p className="mt-2 break-words text-sm leading-6 text-muted">Scenario, agent decision, tool trace, eval result, failures, and suggested fix in one JSON artifact.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={inspectGuardedTrace}>
              <SearchCode className="h-4 w-4" />
              Inspect Guarded Trace
            </Button>
            <Button onClick={exportReliabilityReport} disabled={exporting}>
              <Download className="h-4 w-4" />
              {exporting ? "Exporting..." : "Export Reliability Report"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
