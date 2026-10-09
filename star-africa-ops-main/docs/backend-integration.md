# Connecting the operations UI to an API

The application currently uses an isolated, in-memory mock repository. Data survives client-side navigation and resets on page reload. There is no authentication, browser storage, or database.

## Integration boundary

`src/data/types.ts` defines `OperationsRepository`, the request/response models, and module identifiers. Implement all six repository methods in an API adapter, then pass that instance to `OperationsProvider` in `src/routes/__root.tsx`. Components use query/mutation hooks, not `fetch`, so changing the provider does not require rewriting the screens.

The adapter must return promises and throw `Error` objects with safe, user-readable messages on failed requests. Do not swallow HTTP errors. Map backend DTOs to these UI models at this boundary. Replace mock IDs with server-issued IDs; ensure stable IDs and ISO `YYYY-MM-DD` date strings. Amounts use whole UGX. Invoices use 18% VAT for this prototype; real tax rules should be returned/validated by the backend.

| Method           | Suggested API responsibility                                                      |
| ---------------- | --------------------------------------------------------------------------------- |
| `listRecords`    | Return the module registers available to the user                                 |
| `saveRecord`     | Create or update a business record and return its canonical representation        |
| `deleteRecord`   | Delete a record, with server-side authorization and dependency validation         |
| `listInvoices`   | Return the invoice register                                                       |
| `saveInvoice`    | Validate and upsert an invoice, including its lines                               |
| `confirmReceipt` | Atomically validate/post an expense and reject duplicate supplier/reference pairs |

These are proposed responsibilities, not existing endpoints. The generic module register is a UI prototype model: inventory stock movements, accounting ledgers, payroll processing, permissions, file uploads, and real OCR need their own backend domain models before production.

## Query lifecycle

React Query keys are `['records']` and `['invoices']`. Successful mutations invalidate the relevant key; dashboard totals, search results and module lists then refresh together. Data has a 30-second stale time. Screens include loading, retry, empty, pending and mutation error states. The provider is created per mounted app to avoid cross-request SSR data leakage.

For a large dataset, extend the contract to accept filters, sorting and pagination and return total counts; current search, filters and pagination operate locally on the full mock list. Add request cancellation, authentication, authorization, concurrency/version checks and server validation when the API exists. Clear query caches when switching authenticated accounts.

## Current workflows

- All module registers: list, search, status filter, create, edit, delete confirmation and CSV export.
- Tenders: board/table, search/filter, edit stage, create and export.
- Invoices: line editing, totals, date validation, save/open register, preview and print. Partial payments are intentionally not modeled.
- Receipt review: sample document, zoom/rotation, editable fields, balanced-total validation, duplicate protection and finance posting. It does not extract new files.
- Shell: responsive sidebar, theme toggle, search, quick create and attention notifications. Notification read state is session-only.

Run `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build` before replacing the mock adapter. Repository tests cover session isolation, mutations, invoice validation and receipt posting.

## Brand asset

`public/brand/star-africa.png` is a high-resolution extraction of the supplied Star Africa Logistics PDF logo. The original colors and artwork are retained on white, including in dark mode. It is used in navigation and printed invoices.
