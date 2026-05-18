"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/formatters";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: ReactNode;
}

export function Button({ className, variant = "primary", children, ...props }: ButtonProps) {
  const variants = {
    primary: "border-primary/70 bg-primary text-white shadow-[0_14px_40px_rgba(29,107,255,0.26)] hover:bg-primary/90",
    secondary: "border-white/10 bg-white/[0.08] text-text hover:bg-white/[0.12]",
    ghost: "border-transparent bg-transparent text-muted hover:text-text hover:bg-white/[0.08]",
    danger: "border-danger/50 bg-danger/15 text-danger hover:bg-danger/20",
  };
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
