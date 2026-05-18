import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";
import type { EvalResult } from "@/types/guestops";

export function EvalScorecard({ evalResult }: { evalResult: EvalResult | null }) {
  if (!evalResult) {
    return (
      <Card>
        <CardHeader title="Eval Scorecard" eyebrow="waiting" />
        <p className="text-sm text-muted">Run a scenario to score agent behavior.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Eval Scorecard"
        eyebrow="deterministic checks"
        action={<Badge tone={evalResult.status}>{evalResult.status}</Badge>}
      />
      <div className="mb-5 flex min-w-0 items-center justify-between gap-4 rounded-md border border-white/10 bg-white/5 p-4">
        <div>
          <p className="font-mono text-3xl font-bold text-text">{evalResult.overall_score}</p>
          <p className="text-xs text-muted">overall score</p>
        </div>
        <div className="text-right">
          <ShieldCheck className="ml-auto h-6 w-6 text-cyan" />
          <Badge tone={evalResult.risk_level}>{evalResult.risk_level} risk</Badge>
        </div>
      </div>
      <div className="space-y-4">
        {Object.entries(evalResult.scores).map(([label, value]) => (
          <ScoreBar key={label} label={label} value={Number(value)} />
        ))}
      </div>
      <p className="mt-5 break-words rounded-md border border-white/10 bg-panel2 p-3 text-sm leading-6 text-muted">{evalResult.judge_notes}</p>
    </Card>
  );
}
