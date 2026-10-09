import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Eye, FilePlus2, Plus, Printer, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueryState, StatusBadge } from "@/components/workspace-ui";
import { useInvoices, useSaveInvoice } from "@/data/hooks";
import { invoiceTotals, validateInvoice } from "@/data/repository";
import type { Invoice } from "@/data/types";
import { formatDate, money } from "@/lib/format";
export const Route = createFileRoute("/invoices/new")({
  head: () => ({ meta: [{ title: "Invoices · Star Africa OS" }] }),
  component: InvoicePage,
});
const initialInvoice: Invoice = {
  id: "INV-2026-048",
  customer: "Kampala Capital City Authority",
  status: "Draft",
  issueDate: "2026-10-09",
  dueDate: "2026-11-08",
  notes: "Payment due within 30 days. Please include the invoice reference with your payment.",
  lines: [
    {
      id: "line-1",
      description: "Drainage channel construction — Phase 2",
      qty: 1,
      rate: 68000000,
    },
    { id: "line-2", description: "Site supervision and quality assurance", qty: 4, rate: 4500000 },
  ],
};
function InvoicePage() {
  const [draft, setDraft] = useState<Invoice>(initialInvoice);
  const [preview, setPreview] = useState(true);
  const [saved, setSaved] = useState(false);
  const [validation, setValidation] = useState("");
  const [dirty, setDirty] = useState(false);
  const query = useInvoices();
  const save = useSaveInvoice();
  const totals = invoiceTotals(draft);
  const update = (patch: Partial<Invoice>) => {
    setDraft((old) => ({ ...old, ...patch }));
    setDirty(true);
    setSaved(false);
    setValidation("");
  };
  const changeDocument = (invoice: Invoice) => {
    if (dirty && !window.confirm("Discard your unsaved invoice changes?")) return;
    setDraft(structuredClone(invoice));
    setDirty(false);
    setSaved(false);
    setValidation("");
    save.reset();
  };
  const print = () => {
    try {
      validateInvoice(draft);
      setValidation("");
      window.print();
    } catch (error) {
      setValidation((error as Error).message);
    }
  };
  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Create clear invoices, review the details, and keep payments moving.
        </p>
        <Button
          variant="outline"
          onClick={() =>
            changeDocument({
              ...initialInvoice,
              id: `INV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
              customer: "",
              lines: [{ id: crypto.randomUUID(), description: "", qty: 1, rate: 0 }],
            })
          }
        >
          <FilePlus2 />
          New invoice
        </Button>
      </div>
      <div className="no-print panel flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary/5 text-primary">
            <FilePlus2 className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{draft.id}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {saved ? "Saved in this session" : dirty ? "Unsaved changes" : "Invoice workspace"}
            </p>
          </div>
          <StatusBadge status={draft.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPreview((v) => !v)}>
            <Eye />
            {preview ? "Hide preview" : "Show preview"}
          </Button>
          <Button variant="outline" onClick={print}>
            <Printer />
            Print
          </Button>
          <Button form="invoice-form" type="submit" disabled={save.isPending}>
            {saved ? <Check /> : <Save />}
            {save.isPending ? "Saving…" : "Save invoice"}
          </Button>
        </div>
      </div>
      <div className={`grid min-w-0 gap-6 ${preview ? "2xl:grid-cols-[1fr_1fr]" : ""}`}>
        <form
          id="invoice-form"
          className="no-print panel min-w-0 p-5 md:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            try {
              validateInvoice(draft);
              setValidation("");
              save.mutate(draft, {
                onSuccess: () => {
                  setSaved(true);
                  setDirty(false);
                  toast.success("Invoice saved", {
                    description: "Available in your session invoice register.",
                  });
                },
              });
            } catch (error) {
              setValidation((error as Error).message);
            }
          }}
        >
          <div className="mb-6 border-b pb-5">
            <h2 className="text-sm font-semibold">Invoice details</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              All amounts in Ugandan shillings (UGX).
            </p>
          </div>
          <fieldset disabled={save.isPending} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field-label">
                Customer
                <Input
                  required
                  value={draft.customer}
                  onChange={(e) => update({ customer: e.target.value })}
                  placeholder="Customer or company name"
                />
              </label>
              <label className="field-label">
                Status
                <select
                  className="select-field"
                  value={draft.status}
                  onChange={(e) => update({ status: e.target.value })}
                >
                  {["Draft", "Issued", "Paid", "Overdue"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                Issue date
                <Input
                  required
                  type="date"
                  value={draft.issueDate}
                  onChange={(e) => update({ issueDate: e.target.value })}
                />
              </label>
              <label className="field-label">
                Due date
                <Input
                  required
                  type="date"
                  min={draft.issueDate}
                  value={draft.dueDate}
                  onChange={(e) => update({ dueDate: e.target.value })}
                />
              </label>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Line items</h3>
              <div className="space-y-3">
                {draft.lines.map((line, index) => (
                  <div
                    key={line.id}
                    className="grid grid-cols-[1fr_1fr_36px] items-end gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_65px_120px_36px]"
                  >
                    <label className="field-label col-span-3 sm:col-span-1">
                      Description
                      <Input
                        required
                        aria-label={`Line ${index + 1} description`}
                        value={line.description}
                        onChange={(e) =>
                          update({
                            lines: draft.lines.map((l) =>
                              l.id === line.id ? { ...l, description: e.target.value } : l,
                            ),
                          })
                        }
                      />
                    </label>
                    <label className="field-label">
                      Qty
                      <Input
                        required
                        aria-label={`Line ${index + 1} quantity`}
                        type="number"
                        min="0.01"
                        step="any"
                        value={line.qty}
                        onChange={(e) =>
                          update({
                            lines: draft.lines.map((l) =>
                              l.id === line.id ? { ...l, qty: Number(e.target.value) } : l,
                            ),
                          })
                        }
                      />
                    </label>
                    <label className="field-label">
                      Rate
                      <Input
                        required
                        aria-label={`Line ${index + 1} rate`}
                        type="number"
                        min="0"
                        step="1"
                        value={line.rate}
                        onChange={(e) =>
                          update({
                            lines: draft.lines.map((l) =>
                              l.id === line.id ? { ...l, rate: Number(e.target.value) } : l,
                            ),
                          })
                        }
                      />
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete line ${index + 1}`}
                      onClick={() => update({ lines: draft.lines.filter((l) => l.id !== line.id) })}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                className="mt-3"
                variant="outline"
                size="sm"
                type="button"
                onClick={() =>
                  update({
                    lines: [
                      ...draft.lines,
                      { id: crypto.randomUUID(), description: "", qty: 1, rate: 0 },
                    ],
                  })
                }
              >
                <Plus />
                Add line item
              </Button>
            </div>
            <div className="grid gap-5 border-t pt-5 sm:grid-cols-2">
              <label className="field-label">
                Payment notes
                <textarea
                  className="select-field min-h-28 py-3"
                  value={draft.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                />
              </label>
              <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{money(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (18%)</span>
                  <span>{money(totals.vat)}</span>
                </div>
                <div className="flex justify-between border-t pt-3 text-sm font-semibold">
                  <span>Total</span>
                  <span>{money(totals.total)}</span>
                </div>
              </div>
            </div>
          </fieldset>
          {(validation || save.error) && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-destructive/5 p-3 text-sm text-destructive"
            >
              {validation || save.error?.message}
            </p>
          )}
        </form>
        <div className={preview ? "min-w-0" : "hidden print:block"}>
          <InvoicePreview invoice={draft} />
        </div>
      </div>
      <section className="no-print panel overflow-hidden">
        <div className="border-b p-5">
          <h2 className="text-sm font-semibold">Invoice register</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Open an existing invoice to review or update it.
          </p>
        </div>
        {query.isPending || query.isError ? (
          <QueryState loading={query.isPending} error={query.error} retry={() => query.refetch()} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Due date</th>
                  <th>Status</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <button
                        className="font-semibold text-primary"
                        onClick={() => changeDocument(invoice)}
                      >
                        {invoice.id}
                      </button>
                    </td>
                    <td>{invoice.customer}</td>
                    <td className="whitespace-nowrap">{formatDate(invoice.dueDate)}</td>
                    <td>
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="whitespace-nowrap text-right font-semibold">
                      {money(invoiceTotals(invoice).total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const totals = invoiceTotals(invoice);
  return (
    <section className="print-sheet panel min-h-[660px] p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-7">
        <img
          src="/brand/star-africa.png"
          alt="Star Africa Logistics"
          className="h-20 w-40 rounded bg-white object-contain p-2"
        />
        <div className="text-right">
          <p className="eyebrow">CUSTOMER INVOICE</p>
          <p className="mt-2 text-sm font-semibold">{invoice.id}</p>
          <div className="mt-3">
            <StatusBadge status={invoice.status} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 py-7 text-xs">
        <div>
          <p className="eyebrow">BILL TO</p>
          <p className="mt-2 font-semibold">{invoice.customer || "Customer name"}</p>
          <p className="mt-1 text-muted-foreground">Kampala, Uganda</p>
        </div>
        <div className="space-y-2 text-right">
          <p>
            <span className="text-muted-foreground">Issued: </span>
            {invoice.issueDate ? formatDate(invoice.issueDate) : "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Due: </span>
            {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
          </p>
        </div>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="border-y bg-muted">
          <tr>
            <th className="py-3 pl-2 font-medium">Description</th>
            <th className="px-2 py-3 text-center font-medium">Qty</th>
            <th className="py-3 pr-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line) => (
            <tr key={line.id} className="border-b">
              <td className="py-4 pl-2">{line.description || "Line item"}</td>
              <td className="px-2 text-center">{line.qty}</td>
              <td className="py-4 pr-2 text-right tabular-nums">{money(line.qty * line.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ml-auto mt-6 max-w-xs space-y-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{money(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">VAT (18%)</span>
          <span>{money(totals.vat)}</span>
        </div>
        <div className="flex justify-between border-t pt-4 text-base font-semibold">
          <span>Invoice total</span>
          <span>{money(totals.total)}</span>
        </div>
      </div>
      <div className="mt-12 border-t pt-5">
        <p className="eyebrow">PAYMENT NOTES</p>
        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
          {invoice.notes || "No additional notes."}
        </p>
        <p className="mt-8 text-center text-[10px] text-muted-foreground">
          Star Africa Logistics · Thank you for your business.
        </p>
      </div>
    </section>
  );
}
