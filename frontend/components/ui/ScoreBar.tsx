import { cn, labelize } from "@/lib/formatters";

export function ScoreBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = value >= 4 ? "bg-success" : value >= 3 ? "bg-warning" : "bg-danger";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-semibold text-muted">{labelize(label)}</span>
        <span className="font-mono text-text">{value}/{max}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
