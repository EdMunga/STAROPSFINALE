# Star Africa OS

A responsive operations workspace for Star Africa Logistics, built with React 19, TanStack Start, React Query, Tailwind CSS and Vite. The shared application shell is in `src/components/app-shell.tsx`.

## Run locally

Use Node.js 24.16.0 (pinned in `.nvmrc`) and npm. Node.js 22.12 or newer is required.

```sh
nvm install 24.16.0
nvm use 24.16.0
npm ci
npm run dev
```

Open the local URL printed by Vite. No environment variables, authentication service or database are needed for the prototype.

## Check and build

```sh
npm run typecheck
npm test
npm run lint
npm run build
npm start
```

The production build targets Node.js and writes to `.output`. `npm start` and `npm run preview` serve the build on port 3000 by default. Set `PORT` and `HOST` to change the address. `npm run format` formats source and documentation.

## Workspaces

- Dashboard with totals derived from the shared records.
- Searchable module registers with status filters, create/edit/delete, pagination and CSV export.
- Tender pipeline with board/table views and editable stages.
- Invoice editor with validation, VAT calculation, saved register, preview and printing.
- Sample receipt review with zoom/rotation, balance validation and expense posting.
- Responsive navigation, global search, attention notifications, dark mode and contained table scrolling.

The supplied Star Africa logo is in `public/brand/star-africa.png` and appears in the shell and invoice preview.

## Mock data and API connections

Data is isolated in memory per mounted application and resets on reload. Authentication, persistent storage, actual OCR, uploads, payroll execution and accounting integrations are not implemented.

`src/data/types.ts` defines the asynchronous repository contract. `src/data/repository.ts` implements the mock adapter, and `src/data/hooks.ts` owns query/mutation behavior. See [Backend integration](docs/backend-integration.md) for API adapter requirements and domain-specific production work.
