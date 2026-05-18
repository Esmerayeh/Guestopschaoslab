import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, GitCompare, Home, Library, PlayCircle, RotateCcw } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/reviewer-demo", label: "Demo", icon: GitCompare },
  { href: "/scenarios", label: "Scenarios", icon: Library },
  { href: "/lab", label: "Run Lab", icon: PlayCircle },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/replay", label: "Replay", icon: RotateCcw },
  { href: "/rubric", label: "Rubric", icon: Activity },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid-bg min-h-screen w-full overflow-x-hidden">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-bg/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md border border-primary/40 bg-primary/20 font-mono text-sm font-bold text-cyan">
              GO
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text">GuestOps Chaos Lab</p>
              <p className="font-mono text-[11px] text-muted">Trust, but trace.</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/[0.08] hover:text-text">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl overflow-x-hidden px-5 pb-10 pt-12 md:pt-14">{children}</main>
    </div>
  );
}
