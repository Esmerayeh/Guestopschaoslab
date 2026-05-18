"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  ClipboardCheck,
  FileText,
  Flag,
  Gauge,
  GitCompare,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AnimatedChaosOrb } from "@/components/ui/AnimatedChaosOrb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/StateBlocks";
import { getEvalSummary, getScenarios, runBestDemo, storeLastComparison } from "@/lib/api";
import type { EvalSummary, Scenario } from "@/types/guestops";

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<EvalSummary | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    Promise.all([getEvalSummary(), getScenarios()])
      .then(([summaryData, scenarioData]) => {
        setSummary(summaryData);
        setScenarios(scenarioData);
        setFallback(summaryData.total_runs === 0 && scenarioData.length <= 2);
      })
      .finally(() => setLoading(false));
  }, []);

  const kpis = useMemo(
    () => [
      { label: "Total Scenarios", value: scenarios.length || 13, icon: Bot },
      { label: "Avg Agent Score", value: summary?.avg_score || 0, icon: Gauge },
      { label: "High-Risk Failures", value: summary?.high_risk_failures || 0, icon: ShieldAlert },
      { label: "Escalation Accuracy", value: `${summary?.escalation_accuracy || 0}%`, icon: Flag },
      { label: "Hallucination Flags", value: summary?.hallucination_flags || 0, icon: Sparkles },
      { label: "Policy Violations", value: summary?.policy_violations || 0, icon: AlertTriangle },
    ],
    [scenarios.length, summary],
  );

  async function handleBestDemo() {
    setRunning(true);
    const comparison = await runBestDemo();
    storeLastComparison(comparison);
    setRunning(false);
    router.push("/compare");
  }

  if (loading) {
    return <LoadingState label="Loading reliability cockpit..." />;
  }

  const chartData = [
    { name: "Grounded", score: 5 },
    { name: "Policy", score: 5 },
    { name: "Escalation", score: 5 },
    { name: "Tools", score: 4 },
    { name: "Tone", score: 4 },
  ];
  const architectureSteps = [
    { label: "Scenario", icon: ClipboardCheck },
    { label: "Agent", icon: Bot },
    { label: "Tools", icon: TerminalSquare },
    { label: "Eval", icon: Activity },
    { label: "Failure Replay", icon: RotateCcw },
    { label: "Reliability Report", icon: FileText },
  ];
  const demoSteps = [
    {
      title: "Compare Agents",
      body: "Baseline sounds helpful but creates policy risk.",
      href: "/compare",
    },
    {
      title: "Inspect Trace",
      body: "Guarded agent uses tools before answering.",
      href: "/lab",
    },
    {
      title: "Replay Failure",
      body: "See the exact failure, risk, and fix.",
      href: "/replay",
    },
  ];

  return (
    <div className="-mt-8 min-w-0 space-y-4 md:-mt-10">
      {fallback ? <ErrorState message="Connect the FastAPI backend for live persistence. The UI is showing safe demo defaults instead of looking broken." /> : null}
      <section className="grid min-w-0 items-center gap-6 overflow-hidden pb-1 pt-1 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]">
        <div className="min-w-0 py-2 md:py-3">
          <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-cyan">
            Maneuver-inspired proof of work
          </span>
          <h1 className="mt-4 max-w-4xl break-words text-5xl font-black leading-[1.02] text-text md:text-7xl">
            GuestOps Chaos Lab
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-muted">
            Stress-test hospitality AI agents before they meet real guests.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Run messy guest scenarios, inspect tool traces, score reliability, and catch failure modes before deployment.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleBestDemo} disabled={running}>
              <GitCompare className="h-4 w-4" />
              {running ? "Running comparison..." : "Run Best Demo Scenario"}
            </Button>
            <Button variant="secondary" onClick={() => router.push("/reviewer-demo")}>Open Reviewer Demo</Button>
            <Button variant="secondary" onClick={() => router.push("/scenarios")}>View Scenario Library</Button>
          </div>
        </div>
        <div className="flex min-w-0 flex-col items-stretch gap-4 overflow-hidden">
          <div className="relative grid min-h-48 place-items-center overflow-hidden rounded-lg border border-primary/20 bg-panel/46 shadow-cockpit md:min-h-56">
            <AnimatedChaosOrb size="lg" intensity="hero" className="opacity-85" />
          </div>
          <Card className="bg-panel/86">
            <CardHeader title="Reliability Snapshot" eyebrow="baseline vs guarded" action={<Badge tone="low">demo ready</Badge>} />
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} domain={[0, 5]} />
                  <Tooltip contentStyle={{ background: "#07111F", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, color: "#F8FAFC" }} />
                  <Bar dataKey="score" fill="#1D6BFF" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </section>

      <Card className="p-4">
        <div className="mb-3 flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">reliability pipeline</p>
          <p className="break-words text-sm text-muted">Messy guest input becomes a traceable reliability report.</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {architectureSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex min-w-0 flex-1 basis-36 items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-white/10 bg-panel2 px-3 py-2.5">
                  <Icon className="h-4 w-4 shrink-0 text-cyan" />
                  <p className="break-words text-sm font-semibold text-text">{step.label}</p>
                </div>
                {index < architectureSteps.length - 1 ? <span className="hidden h-px w-5 shrink-0 bg-primary/50 md:block" /> : null}
              </div>
            );
          })}
        </div>
      </Card>

      <section className="space-y-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">current eval surface</p>
          <p className="mt-1 text-sm text-muted">Reliability snapshot across seeded hospitality chaos scenarios.</p>
        </div>
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="min-h-28 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="break-words text-sm text-muted">{kpi.label}</p>
                    <p className="mt-2 break-words font-mono text-3xl font-bold text-text">{kpi.value}</p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/15 text-cyan">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Card>
        <CardHeader title="2 Minute Walkthrough" eyebrow="reviewer path" />
        <p className="mb-4 max-w-2xl text-sm leading-6 text-muted">
          The fastest way to review the project: one failure, one safer agent, one traceable fix.
        </p>
        <div className="grid min-w-0 gap-3 md:grid-cols-3">
          {demoSteps.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className="group min-w-0 rounded-md border border-white/10 bg-panel2 p-4 transition hover:border-primary/50 hover:bg-primary/10"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-sm text-cyan">0{index + 1}</p>
                <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:text-cyan" />
              </div>
              <p className="mt-3 break-words font-semibold text-text">{item.title}</p>
              <p className="mt-2 break-words text-sm leading-6 text-muted">{item.body}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
