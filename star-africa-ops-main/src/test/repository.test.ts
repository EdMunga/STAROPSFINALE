import { describe, expect, it } from "vitest";
import { createMockRepository, invoiceTotals } from "@/data/repository";
import { seedInvoices, seedRecords } from "@/data/seed";
import type { Receipt } from "@/data/types";

describe("Operations repository contract", () => {
  it("keeps sessions isolated and returned records detached from the store", async () => {
    const first = createMockRepository(0);
    const second = createMockRepository(0);
    const rows = await first.listRecords();
    rows[0]!.title = "Mutated outside repository";
    expect((await first.listRecords())[0]!.title).toBe(seedRecords[0]!.title);
    await first.deleteRecord(seedRecords[0]!.id);
    expect(await first.listRecords()).toHaveLength(seedRecords.length - 1);
    expect(await second.listRecords()).toHaveLength(seedRecords.length);
  });
  it("creates and updates a record without duplicating it, and rejects invalid amounts", async () => {
    const api = createMockRepository(0);
    const { id: _id, ...input } = seedRecords[0]!;
    const saved = await api.saveRecord({ ...input, title: "New project" });
    await api.saveRecord({ ...saved, progress: 90 });
    const rows = await api.listRecords();
    expect(rows.filter((row) => row.id === saved.id)).toHaveLength(1);
    expect(rows.find((row) => row.id === saved.id)?.progress).toBe(90);
    await expect(api.saveRecord({ ...input, amount: -1 })).rejects.toThrow("amount");
  });
  it("calculates rounded VAT and validates invoice lines and dates before saving", async () => {
    const api = createMockRepository(0);
    const invoice = structuredClone(seedInvoices[0]!);
    expect(invoiceTotals(invoice)).toEqual({ subtotal: 68000000, vat: 12240000, total: 80240000 });
    await expect(api.saveInvoice({ ...invoice, dueDate: "2026-01-01" })).rejects.toThrow(
      "Due date",
    );
    await expect(api.saveInvoice({ ...invoice, lines: [] })).rejects.toThrow("at least one");
    await api.saveInvoice({ ...invoice, customer: "Updated customer" });
    expect((await api.listInvoices()).find((row) => row.id === invoice.id)?.customer).toBe(
      "Updated customer",
    );
  });
  it("posts balanced receipts once and exposes the expense in finance", async () => {
    const api = createMockRepository(0);
    const receipt: Receipt = {
      supplier: "Build Mart",
      reference: "BM-18472",
      date: "2026-10-05",
      project: "Kampala",
      category: "Materials",
      subtotal: 1694915,
      vat: 305085,
      total: 2000000,
    };
    await expect(api.confirmReceipt({ ...receipt, total: 100 })).rejects.toThrow("add up");
    const record = await api.confirmReceipt(receipt);
    expect(record).toMatchObject({ module: "finance", status: "Pending", amount: 2000000 });
    expect((await api.listRecords()).some((row) => row.id === record.id)).toBe(true);
    await expect(api.confirmReceipt(receipt)).rejects.toThrow("already been posted");
  });
});
