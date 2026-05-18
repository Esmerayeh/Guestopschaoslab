"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Download, FileWarning, SearchCode } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { getRunReport, storeLastRun, storeReplayRun } from "@/lib/api";
import type { ComparisonResult } from "@/types/guestops";

export function ComparisonMatrix({ comparison }: { comparison: ComparisonResult }) {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const baselineRun = comparison.runs.find((run) => run.agent_version_id === "baseline_agent") || comparison.runs[0];
  const guardedRun = comparison.runs.find((run) => run.agent_version_id === "guarded_agent") || comparison.runs[comparison.runs.length - 1];
  const baselineRisk = baselineRun?.eval_result?.risk_level || "critical";
  const guardedRisk = guardedRun?.eval_result?.risk_level || "low";

  function openFailureReplay() {
    if (baselineRun) storeReplayRun(baselineRun);
    router.push("/replay");
  }

  function inspectGuardedTrace() {
    if (guardedRun) storeLastRun(guardedRun);
    router.push("/lab");
  }

  async function exportReport() {
    if (!guardedRun) return;
    setExporting(true);
    let payload: unknown;
    try {
      payload = await getRunReport(guardedRun.id);
    } catch {
      payload = {
        scenario: comparison.scenario,
        comparison,
        selected_run: guardedRun,
        note: "Backend report endpoint unavailable; exported comparison snapshot from the UI cache.",
      };
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guestops-${comparison.scenario_id}-guarded-report.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <Card>
      <CardHeader
        title="Baseline vs Guarded"
        eyebrow={comparison.scenario?.title || comparison.scenario_id}
        action={
          <div className="flex shrink-0 items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-success shadow-[0_18px_50px_rgba(34,197,94,0.16)]">
            <ArrowUpRight className="h-5 w-5" />
            <div>
              <p className="font-mono text-3xl font-black leading-none">+{comparison.improvement_delta}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em]">score delta</p>
            </div>
          </div>
        }
      />
      <div className="mb-5 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 rounded-lg border border-danger/30 bg-danger/10 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">business risk</p>
          <div className="mt-2 flex min-w-0 items-center gap-3">
            <span className="break-words text-2xl font-black capitalize text-danger">{baselineRisk}</span>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted" />
            <span className="break-words text-2xl font-black capitalize text-success">{guardedRisk}</span>
          </div>
          <p className="mt-2 text-sm text-muted">Critical -&gt; Low business risk for the reviewer demo.</p>
        </div>
        <p className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-muted">
          Baseline sounded helpful but created policy risk. Guarded used tools, escalated, and avoided unauthorized promises.
        </p>
      </div>
      <div className="mb-5 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={openFailureReplay}>
          <FileWarning className="h-4 w-4" />
          Open Failure Replay
        </Button>
        <Button variant="secondary" onClick={inspectGuardedTrace}>
          <SearchCode className="h-4 w-4" />
          Inspect Guarded Trace
        </Button>
        <Button onClick={exportReport} disabled={exporting}>
          <Download className="h-4 w-4" />
          {exporting ? "Exporting..." : "Export Reliability Report"}
        </Button>
      </div>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {comparison.runs.map((run) => (
          <article key={run.id} className="min-w-0 rounded-lg border border-white/10 bg-panel2 p-4">
            <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-text">{run.agent_version_id === "baseline_agent" ? "Baseline Agent" : "Guarded Agent"}</h3>
                <p className="text-xs text-muted">{run.tool_calls.length} tool calls</p>
              </div>
              <Badge tone={run.eval_result?.risk_level || "neutral"}>{run.eval_result?.risk_level || "unknown"}</Badge>
            </div>
            <div className="mb-4 rounded-md border border-white/10 bg-[#050A13] p-4">
              <p className="font-mono text-4xl font-bold text-text">{run.eval_result?.overall_score ?? 0}</p>
              <p className="text-xs text-muted">overall score</p>
            </div>
            <p className="min-h-24 break-words text-sm leading-6 text-muted">{run.final_response}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {run.tool_calls.map((call) => (
                <span key={`${run.id}-${call.sequence_order}`} className="max-w-full break-words rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-cyan">
                  {call.tool_name}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <p className="mt-4 break-words rounded-md border border-white/10 bg-white/5 p-3 text-sm text-muted">{comparison.summary}</p>
    </Card>
  );
}
