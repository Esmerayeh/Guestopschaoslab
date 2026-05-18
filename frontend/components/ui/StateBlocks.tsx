import { AlertTriangle, Loader2, Satellite } from "lucide-react";

import { Card } from "@/components/ui/Card";

export function LoadingState({ label = "Loading cockpit data..." }: { label?: string }) {
  return (
    <Card className="flex items-center gap-3">
      <Loader2 className="h-5 w-5 animate-spin text-cyan" />
      <span className="text-sm text-muted">{label}</span>
    </Card>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-warning/30 bg-warning/10">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
        <div>
          <p className="font-semibold text-text">Backend unavailable. Demo fallback is active.</p>
          <p className="mt-1 text-sm text-muted">{message}</p>
        </div>
      </div>
    </Card>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="text-center">
      <Satellite className="mx-auto h-8 w-8 text-cyan" />
      <h3 className="mt-3 font-semibold text-text">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted">{body}</p>
    </Card>
  );
}

