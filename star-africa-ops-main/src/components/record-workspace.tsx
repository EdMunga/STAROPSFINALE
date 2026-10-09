import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Download, Plus, Search, ScanLine } from "lucide-react";
import { modules } from "@/data/modules";
import { useRecords } from "@/data/hooks";
import type { BusinessRecord, ModuleId } from "@/data/types";
import { compactMoney, exportCsv, formatDate } from "@/lib/format";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { QueryState, StatCard, StatusBadge } from "./workspace-ui";
import { RecordEditor } from "./record-editor";
export function RecordWorkspace({ module }: { module: ModuleId }) {
  const definition = modules[module];
  const query = useRecords();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<BusinessRecord | "new" | null>(null);
  const records = (query.data ?? []).filter((row) => row.module === module);
  const filtered = records.filter(
    (row) =>
      `${row.title} ${row.owner} ${row.id} ${row.detail}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "All statuses" || row.status === status),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const activePage = Math.min(page, pages);
  if (query.isPending || query.isError)
    return (
      <QueryState loading={query.isPending} error={query.error} retry={() => query.refetch()} />
    );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-sm text-muted-foreground">{definition.description}</p>
        <Button onClick={() => setEditing("new")}>
          <Plus />
          New {definition.singular}
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={`Total ${definition.title.toLowerCase()}`}
          value={String(records.length).padStart(2, "0")}
          detail="Across your workspace"
        />
        <StatCard
          label={definition.amountLabel.replace(" (UGX)", "")}
          value={compactMoney(records.reduce((sum, row) => sum + row.amount, 0))}
          detail="Combined recorded value"
        />
        <StatCard
          label="Needs attention"
          value={String(
            records.filter((row) =>
              [
                "Pending",
                "In review",
                "At risk",
                "Delayed",
                "Low stock",
                "Draft",
                "Requested",
              ].includes(row.status),
            ).length,
          ).padStart(2, "0")}
          detail="Review and follow up"
        />
      </div>
      {module === "documents" && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/15 bg-primary/5 p-5">
          <div className="flex items-center gap-3">
            <ScanLine className="text-primary" />
            <div>
              <p className="text-sm font-semibold">Turn receipts into expense records</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Review the sample receipt and verify extracted amounts.
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/documents/ocr-review">
              Review receipt
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
      )}
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="relative min-w-48 flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              aria-label={`Search ${definition.title}`}
              placeholder={`Search ${definition.title.toLowerCase()}…`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="select-field w-auto"
              aria-label="Filter by status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option>All statuses</option>
              {definition.statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() =>
                exportCsv(module, [
                  [
                    "Reference",
                    "Name",
                    definition.ownerLabel,
                    "Status",
                    "Amount UGX",
                    "Date",
                    "Details",
                  ],
                  ...filtered.map((row) => [
                    row.id,
                    row.title,
                    row.owner,
                    row.status,
                    row.amount,
                    row.date,
                    row.detail,
                  ]),
                ])
              }
            >
              <Download />
              Export
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{definition.singular}</th>
                <th>{definition.ownerLabel}</th>
                <th>Status</th>
                <th>{module === "projects" ? "Progress" : "Date"}</th>
                <th className="text-right">{definition.amountLabel.replace(" (UGX)", "")}</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((activePage - 1) * 8, activePage * 8).map((row) => (
                <tr key={row.id}>
                  <td>
                    <button
                      onClick={() => setEditing(row)}
                      className="text-left font-semibold hover:text-primary"
                    >
                      {row.title}
                    </button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.id} · {row.detail}
                    </p>
                  </td>
                  <td>{row.owner}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>
                    {module === "projects" ? (
                      <div className="min-w-24">
                        <p className="mb-2 text-xs">{row.progress}%</p>
                        <Progress value={row.progress} className="h-1.5" />
                      </div>
                    ) : (
                      <span className="whitespace-nowrap text-xs">{formatDate(row.date)}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-right font-medium tabular-nums">
                    {compactMoney(row.amount)}
                  </td>
                  <td>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${row.title}`}
                      onClick={() => setEditing(row)}
                    >
                      <ArrowUpRight className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <QueryState empty />}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-xs text-muted-foreground">
          <span>
            {filtered.length} records · Page {activePage} of {pages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={activePage === 1}
              onClick={() => setPage(activePage - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={activePage === pages}
              onClick={() => setPage(activePage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
      {editing && (
        <RecordEditor
          module={module}
          {...(editing === "new" ? {} : { record: editing })}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
