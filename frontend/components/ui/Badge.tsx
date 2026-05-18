import type { ReactNode } from "react";

import { cn, statusColor } from "@/lib/formatters";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em]", statusColor(tone))}>
      {children}
    </span>
  );
}

