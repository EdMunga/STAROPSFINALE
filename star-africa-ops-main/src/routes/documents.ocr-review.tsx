import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ArrowUpRight, FileImage, RotateCcw, ScanLine, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirmReceipt, useRecords } from "@/data/hooks";
import type { Receipt } from "@/data/types";
export const Route = createFileRoute("/documents/ocr-review")({
  head: () => ({ meta: [{ title: "Receipt review · Star Africa OS" }] }),
  component: OcrReviewPage,
});
function OcrReviewPage() {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [receipt, setReceipt] = useState<Receipt>({
    supplier: "Build Mart Uganda Ltd",
    reference: "BM-18472",
    date: "2026-10-05",
    project: "Kampala Logistics Hub",
    category: "Construction materials",
    subtotal: 1694915,
    vat: 305085,
    total: 2000000,
  });
  const confirm = useConfirmReceipt();
  const query = useRecords();
  const set = (key: keyof Receipt, value: string | number) =>
    setReceipt((old) => ({ ...old, [key]: value }));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Verify the extracted details before adding an expense to finance.
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Sample receipt · Receipt_20261005_0934.jpg
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-2 text-[11px] font-medium text-success">
          <ScanLine className="size-3.5" />
          94% extraction confidence
        </span>
      </div>
      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <section className="panel min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
            <span className="flex items-center gap-2 text-xs font-medium">
              <FileImage className="size-4" />
              Original receipt
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                aria-label="Zoom out"
                disabled={zoom <= 70}
                onClick={() => setZoom((v) => v - 10)}
              >
                <ZoomOut />
              </Button>
              <span className="w-10 text-center text-xs tabular-nums">{zoom}%</span>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Zoom in"
                disabled={zoom >= 150}
                onClick={() => setZoom((v) => v + 10)}
              >
                <ZoomIn />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Rotate receipt"
                onClick={() => setRotation((v) => (v + 90) % 360)}
              >
                <RotateCcw />
              </Button>
            </div>
          </div>
          <div className="h-[620px] overflow-auto bg-muted/60 p-6">
            <div
              className="grid min-h-full place-items-center"
              style={{
                minWidth: zoom > 100 ? 480 * (zoom / 100) : undefined,
                minHeight: 620 * (zoom / 100),
              }}
            >
              <div
                className="w-[290px] max-w-full bg-white p-6 font-mono text-[10px] leading-relaxed text-slate-800 shadow-lg sm:w-[340px] sm:p-8"
                style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
              >
                <div className="text-center">
                  <p className="text-sm font-bold">BUILD MART UGANDA LTD</p>
                  <p>Plot 42, Industrial Area, Kampala</p>
                  <p>TIN: 1000028491</p>
                  <p className="mt-5 border-y border-dashed py-2 font-bold">
                    TAX INVOICE / RECEIPT
                  </p>
                </div>
                <div className="mt-5">
                  <p>Receipt No: BM-18472</p>
                  <p>Date: 05/10/2026 · 09:34</p>
                  <p>Cashier: ESTHER K.</p>
                </div>
                <div className="my-5 space-y-2 border-y border-dashed py-4">
                  {[
                    ["Portland Cement x 40", "1,520,000"],
                    ["Binding Wire x 12", "360,000"],
                    ["Delivery", "120,000"],
                  ].map(([label, amount]) => (
                    <div className="flex justify-between gap-2" key={label}>
                      <span>{label}</span>
                      <span>{amount}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-right">
                  <p>SUBTOTAL 1,694,915</p>
                  <p>VAT 18% 305,085</p>
                  <p className="border-y border-dashed py-3 text-sm font-bold">
                    TOTAL UGX 2,000,000
                  </p>
                  <p>PAID: MOBILE MONEY</p>
                </div>
                <div className="mt-8 text-center">
                  <p>Thank you for shopping with us!</p>
                  <div
                    className="mx-auto mt-5 h-8 w-40"
                    style={{
                      background:
                        "repeating-linear-gradient(90deg,#334155 0px,#334155 2px,white 2px,white 5px)",
                    }}
                  />
                  <p className="mt-2 tracking-[0.2em]">BM18472</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="panel p-5 md:p-6">
          <div className="mb-6 border-b pb-5">
            <p className="eyebrow">VERIFICATION</p>
            <h2 className="mt-2 text-base font-semibold">Extracted information</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Check the values against the original receipt.
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              confirm.mutate(receipt, {
                onSuccess: () =>
                  toast.success("Receipt posted to finance", {
                    description: "The expense is pending approval.",
                  }),
              });
            }}
          >
            <fieldset
              disabled={confirm.isPending || confirm.isSuccess}
              className="grid gap-5 sm:grid-cols-2"
            >
              <label className="field-label sm:col-span-2">
                Supplier
                <Input
                  required
                  value={receipt.supplier}
                  onChange={(e) => set("supplier", e.target.value)}
                />
              </label>
              <label className="field-label">
                Receipt reference
                <Input
                  required
                  value={receipt.reference}
                  onChange={(e) => set("reference", e.target.value)}
                />
              </label>
              <label className="field-label">
                Receipt date
                <Input
                  required
                  type="date"
                  value={receipt.date}
                  onChange={(e) => set("date", e.target.value)}
                />
              </label>
              <label className="field-label">
                Subtotal (UGX)
                <Input
                  required
                  min="0"
                  type="number"
                  value={receipt.subtotal}
                  onChange={(e) => set("subtotal", Number(e.target.value))}
                />
              </label>
              <label className="field-label">
                VAT (UGX)
                <Input
                  required
                  min="0"
                  type="number"
                  value={receipt.vat}
                  onChange={(e) => set("vat", Number(e.target.value))}
                />
              </label>
              <label className="field-label sm:col-span-2">
                Total paid (UGX)
                <Input
                  required
                  min="1"
                  type="number"
                  className="font-semibold"
                  value={receipt.total}
                  onChange={(e) => set("total", Number(e.target.value))}
                />
              </label>
              <label className="field-label sm:col-span-2">
                Expense category
                <select
                  className="select-field"
                  value={receipt.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {["Construction materials", "Equipment", "Transport & logistics"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="field-label sm:col-span-2">
                Project
                <select
                  className="select-field"
                  value={receipt.project}
                  onChange={(e) => set("project", e.target.value)}
                >
                  {(query.data ?? [])
                    .filter((r) => r.module === "projects")
                    .map((r) => (
                      <option key={r.id}>{r.title}</option>
                    ))}
                </select>
              </label>
            </fieldset>
            {confirm.error && (
              <p role="alert" className="mt-4 text-sm text-destructive">
                {confirm.error.message}
              </p>
            )}
            {confirm.isSuccess ? (
              <div role="status" className="mt-6 rounded-lg bg-success/10 p-4 text-sm text-success">
                <p className="flex items-center gap-2 font-semibold">
                  <Check className="size-4" />
                  Expense created
                </p>
                <p className="mt-1 text-xs">This receipt is now in finance, pending approval.</p>
                <Button asChild variant="link" className="mt-2 h-auto p-0 text-success">
                  <Link to="/$module" params={{ module: "finance" }}>
                    View finance
                    <ArrowUpRight className="size-3" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-6 flex justify-end border-t pt-5">
                <Button disabled={confirm.isPending}>
                  <Check />
                  {confirm.isPending ? "Posting…" : "Confirm & post expense"}
                </Button>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
