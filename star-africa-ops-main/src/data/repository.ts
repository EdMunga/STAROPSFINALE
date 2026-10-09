import { modules } from "./modules";
import { seedInvoices, seedRecords } from "./seed";
import type { Invoice, OperationsRepository, RecordInput } from "./types";
export function invoiceTotals(invoice: Pick<Invoice, "lines">) {
  const subtotal = Math.round(invoice.lines.reduce((sum, line) => sum + line.qty * line.rate, 0));
  const vat = Math.round(subtotal * 0.18);
  return { subtotal, vat, total: subtotal + vat };
}
export function validateInvoice(input: Invoice) {
  if (!input.customer.trim()) throw new Error("Enter a customer name.");
  if (!input.issueDate || !input.dueDate || input.dueDate < input.issueDate)
    throw new Error("Due date must be on or after the issue date.");
  if (
    !input.lines.length ||
    input.lines.some(
      (line) =>
        !line.description.trim() ||
        !Number.isFinite(line.qty) ||
        line.qty <= 0 ||
        !Number.isFinite(line.rate) ||
        line.rate < 0,
    )
  )
    throw new Error("Add at least one line with a description, positive quantity and valid rate.");
}
export function validateRecord(input: RecordInput) {
  if (!input.title.trim() || !input.owner.trim()) throw new Error("Name and owner are required.");
  if (!Number.isFinite(input.amount) || input.amount < 0)
    throw new Error("Enter a valid non-negative amount.");
  if (!input.date || !Number.isFinite(Date.parse(input.date)))
    throw new Error("Choose a valid date.");
  if (input.progress < 0 || input.progress > 100)
    throw new Error("Progress must be between 0 and 100.");
  if (!modules[input.module].statuses.includes(input.status))
    throw new Error("Choose a valid status.");
}
/** One isolated, in-memory repository per mounted app. No browser storage or shared SSR state. */
export function createMockRepository(delay = 180): OperationsRepository {
  let records = structuredClone(seedRecords);
  let invoices = structuredClone(seedInvoices);
  const receipts = new Set<string>();
  const wait = () => new Promise<void>((resolve) => setTimeout(resolve, delay));
  return {
    async listRecords() {
      await wait();
      return structuredClone(records);
    },
    async saveRecord(input) {
      await wait();
      validateRecord(input);
      if (input.id && !records.some((row) => row.id === input.id))
        throw new Error("This record no longer exists. Refresh and try again.");
      const record = {
        ...input,
        title: input.title.trim(),
        id:
          input.id ??
          `${modules[input.module].prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      };
      records = [record, ...records.filter((row) => row.id !== record.id)];
      return structuredClone(record);
    },
    async deleteRecord(id) {
      await wait();
      records = records.filter((row) => row.id !== id);
    },
    async listInvoices() {
      await wait();
      return structuredClone(invoices);
    },
    async saveInvoice(input) {
      await wait();
      validateInvoice(input);
      invoices = [structuredClone(input), ...invoices.filter((row) => row.id !== input.id)];
      return structuredClone(input);
    },
    async confirmReceipt(input) {
      await wait();
      if (!input.supplier.trim() || !input.reference.trim() || !input.project.trim() || !input.date)
        throw new Error("Complete supplier, reference, project and date.");
      if (
        [input.subtotal, input.vat, input.total].some(
          (value) => !Number.isFinite(value) || value < 0,
        ) ||
        input.total === 0 ||
        Math.abs(input.subtotal + input.vat - input.total) > 1
      )
        throw new Error("Subtotal and VAT must add up to the receipt total.");
      const key = `${input.supplier.trim().toLowerCase()}:${input.reference.trim().toLowerCase()}`;
      if (receipts.has(key)) throw new Error("This receipt has already been posted.");
      const record = {
        id: `FIN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        module: "finance" as const,
        title: `${input.supplier} · ${input.reference}`,
        owner: input.supplier,
        detail: `${input.category} · ${input.project}`,
        status: "Pending",
        amount: input.total,
        date: input.date,
        progress: 0,
      };
      records = [record, ...records];
      receipts.add(key);
      return structuredClone(record);
    },
  };
}
