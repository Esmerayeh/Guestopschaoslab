"use client";

import { useState } from "react";
import { Braces, ChevronDown, ChevronRight, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import type { AgentRun } from "@/types/guestops";

export function AgentOutput({ run, defaultDecisionOpen = false }: { run: AgentRun; defaultDecisionOpen?: boolean }) {
  const [showDecision, setShowDecision] = useState(defaultDecisionOpen);
  const decision = run.structured_decision || {};
  const decisionItems: Array<[string, unknown]> = [
    ["Intent", decision.intent],
    ["Decision", decision.decision],
    ["Urgency", decision.urgency],
  ];

  return (
    <div className="min-w-0 space-y-5">
      <Card>
        <CardHeader title="Agent Response" eyebrow={run.agent_version_id} action={<MessageSquareText className="h-5 w-5 text-cyan" />} />
        <p className="break-words text-sm leading-7 text-text">{run.final_response}</p>
      </Card>
      <Card>
        <CardHeader
          title="Structured Decision"
          eyebrow="workflow object"
          action={
            <Button className="min-h-8 px-2 py-1 text-xs" variant="secondary" onClick={() => setShowDecision((value) => !value)}>
              {showDecision ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              Raw JSON
            </Button>
          }
        />
        <div className="mb-3 grid min-w-0 gap-2 sm:grid-cols-3">
          {decisionItems.map(([label, value]) => (
            <div key={String(label)} className="min-w-0 rounded-md border border-white/10 bg-white/[0.04] p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
              <p className="mt-1 break-words text-sm font-semibold text-text">{String(value || "unknown")}</p>
            </div>
          ))}
        </div>
        {showDecision ? (
          <pre className="max-h-72 max-w-full overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-white/10 bg-[#050A13] p-4 font-mono text-xs leading-5 text-muted scrollbar-thin">
            {JSON.stringify(run.structured_decision, null, 2)}
          </pre>
        ) : (
          <p className="flex min-w-0 items-center gap-2 break-words rounded-md border border-white/10 bg-panel2 p-3 text-sm text-muted">
            <Braces className="h-4 w-4 shrink-0 text-cyan" />
            Decision schema captured. Expand raw JSON when a reviewer wants the audit object.
          </p>
        )}
      </Card>
    </div>
  );
}
