export type ModuleId =
  | "projects"
  | "documents"
  | "finance"
  | "procurement"
  | "suppliers"
  | "inventory"
  | "payroll-hr"
  | "customers"
  | "reports"
  | "admin"
  | "tenders";
export interface BusinessRecord {
  id: string;
  module: ModuleId;
  title: string;
  owner: string;
  detail: string;
  status: string;
  amount: number;
  date: string;
  progress: number;
}
export type RecordInput = Omit<BusinessRecord, "id"> & { id?: string };
export interface InvoiceLine {
  id: string;
  description: string;
  qty: number;
  rate: number;
}
export interface Invoice {
  id: string;
  customer: string;
  status: string;
  issueDate: string;
  dueDate: string;
  lines: InvoiceLine[];
  notes: string;
}
export interface Receipt {
  supplier: string;
  reference: string;
  date: string;
  project: string;
  category: string;
  subtotal: number;
  vat: number;
  total: number;
}
/** Implement this contract with your API client; components never call fetch directly. */
export interface OperationsRepository {
  listRecords(): Promise<BusinessRecord[]>;
  saveRecord(input: RecordInput): Promise<BusinessRecord>;
  deleteRecord(id: string): Promise<void>;
  listInvoices(): Promise<Invoice[]>;
  saveInvoice(input: Invoice): Promise<Invoice>;
  confirmReceipt(input: Receipt): Promise<BusinessRecord>;
}
