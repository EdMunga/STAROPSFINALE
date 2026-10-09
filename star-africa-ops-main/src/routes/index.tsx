import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Download,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QueryState, StatCard, StatusBadge } from "@/components/workspace-ui";
import { RecordEditor } from "@/components/record-editor";
import { useRecords, useInvoices } from "@/data/hooks";
import { invoiceTotals } from "@/data/repository";
import { compactMoney, exportCsv, formatDate } from "@/lib/format";
import type { BusinessRecord } from "@/data/types";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Business overview · Star Africa OS" }] }),
  component: Dashboard,
});
function Dashboard() {
  const query = useRecords();
  const invoiceQuery = useInvoices();
  const [selected, setSelected] = useState<BusinessRecord | null>(null);
  if (query.isPending || invoiceQuery.isPending || query.isError || invoiceQuery.isError)
    return (
      <QueryState
        loading={query.isPending || invoiceQuery.isPending}
        error={query.error ?? invoiceQuery.error}
        retry={() => {
          void query.refetch();
          void invoiceQuery.refetch();
        }}
      />
    );
  const records = query.data;
  const projects = records.filter((r) => r.module === "projects");
  const tenders = records.filter((r) => r.module === "tenders");
  const finance = records.filter((r) => r.module === "finance");
  const received = finance
    .filter((r) => r.status === "Received")
    .reduce((sum, r) => sum + r.amount, 0);
  const paid = finance.filter((r) => r.status === "Paid").reduce((sum, r) => sum + r.amount, 0);
  const receivables = invoiceQuery.data
    .filter((r) => ["Issued", "Overdue"].includes(r.status))
    .reduce((sum, r) => sum + invoiceTotals(r).total, 0);
  const pending = finance
    .filter((r) => r.status === "Pending")
    .reduce((sum, r) => sum + r.amount, 0);
  const alerts = records.filter((r) =>
    ["At risk", "Delayed", "Low stock", "Pending"].includes(r.status),
  );
  const stages = ["New", "Reviewing", "Preparing", "Submitted", "Awaiting Result", "Won", "Lost"];
  const colors = [
    "bg-slate-300",
    "bg-sky-300",
    "bg-sky-500",
    "bg-primary",
    "bg-indigo-400",
    "bg-success",
    "bg-rose-300",
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Welcome back, Amina. Here’s where your business stands.
        </p>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            October 2026
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportCsv("business-overview", [
                ["Metric", "UGX"],
                ["Received", received],
                ["Paid", paid],
                ["Receivables", receivables],
                ["Pending payments", pending],
              ])
            }
          >
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Cash received"
          value={compactMoney(received)}
          detail="Recorded incoming payments"
          icon={<CircleDollarSign className="size-4" />}
        />
        <StatCard
          label="Operating payments"
          value={compactMoney(paid)}
          detail="Paid expenses in the register"
          icon={<Wallet className="size-4" />}
        />
        <StatCard
          label="Open receivables"
          value={compactMoney(receivables)}
          detail="Issued and overdue invoices"
          icon={<ReceiptText className="size-4" />}
        />
        <StatCard
          label="Pending payments"
          value={compactMoney(pending)}
          detail="Awaiting finance approval"
          icon={<Clock3 className="size-4" />}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <section className="panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">COMMERCIAL OUTLOOK</p>
              <h2 className="mt-2 text-base font-semibold">Tender pipeline</h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/tenders">
                View pipeline
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-[32px] font-semibold tracking-tight">
              {compactMoney(
                tenders
                  .filter((r) => !["Lost", "Won"].includes(r.status))
                  .reduce((sum, r) => sum + r.amount, 0),
              )}
            </span>
            <span className="text-xs text-muted-foreground">in active opportunities</span>
          </div>
          <div className="my-6 flex h-3 gap-1 overflow-hidden rounded-full">
            {stages.map((stage, i) => (
              <div
                title={`${stage}: ${tenders.filter((r) => r.status === stage).length}`}
                key={stage}
                className={colors[i]}
                style={{ flex: tenders.filter((r) => r.status === stage).length }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
            {stages.map((stage, i) => (
              <div key={stage}>
                <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className={`size-2 rounded-full ${colors[i]}`} />
                  {stage}
                </p>
                <p className="ml-4 mt-1 text-lg font-semibold">
                  {tenders.filter((r) => r.status === stage).length}
                  <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                    tenders
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="relative overflow-hidden rounded-xl bg-sidebar p-6 text-sidebar-foreground">
          <div className="absolute -right-10 -top-10 size-48 rounded-full border-[32px] border-white/5" />
          <p className="relative text-[10px] font-medium tracking-[0.12em] text-sidebar-muted">
            PROJECT PORTFOLIO
          </p>
          <div className="relative mt-7 flex items-end gap-3">
            <p className="text-5xl font-medium tracking-tight">
              {String(projects.filter((r) => r.status !== "Completed").length).padStart(2, "0")}
            </p>
            <p className="pb-1 text-xs text-sidebar-muted">
              active projects
              <br />
              across Uganda
            </p>
          </div>
          <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
            <div>
              <p className="text-[10px] text-sidebar-muted">Total portfolio budget</p>
              <p className="mt-1 text-lg font-semibold">
                {compactMoney(projects.reduce((sum, r) => sum + r.amount, 0))}
              </p>
            </div>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link
                to="/$module"
                params={{ module: "projects" }}
                aria-label="Open project portfolio"
              >
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </section>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <section className="panel min-w-0 overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div>
              <h2 className="text-sm font-semibold">Project delivery</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Milestones, progress and the people behind them
              </p>
            </div>
            <Building2 className="size-4 text-muted-foreground" />
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project / lead</th>
                  <th>Status</th>
                  <th>Completion</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {projects.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <button
                        className="text-left font-semibold hover:text-primary"
                        onClick={() => setSelected(row)}
                      >
                        {row.title}
                      </button>
                      <p className="mt-1 text-[11px] text-muted-foreground">{row.owner}</p>
                    </td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td>
                      <div className="flex min-w-28 items-center gap-3">
                        <Progress value={row.progress} className="h-1.5" />
                        <span className="text-[11px] tabular-nums">{row.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Open ${row.title}`}
                        onClick={() => setSelected(row)}
                      >
                        <ArrowUpRight className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link
            to="/$module"
            params={{ module: "projects" }}
            className="flex items-center justify-center gap-2 border-t py-4 text-xs font-medium text-primary"
          >
            View all projects
            <ArrowRight className="size-3" />
          </Link>
        </section>
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Needs your attention</h2>
              <p className="mt-1 text-xs text-muted-foreground">A few things to keep moving</p>
            </div>
            <span className="rounded-full bg-accent px-2 py-1 text-[10px] font-semibold text-accent-foreground">
              {alerts.length}
            </span>
          </div>
          <div className="space-y-1">
            {alerts.slice(0, 5).map((row) => (
              <button
                key={row.id}
                className="flex w-full items-start gap-3 rounded-lg py-3 text-left hover:bg-muted"
                onClick={() => setSelected(row)}
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-strong" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium">{row.title}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {row.status} · {row.owner}
                  </span>
                </span>
                <ChevronIcon />
              </button>
            ))}
          </div>
          {!alerts.length && (
            <p className="py-10 text-center text-xs text-muted-foreground">
              Everything is up to date.
            </p>
          )}
        </section>
      </div>
      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="text-sm font-semibold">Finance register</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Recent payments and expense approvals
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/$module" params={{ module: "finance" }}>
              View all
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Account / payee</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {finance.slice(0, 4).map((row) => (
                <tr key={row.id}>
                  <td>
                    <button className="font-medium" onClick={() => setSelected(row)}>
                      {row.title}
                    </button>
                    <p className="mt-1 text-[10px] text-muted-foreground">{row.id}</p>
                  </td>
                  <td>{row.owner}</td>
                  <td className="whitespace-nowrap">{formatDate(row.date)}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-nowrap text-right font-semibold">
                    {compactMoney(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {selected && (
        <RecordEditor
          module={selected.module}
          record={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
function ChevronIcon() {
  return <ArrowUpRight className="mt-1 size-3.5 text-muted-foreground" />;
}
