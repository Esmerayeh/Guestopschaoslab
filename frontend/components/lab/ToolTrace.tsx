import { CheckCircle2, TerminalSquare } from "lucide-react";

import { Card, CardHeader } from "@/components/ui/Card";
import type { ToolCall } from "@/types/guestops";

export function ToolTrace({ calls }: { calls: ToolCall[] }) {
  return (
    <Card>
      <CardHeader title="Tool Trace Timeline" eyebrow="auditable workflow" />
      <div className="min-w-0 space-y-3">
        {calls.map((call) => (
          <div key={`${call.sequence_order}-${call.tool_name}`} className="min-w-0 rounded-md border border-white/10 bg-[#050A13] p-3 font-mono text-xs">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-cyan">
                <TerminalSquare className="h-4 w-4" />
                <span className="truncate">{call.sequence_order}. {call.tool_name}()</span>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {call.latency_ms}ms
              </span>
            </div>
            <pre className="mt-3 max-h-28 max-w-full overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words text-muted scrollbar-thin">
              {JSON.stringify({ input: call.input, output: call.output }, null, 2)}
            </pre>
          </div>
        ))}
        {calls.length === 0 ? <p className="text-sm text-muted">No tool calls captured yet.</p> : null}
      </div>
    </Card>
  );
}
