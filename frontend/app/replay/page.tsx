"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

import { FailureReplayPanel } from "@/components/replay/FailureReplayPanel";
import { AnimatedChaosOrb } from "@/components/ui/AnimatedChaosOrb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/StateBlocks";
import { fallbackRefundComparison, loadLastComparison, loadReplayRun, runBestDemo, storeLastComparison } from "@/lib/api";
import type { AgentRun } from "@/types/guestops";

export default function ReplayPage() {
  const router = useRouter();
  const fallbackComparison = fallbackRefundComparison();
  const [run, setRun] = useState<AgentRun | null>(() => fallbackComparison.runs.find((item) => item.agent_version_id === "baseline_agent") || fallbackComparison.runs[0]);
  const [guardedRun, setGuardedRun] = useState<AgentRun | null>(() => fallbackComparison.runs.find((item) => item.agent_version_id === "guarded_agent") || null);

  useEffect(() => {
    const cachedComparison = loadLastComparison();
    const cachedReplay = loadReplayRun();
    if (cachedComparison?.scenario_id === "refund_trap") {
      const baseline = cachedComparison.runs.find((item) => item.agent_version_id === "baseline_agent") || cachedComparison.runs[0];
      const guarded = cachedComparison.runs.find((item) => item.agent_version_id === "guarded_agent") || null;
      setRun(baseline);
      setGuardedRun(guarded);
      return;
    }
    if (cachedReplay?.scenario_id === "refund_trap" && cachedReplay.agent_version_id === "baseline_agent") {
      setRun(cachedReplay);
      return;
    }
    runBestDemo().then((comparison) => {
      storeLastComparison(comparison);
      setRun(comparison.runs.find((item) => item.agent_version_id === "baseline_agent") || comparison.runs[0]);
      setGuardedRun(comparison.runs.find((item) => item.agent_version_id === "guarded_agent") || null);
    });
  }, []);

  return (
    <div className="min-w-0 space-y-4">
      <div className="relative min-w-0 overflow-hidden rounded-lg border border-white/10 bg-panel/72 p-4 shadow-cockpit">
        <AnimatedChaosOrb size="md" intensity="subtle" className="absolute -right-10 -top-12 opacity-[0.42]" />
        <div className="relative z-10 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black text-text md:text-4xl">Failure Replay</h1>
            <p className="mt-2 max-w-2xl break-words text-muted">Show the exact failure, why it matters, and the fix. This is the reliability layer.</p>
          </div>
          <Button onClick={() => router.push("/lab")} variant="secondary">
            <RotateCcw className="h-4 w-4" />
            Back to Run Lab
          </Button>
        </div>
      </div>
      {run ? (
        <>
          <Card>
            <p className="font-semibold text-text">{run.scenario?.title || run.scenario_id}</p>
            <p className="mt-2 break-words text-sm leading-6 text-muted">{run.final_response}</p>
          </Card>
          <FailureReplayPanel run={run} guardedRun={guardedRun} />
        </>
      ) : (
        <EmptyState title="No failure replay yet" body="Run a scenario or comparison first. The replay panel will show exact offending lines and suggested fixes." />
      )}
    </div>
  );
}
