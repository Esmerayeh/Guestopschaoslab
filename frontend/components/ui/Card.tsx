import type { ReactNode } from "react";

import { cn } from "@/lib/formatters";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0 rounded-lg border border-white/10 bg-panel/84 p-5 shadow-cockpit backdrop-blur", className)}>
      {children}
    </section>
  );
}

export function CardHeader({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex min-w-0 items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">{eyebrow}</p> : null}
        <h2 className="break-words text-lg font-bold text-text">{title}</h2>
      </div>
      {action}
    </div>
  );
}
