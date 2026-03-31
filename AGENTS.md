# AGENTS.md
This file gives agentic coding tools project-specific guidance for working in this repository.

## Project Overview
- App type: offline-first pharmacy POS desktop app with reporting surfaces.
- Domain: pharmacy retail operations with POS, inventory, orders, users, and reporting.
- Form factor target: desktop app first, with web-based reporting planned in the project roadmap.
- Stack: Electron main/preload + React renderer + Vite + TypeScript + Tailwind CSS v4 + better-sqlite3.
- Entry points:
- `backend/main.ts`: Electron main process bootstrap.
- `backend/preload.ts`: IPC bridge exposed to the renderer as `window.api`.
- `frontend/main.tsx`: React renderer bootstrap.
- `frontend/App.tsx`: top-level UI composition.
- Database bootstrap lives in `backend/db/DatabaseManager.ts`.

## Product Goals And Constraints
- The app is intended to be offline-first: local workflows should keep working without internet.
- Sync-oriented architecture is part of the plan: local SQLite first, cloud sync when connectivity is restored.
- The client is remote, so deployment, updates, and reporting access should remain simple.
- UX expectations are high: modern, responsive, and easy for pharmacy staff to operate.

## AI Project Plan Summary
- Phase 1 is effectively the current baseline: high-fidelity UI for login, dashboard, inventory, orders, POS, admin, and responsive layout.
- Phase 2 is the current implementation focus: connect the UI to SQLite-backed data, complete cart math and checkout, and prepare background sync behavior.
- Phase 3 adds role-based authorization and security boundaries across backend logic, UI visibility, and IPC permissions.
- Phase 4 covers testing offline behavior, packaging, and client delivery via `electron-builder`.

## Roadmap Priorities For Agents
- Prefer work that advances Phase 2 unless the user clearly asks for something else.
- Phase 2 scope includes schema completeness, local transactions, product and sales persistence, and checkout correctness.
- Treat Turso or cloud sync as a later integration concern unless the current task explicitly depends on it.
- When touching auth or admin actions, align the code with the planned Admin, Manager, and Staff role model.

## Agent Rules Discovery
- Existing `AGENTS.md`: none was present at the repo root before this file.
- Cursor rules: no `.cursorrules` file and no `.cursor/rules/` directory were found.
- Copilot rules: no `.github/copilot-instructions.md` file was found.
- Because there are no separate agent-rule files, use this document as the canonical repo-specific guidance.

## Build, Run, And Verification Commands
Use the repo root: `D:\Repositories\Pharmacy_Desktop_App`.

### Install
- `npm install`
- Postinstall runs `electron-builder install-app-deps` automatically.

### Development
- `npm run dev`
- This starts the Vite-based Electron development flow configured in `vite.config.ts`.

### Production Build
- `npm run build`
- This runs `tsc && vite build && electron-builder`.
- Use this as the main full-project verification command before handing off major changes.

### Preview
- `npm run preview`
- Useful for renderer-only preview, but less representative than `npm run dev` for Electron-specific work.

### Type Checking
- There is no dedicated `typecheck` script.
- Use `npx tsc --noEmit` for direct TypeScript verification when you do not need a full packaged build.
- `npm run build` also includes `tsc` and therefore performs type checking.

### Linting
- There is currently no ESLint or other lint script configured in `package.json`.
- Do not claim lint passed unless you actually add and run a lint tool.
- For now, rely on TypeScript strictness, targeted file review, and `npm run build`.

### Testing
- There is currently no test runner configured.
- No `vitest`, `jest`, `playwright`, or `cypress` setup was found in the repository.
- Do not invent test commands in commits or handoff notes.

### Single-Test Execution
- Not available yet because no test framework is configured.
- If a test framework is added later, update this file with the exact command for one test file and one test case.
- Until then, use `npx tsc --noEmit`, `npm run build`, or manual validation through `npm run dev`.

## Architecture Notes
- Keep Electron responsibilities in the backend layer.
- Renderer code should interact with native capabilities through `window.api`, not through direct Node access.
- IPC channels are registered in `backend/ipc/registerIpcHandlers.ts`.
- Shared API contracts live in `backend/types/api.ts` and domain entities in `backend/types/domain.ts`.
- Repository classes contain SQL and row mapping.
- Service classes are thin orchestration layers over repositories.
- Renderer components often fetch from `window.api.*` inside `useEffect` and then map backend records into UI models.
- Current app state already includes seeded data, migrations, and CRUD-style flows for inventory and admin/manufacturer surfaces.

## Code Style: General
- Prefer minimal, local changes over broad refactors.
- Match the style already present in the file you are editing.
- Avoid repo-wide formatting churn.
- Keep comments sparse and only where logic is not obvious.
- Use ASCII unless an existing file already uses a specific Unicode character intentionally.

## Formatting Conventions
This repository currently has mixed formatting styles by area.
- Backend TypeScript generally uses single quotes, no semicolons, and compact declarations.
- Frontend React files generally use double quotes, semicolons, and multiline JSX props when long.
- Preserve the local style of the file you touch.
- Do not reformat backend files to frontend style or frontend files to backend style unless explicitly requested.

## Imports
- Keep imports grouped by source type: framework or platform packages first, local project imports after.
- type-only imports should use `import type` where possible
- Follow the file's existing quote and semicolon style.
- Prefer relative imports already used in the area rather than introducing new alias systems.
- Avoid unused imports; `tsconfig.json` enables `noUnusedLocals` and `noUnusedParameters`.

## TypeScript And Types
- The repo uses `strict: true`; maintain strict typing.
- Do not weaken types with `any` unless there is a concrete short-term necessity.
- If touching an area already using `any`, prefer replacing it with a real type when the change is small and safe.
- Reuse shared API and domain types from `backend/types/api.ts` and `backend/types/domain.ts`.
- Keep renderer access to IPC typed through `PharmacyApi` and `window.api`.
- Prefer explicit return types on exported functions and public methods when it improves clarity.

## Naming Conventions
- React components: PascalCase, exported by component name.
- Classes: PascalCase.
- Functions, variables, and methods: camelCase.
- Type aliases and interfaces: PascalCase.
- Constants: UPPER_SNAKE_CASE for true constants such as page sizes; otherwise camelCase for derived values.
- IPC channel names follow a colon-separated namespace pattern such as `inventory:list` and `system:getStatus`.
- Database columns use snake_case in SQL; mapped TypeScript fields use camelCase.

## React Guidelines
- Prefer functional components and hooks.
- Existing code often keeps related UI state local to the component; follow that pattern unless state clearly needs lifting.
- Use `useEffect` for initial data loading and async refreshes.
- Use `useMemo` where the file already uses it for filtered or sorted derived collections.
- Do not add abstractions or custom hooks unless they clearly reduce repetition or complexity.
- Keep mapping between backend records and UI models in `frontend/lib/*` when that pattern already exists.

## Electron And IPC Guidelines
- Do not expose raw Node or Electron primitives directly to the renderer.
- Add new renderer capabilities by updating shared types in `backend/types/api.ts`, exposing them in `backend/preload.ts`, registering a handler in `backend/ipc/registerIpcHandlers.ts`, and implementing service/repository logic as needed.
- Keep IPC channel payloads small and explicit.
- Remove and re-register handlers via the existing helper pattern when adding new channels.

## Database And SQL Guidelines
- better-sqlite3 is synchronous by design in the Electron main process; keep DB work in backend classes.
- Prefer transactions for multi-step writes.
- Validate input before writes, following repository patterns.
- Continue mapping SQL rows into typed records rather than leaking raw DB row shapes outward.
- Preserve the snake_case SQL to camelCase TypeScript boundary.
- If schema changes are needed, add migrations under `backend/db/migrations` instead of editing live tables ad hoc.
- The project plan expects core tables around products, categories, sales, sale items, and users; keep new schema work aligned with that direction.
- Design backend changes so future offline sync is possible; avoid renderer-owned source-of-truth state for persisted business data.

## Error Handling
- Fail loudly and with context in backend code when bootstrapping, IPC, or database work breaks.
- In renderer code, current patterns dispatch `app-error` and `app-success` window events for notification UI; reuse that pattern where relevant.
- Prefer actionable error messages over silent catches.
- Avoid swallowing exceptions unless the UI intentionally degrades gracefully.
- Use `try`/`catch` around async UI fetches and save flows.

## What To Avoid
- Do not bypass `window.api` from the renderer.
- Do not put SQL directly into React components.
- Do not mix unrelated refactors into a focused task.
- Do not add a new library for formatting, state, or data fetching unless there is a clear repository-level need.
- Do not claim lint or tests passed when the repo has no configured lint or test runner.

## Recommended Verification By Change Type
- Small TypeScript-only change: `npx tsc --noEmit`
- UI or IPC change: `npm run dev` and manually exercise the affected flow
- Build-sensitive or release-sensitive change: `npm run build`

## AI Prompt Context
- If asked to generate follow-up implementation tasks, prefer prompts that target Electron main-process SQL, IPC handlers, and React state connected to `window.api`.
- Good prompt themes from the project plan are: SQLite schema generation, IPC handlers for data access, and cart-state or checkout flows in `frontend/`.

## Handoff Expectations
- Summarize what changed and why.
- Mention exactly which verification commands were run.
- Call out missing automated coverage when relevant, since there is currently no test suite.
- If you add linting, tests, Cursor rules, or Copilot instructions later, update this file immediately.
