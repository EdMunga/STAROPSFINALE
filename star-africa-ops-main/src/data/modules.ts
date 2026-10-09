import type { ModuleId } from "./types";
export interface ModuleDefinition {
  title: string;
  singular: string;
  description: string;
  ownerLabel: string;
  amountLabel: string;
  statuses: string[];
  prefix: string;
}
export const modules: Record<ModuleId, ModuleDefinition> = {
  projects: {
    title: "Projects",
    singular: "project",
    description: "Keep every site, milestone and delivery commitment in view.",
    ownerLabel: "Project manager",
    amountLabel: "Budget (UGX)",
    statuses: ["On track", "At risk", "Delayed", "Completed"],
    prefix: "PRJ",
  },
  tenders: {
    title: "Bids & Tenders",
    singular: "tender",
    description: "Your next opportunity, from first review to final award.",
    ownerLabel: "Procuring entity",
    amountLabel: "Contract value (UGX)",
    statuses: ["New", "Reviewing", "Preparing", "Submitted", "Awaiting Result", "Won", "Lost"],
    prefix: "TND",
  },
  documents: {
    title: "Documents",
    singular: "document",
    description: "A clear, organized register of your business documents.",
    ownerLabel: "Document owner",
    amountLabel: "Related value (UGX)",
    statuses: ["In review", "Approved", "Archived"],
    prefix: "DOC",
  },
  finance: {
    title: "Finance",
    singular: "transaction",
    description: "Understand cash movement and keep approvals moving.",
    ownerLabel: "Account / payee",
    amountLabel: "Amount (UGX)",
    statuses: ["Pending", "Approved", "Received", "Paid"],
    prefix: "FIN",
  },
  procurement: {
    title: "Procurement",
    singular: "purchase request",
    description: "Plan purchases and follow each request through fulfilment.",
    ownerLabel: "Requested by",
    amountLabel: "Estimated cost (UGX)",
    statuses: ["Requested", "In review", "Approved", "Ordered", "Delivered"],
    prefix: "PUR",
  },
  suppliers: {
    title: "Suppliers",
    singular: "supplier",
    description: "Build a dependable network of qualified partners.",
    ownerLabel: "Contact person",
    amountLabel: "Contract value (UGX)",
    statuses: ["Approved", "Pending", "Inactive"],
    prefix: "SUP",
  },
  inventory: {
    title: "Inventory",
    singular: "stock item",
    description: "Visibility into materials and equipment across your sites.",
    ownerLabel: "Location",
    amountLabel: "Stock value (UGX)",
    statuses: ["In stock", "Low stock", "Out of stock"],
    prefix: "STK",
  },
  "payroll-hr": {
    title: "Payroll & HR",
    singular: "employee",
    description: "One workspace for your people and monthly payroll register.",
    ownerLabel: "Role / department",
    amountLabel: "Monthly gross (UGX)",
    statuses: ["Active", "On leave", "Inactive"],
    prefix: "EMP",
  },
  customers: {
    title: "Customers",
    singular: "customer",
    description: "Keep client relationships and account details close at hand.",
    ownerLabel: "Contact person",
    amountLabel: "Account value (UGX)",
    statuses: ["Active", "Prospect", "Inactive"],
    prefix: "CUS",
  },
  reports: {
    title: "Reports",
    singular: "report",
    description: "Organize management reports and review cycles.",
    ownerLabel: "Prepared by",
    amountLabel: "Reported value (UGX)",
    statuses: ["Draft", "In review", "Published"],
    prefix: "RPT",
  },
  admin: {
    title: "Admin",
    singular: "policy",
    description: "Maintain your company policy and approval register.",
    ownerLabel: "Policy owner",
    amountLabel: "Approval limit (UGX)",
    statuses: ["Active", "Draft", "Archived"],
    prefix: "POL",
  },
};
export function isModuleId(value: string): value is ModuleId {
  return Object.hasOwn(modules, value);
}
