"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GitCompare, PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState, LoadingState } from "@/components/ui/StateBlocks";
import { compareAgents, createRun, getScenarios, storeLastComparison, storeLastRun } from "@/lib/api";
import type { Scenario } from "@/types/guestops";

const primaryCompareScenarios = new Set(["refund_trap", "safety_siren", "noisy_voice_lockout"]);

export default function ScenarioGalleryPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [comparingId, setComparingId] = useState<string | null>(null);

  useEffect(() => {
    getScenarios().then(setScenarios).finally(() => setLoading(false));
  }, []);

  async function runScenario(scenarioId: string) {
    setRunningId(scenarioId);
    const run = await createRun(scenarioId, "guarded_agent");
    storeLastRun(run);
    setRunningId(null);
    router.push("/lab");
  }

  async function compareScenario(scenarioId: string) {
    setComparingId(scenarioId);
    const comparison = await compareAgents(scenarioId);
    storeLastComparison(comparison);
    window.localStorage.setItem("guestops:comparisonIntent", "scenario");
    setComparingId(null);
    router.push("/compare");
  }

  if (loading) return <LoadingState label="Loading scenario library..." />;

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1 className="text-4xl font-black text-text">Scenario Gallery</h1>
        <p className="mt-3 max-w-2xl text-muted">Messy guest operations cases designed to expose hallucination, policy, escalation, and tool-use failures.</p>
      </div>
      {scenarios.length === 0 ? (
        <EmptyState title="No scenarios found" body="Seed data should include at least 13 scenarios. Check the backend seed loader." />
      ) : (
        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((scenario) => {
            const compareIsPrimary = primaryCompareScenarios.has(scenario.id);
            const isBusy = runningId === scenario.id || comparingId === scenario.id;
            return (
              <Card key={scenario.id} className="flex min-h-[360px] flex-col">
                <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-bold text-text">{scenario.title}</h2>
                    <p className="mt-2 break-words text-sm leading-6 text-muted">{scenario.description}</p>
                  </div>
                  <Badge tone={scenario.difficulty === "Critical" ? "critical" : scenario.difficulty === "High" ? "high" : "neutral"}>{scenario.difficulty}</Badge>
                </div>
                <div className="space-y-3 break-words text-sm">
                  <p><span className="text-muted">Risk:</span> <span className="text-text">{scenario.risk_type}</span></p>
                  <p><span className="text-muted">Channel:</span> <span className="text-text">{scenario.channel}</span></p>
                  <p><span className="text-muted">Expected:</span> <span className="text-text">{scenario.expected_action}</span></p>
                  <p><span className="text-muted">Business impact:</span> <span className="text-text">{scenario.business_impact}</span></p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {scenario.risk_tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full bg-white/[0.08] px-2 py-1 text-xs text-muted">{tag}</span>
                  ))}
                </div>
                <div className="mt-auto grid min-w-0 gap-2 pt-5 sm:grid-cols-2">
                  <Button
                    className="w-full"
                    variant={compareIsPrimary ? "primary" : "secondary"}
                    onClick={() => compareScenario(scenario.id)}
                    disabled={isBusy}
                  >
                    <GitCompare className="h-4 w-4" />
                    {comparingId === scenario.id ? "Comparing..." : "Compare Agents"}
                  </Button>
                  <Button
                    className="w-full"
                    variant={compareIsPrimary ? "secondary" : "primary"}
                    onClick={() => runScenario(scenario.id)}
                    disabled={isBusy}
                  >
                    <PlayCircle className="h-4 w-4" />
                    {runningId === scenario.id ? "Running..." : "Run Guarded"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
