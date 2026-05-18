import { MessageSquare, PhoneCall } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import type { Scenario } from "@/types/guestops";

export function GuestSimulator({ scenario }: { scenario: Scenario }) {
  const Icon = scenario.mode === "voice_transcript" ? PhoneCall : MessageSquare;
  return (
    <Card className="h-full">
      <CardHeader title="Guest Simulator" eyebrow={scenario.channel} action={<Badge tone={scenario.mode === "voice_transcript" ? "warning" : "neutral"}>{scenario.mode}</Badge>} />
      <div className="mb-4 rounded-md border border-white/10 bg-white/5 p-3">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-text">
          <Icon className="h-4 w-4 text-cyan" />
          <span className="break-words">{scenario.title}</span>
        </div>
        <p className="mt-2 break-words text-sm text-muted">{scenario.description}</p>
      </div>
      <div className="space-y-3">
        {scenario.messages.map((message) => (
          <div key={`${message.sequence_order}-${message.channel}`} className="min-w-0 rounded-lg border border-white/10 bg-panel2 p-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="break-words font-mono uppercase tracking-[0.14em] text-cyan">{message.channel}</span>
              <span className="rounded-full bg-white/[0.08] px-2 py-1 text-muted">{message.emotion}</span>
            </div>
            <p className="break-words text-sm leading-6 text-text">{message.message_text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
