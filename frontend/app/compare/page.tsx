"use client";

import { useEffect, useState } from "react";
import { GitCompare } from "lucide-react";

import { ComparisonMatrix } from "@/components/compare/ComparisonMatrix";
import { AnimatedChaosOrb } from "@/components/ui/AnimatedChaosOrb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/StateBlocks";
import { loadLastComparison, runBestDemo, storeLastComparison } from "@/lib/api";
import type { ComparisonResult } from "@/types/guestops";

export default function ComparePage() {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const cached = loadLastComparison();
    const comparisonIntent = window.localStorage.getItem("guestops:comparisonIntent");
    if (comparisonIntent === "scenario" && cached) {
      window.localStorage.removeItem("guestops:comparisonIntent");
      setComparison(cached);
      setLoading(false);
      return;
    }
    if (cached?.scenario_id === "refund_trap" && cached.improvement_delta >= 50) {
      setComparison(cached);
      setLoading(false);
      return;
    }
    runBestDemo()
      .then((result) => {
        storeLastComparison(result);
        setComparison(result);
      })
      .finally(() => setLoading(false));
  }, []);

  async function runComparison() {
    setRunning(true);
    window.localStorage.removeItem("guestops:comparisonIntent");
    const result = await runBestDemo();
    storeLastComparison(result);
    setComparison(result);
    setRunning(false);
  }

  if (loading) return <LoadingState label="Loading comparison..." />;

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-text md:text-4xl">Agent Comparison</h1>
          <p className="mt-2 max-w-2xl text-muted">The fastest way to show iteration: same guest chaos, two agents, visible reliability delta.</p>
        </div>
        <Button onClick={runComparison} disabled={running}>
          <GitCompare className="h-4 w-4" />
          {running ? "Running..." : "Run Best Demo Scenario"}
        </Button>
      </div>
      <div className="relative min-w-0 overflow-hidden rounded-lg">
        <AnimatedChaosOrb size="lg" intensity="subtle" className="absolute -right-24 top-4 opacity-[0.44]" />
        <div className="relative z-10 min-w-0">
          {comparison ? (
            <ComparisonMatrix comparison={comparison} />
          ) : (
            <Card className="text-center">
              <p className="text-muted">No comparison yet. Run the best demo scenario to generate a persisted baseline-vs-guarded result.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
