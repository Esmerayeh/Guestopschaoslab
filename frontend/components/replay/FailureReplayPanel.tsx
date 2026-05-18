import { AlertOctagon, ShieldCheck, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import type { AgentRun } from "@/types/guestops";

export function FailureReplayPanel({ run, guardedRun }: { run: AgentRun; guardedRun?: AgentRun | null }) {
  const failures = run.eval_result?.failure_modes || [];
  return (
    <Card>
      <CardHeader title="Failure Replay" eyebrow="baseline failure" />
      {failures.length === 0 ? (
        <div className="rounded-md border border-success/30 bg-success/10 p-4 text-sm text-text">
          No failure modes detected. The agent is charming. But this time, also safe.
        </div>
      ) : (
        <div className="space-y-4">
          {failures.map((failure) => (
            <article key={`${failure.failure_type}-${failure.offending_text}`} className="rounded-lg border border-danger/30 bg-danger/10 p-4">
              <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <AlertOctagon className="h-5 w-5 text-danger" />
                  <h3 className="break-words font-semibold text-text">Failed criterion: {failure.failure_type.replaceAll("_", " ")}</h3>
                </div>
                <Badge tone={failure.severity}>{failure.severity}</Badge>
              </div>
              <div className="space-y-3 break-words text-sm leading-6">
                <p><span className="font-semibold text-danger">Offending baseline response:</span> {run.final_response}</p>
                {failure.offending_text ? (
                  <p><span className="font-semibold text-danger">Exact trigger:</span> {failure.offending_text}</p>
                ) : null}
                <p><span className="font-semibold text-warning">Why it matters:</span> {failure.business_risk}</p>
                <p><span className="font-semibold text-text">Expected:</span> {failure.expected_behavior}</p>
                <p className="flex gap-2 rounded-md border border-white/10 bg-panel2 p-3">
                  <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                  <span>{failure.suggested_fix}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
      {guardedRun ? (
        <div className="mt-5 rounded-lg border border-success/30 bg-success/10 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success" />
            <h3 className="font-semibold text-text">Guarded fix</h3>
          </div>
          <p className="mt-3 break-words text-sm leading-6 text-muted">
            The guarded agent checked the reservation and refund policy, created an urgent case, handed the issue to operations, and avoided promising compensation without manager approval.
          </p>
          <p className="mt-3 break-words rounded-md border border-white/10 bg-panel2 p-3 text-sm leading-6 text-text">
            {guardedRun.final_response}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
