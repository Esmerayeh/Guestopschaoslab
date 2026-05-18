export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function labelize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function statusColor(value: string) {
  if (["passed", "low", "success"].includes(value)) return "text-success border-success/40 bg-success/10";
  if (["risky", "medium", "warning"].includes(value)) return "text-warning border-warning/40 bg-warning/10";
  if (["failed", "high", "critical", "danger"].includes(value)) return "text-danger border-danger/40 bg-danger/10";
  return "text-muted border-white/10 bg-white/5";
}

