import type { ReactNode } from "react";
import { AlertCircle, ArrowUpRight, Inbox, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
export function StatusBadge({ status }: { status: string }) {
  const good = [
    "On track",
    "Completed",
    "Approved",
    "Paid",
    "Received",
    "Won",
    "Active",
    "Published",
    "Delivered",
    "In stock",
  ].includes(status);
  const bad = ["Delayed", "Lost", "Overdue", "Out of stock"].includes(status);
  const neutral = ["Draft", "Archived", "Inactive", "New"].includes(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold",
        good
          ? "bg-success/10 text-success"
          : bad
            ? "bg-destructive/10 text-destructive"
            : neutral
              ? "bg-muted text-muted-foreground"
              : "bg-warning/12 text-warning",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
export function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon?: ReactNode;
}) {
  return (
    <div className="panel relative overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="text-muted-foreground">{icon ?? <ArrowUpRight className="size-4" />}</span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums lg:text-[27px]">
        {value}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
export function QueryState({
  loading,
  error,
  retry,
  empty = false,
}: {
  loading?: boolean;
  error?: Error | null;
  retry?: () => void;
  empty?: boolean;
}) {
  if (loading)
    return (
      <div
        role="status"
        className="panel flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-muted-foreground"
      >
        <LoaderCircle className="size-6 animate-spin" />
        Loading your workspace…
      </div>
    );
  if (error)
    return (
      <div
        role="alert"
        className="panel flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center"
      >
        <AlertCircle className="text-destructive" />
        <h2 className="font-semibold">We couldn’t load this workspace</h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  if (empty)
    return (
      <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
        <Inbox className="size-8 text-muted-foreground/50" />
        <p className="font-semibold">No matching records</p>
        <p className="text-sm text-muted-foreground">Try another search or add a new record.</p>
      </div>
    );
  return null;
}
