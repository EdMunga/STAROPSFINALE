import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { modules } from "@/data/modules";
import { useDeleteRecord, useSaveRecord } from "@/data/hooks";
import type { BusinessRecord, ModuleId, RecordInput } from "@/data/types";
export function RecordEditor({
  module,
  record,
  onClose,
}: {
  module: ModuleId;
  record?: BusinessRecord;
  onClose: () => void;
}) {
  const definition = modules[module];
  const [draft, setDraft] = useState<RecordInput>(
    record ?? {
      module,
      title: "",
      owner: "",
      detail: "",
      amount: 0,
      date: "2026-10-09",
      status: definition.statuses[0]!,
      progress: 0,
    },
  );
  const save = useSaveRecord();
  const remove = useDeleteRecord();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (key: keyof RecordInput, value: string | number) =>
    setDraft((old) => ({ ...old, [key]: value }));
  const busy = save.isPending || remove.isPending;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <p className="eyebrow">{definition.title}</p>
          <DialogTitle>
            {record ? "Edit" : "New"} {definition.singular}
          </DialogTitle>
          <DialogDescription>
            {record
              ? `Update ${record.id} and keep your team aligned.`
              : "Add the details below to create a record."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(draft, {
              onSuccess: () => {
                toast.success(`${definition.title} updated`);
                onClose();
              },
            });
          }}
        >
          <label className="field-label">
            Name
            <Input
              required
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={`Enter ${definition.singular} name`}
            />
          </label>
          <label className="field-label">
            {definition.ownerLabel}
            <Input required value={draft.owner} onChange={(e) => set("owner", e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="field-label">
              Status
              <select
                className="select-field"
                value={draft.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {definition.statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="field-label">
              {module === "tenders" ? "Deadline" : "Date"}
              <Input
                required
                type="date"
                value={draft.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </label>
          </div>
          <label className="field-label">
            {definition.amountLabel}
            <Input
              required
              type="number"
              min="0"
              step="1"
              value={draft.amount}
              onChange={(e) => set("amount", Number(e.target.value))}
            />
          </label>
          {module === "projects" && (
            <label className="field-label">
              Completion (%)
              <Input
                type="number"
                min="0"
                max="100"
                value={draft.progress}
                onChange={(e) => set("progress", Number(e.target.value))}
              />
            </label>
          )}
          <label className="field-label">
            Details
            <textarea
              className="select-field min-h-24 resize-y py-3"
              value={draft.detail}
              onChange={(e) => set("detail", e.target.value)}
              placeholder="Location, reference or notes"
            />
          </label>
          {(save.error || remove.error) && (
            <p role="alert" className="text-sm text-destructive">
              {save.error?.message ?? remove.error?.message}
            </p>
          )}
          {confirmDelete && (
            <div className="rounded-lg bg-destructive/5 p-3 text-sm">
              <p>Delete this record from the current workspace?</p>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    record &&
                    remove.mutate(record.id, {
                      onSuccess: () => {
                        toast.success("Record deleted");
                        onClose();
                      },
                    })
                  }
                >
                  Confirm delete
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                >
                  Keep record
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-4">
            {record ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={busy}>{save.isPending ? "Saving…" : "Save record"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
