import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Download,
  KanbanSquare,
  List,
  Plus,
  Search,
} from "lucide-react";
import { useRecords } from "@/data/hooks";
import type { BusinessRecord } from "@/data/types";
import { modules } from "@/data/modules";
import { compactMoney, formatDate, exportCsv } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecordEditor } from "@/components/record-editor";
import { QueryState, StatCard, StatusBadge } from "@/components/workspace-ui";
export const Route = createFileRoute("/tenders")({
  head: () => ({ meta: [{ title: "Bids & Tenders · Star Africa OS" }] }),
  component: TendersPage,
});
function TendersPage() {
  const query = useRecords();
  const [view, setView] = useState("board");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All stages");
  const [editing, setEditing] = useState<BusinessRecord | "new" | null>(null);
  const all = (query.data ?? []).filter((row) => row.module === "tenders");
  const rows = all.filter(
    (row) =>
      `${row.title} ${row.owner} ${row.id}`.toLowerCase().includes(search.toLowerCase()) &&
      (status === "All stages" || row.status === status),
  );
  const active = all.filter((row) => !["Won", "Lost"].includes(row.status));
  const closed = all.filter((row) => ["Won", "Lost"].includes(row.status));
  if (query.isPending || query.isError)
    return (
      <QueryState loading={query.isPending} error={query.error} retry={() => query.refetch()} />
    );
  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">A clear path from opportunity to award.</p>
        <Button onClick={() => setEditing("new")}>
          <Plus />
          New tender
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active opportunities"
          value={String(active.length).padStart(2, "0")}
          detail="Across five pipeline stages"
        />
        <StatCard
          label="Active pipeline value"
          value={compactMoney(active.reduce((sum, row) => sum + row.amount, 0))}
          detail="Excludes won and lost tenders"
        />
        <StatCard
          label="Award success"
          value={
            closed.length
              ? `${Math.round((all.filter((row) => row.status === "Won").length / closed.length) * 100)}%`
              : "—"
          }
          detail={`${closed.length} decided opportunities`}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search tenders…"
            aria-label="Search tenders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filter tender stage"
            className="select-field w-auto"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All stages</option>
            {modules.tenders.statuses.map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
          <Button
            variant="outline"
            aria-label="Export tenders"
            onClick={() =>
              exportCsv("tenders", [
                ["Reference", "Tender", "Buyer", "Value UGX", "Stage", "Deadline"],
                ...rows.map((row) => [
                  row.id,
                  row.title,
                  row.owner,
                  row.amount,
                  row.status,
                  row.date,
                ]),
              ])
            }
          >
            <Download />
          </Button>
          <div className="flex rounded-lg border bg-card p-1">
            <Button
              size="sm"
              variant={view === "board" ? "secondary" : "ghost"}
              aria-pressed={view === "board"}
              onClick={() => setView("board")}
            >
              <KanbanSquare className="size-3.5" />
              Board
            </Button>
            <Button
              size="sm"
              variant={view === "table" ? "secondary" : "ghost"}
              aria-pressed={view === "table"}
              onClick={() => setView("table")}
            >
              <List className="size-3.5" />
              Table
            </Button>
          </div>
        </div>
      </div>
      {view === "board" ? (
        <div
          className="overflow-x-auto pb-4"
          tabIndex={0}
          role="region"
          aria-label="Tender pipeline board"
        >
          <div className="flex min-w-max gap-4">
            {modules.tenders.statuses
              .filter((stage) => status === "All stages" || stage === status)
              .map((stage) => (
                <section
                  className="w-[260px] rounded-xl border border-border/60 bg-muted/45 p-3"
                  key={stage}
                >
                  <div className="mb-4 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full ${stage === "Won" ? "bg-success" : stage === "Lost" ? "bg-destructive" : stage === "Preparing" ? "bg-accent-strong" : "bg-primary/50"}`}
                      />
                      <h2 className="text-xs font-semibold">{stage}</h2>
                      <span className="rounded bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {rows.filter((row) => row.status === stage).length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {rows
                      .filter((row) => row.status === stage)
                      .map((row) => (
                        <button
                          key={row.id}
                          onClick={() => setEditing(row)}
                          className="panel w-full p-4 text-left transition-shadow hover:border-primary/30 hover:shadow-md"
                        >
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>{row.id}</span>
                            <ArrowUpRight className="size-3.5" />
                          </div>
                          <h3 className="mt-3 text-sm font-semibold leading-relaxed">
                            {row.title}
                          </h3>
                          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                            {row.owner}
                          </p>
                          <p className="mt-5 text-base font-semibold">{compactMoney(row.amount)}</p>
                          <div className="mt-4 flex items-center gap-1.5 border-t pt-3 text-[10px] text-muted-foreground">
                            <CalendarDays className="size-3" />
                            Deadline · {formatDate(row.date)}
                          </div>
                        </button>
                      ))}
                    {!rows.some((row) => row.status === stage) && (
                      <div className="grid h-36 place-items-center rounded-lg border border-dashed text-xs text-muted-foreground">
                        No opportunities
                      </div>
                    )}
                  </div>
                  <p className="mt-4 px-1 text-[10px] text-muted-foreground">
                    {compactMoney(
                      rows
                        .filter((row) => row.status === stage)
                        .reduce((sum, row) => sum + row.amount, 0),
                    )}{" "}
                    total value
                  </p>
                </section>
              ))}
          </div>
        </div>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tender</th>
                <th>Procuring entity</th>
                <th>Value</th>
                <th>Deadline</th>
                <th>Stage</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <button className="text-left font-semibold" onClick={() => setEditing(row)}>
                      {row.title}
                    </button>
                    <p className="mt-1 text-[10px] text-muted-foreground">{row.id}</p>
                  </td>
                  <td>{row.owner}</td>
                  <td className="whitespace-nowrap">{compactMoney(row.amount)}</td>
                  <td className="whitespace-nowrap">{formatDate(row.date)}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${row.title}`}
                      onClick={() => setEditing(row)}
                    >
                      <ArrowUpRight />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <QueryState empty />}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">
        {rows.length} opportunities · Open a tender to update details or move it to another stage.
      </p>
      {editing && (
        <RecordEditor
          module="tenders"
          {...(editing === "new" ? {} : { record: editing })}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
