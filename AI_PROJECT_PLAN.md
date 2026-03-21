# BotikaPlus Pharmacy POS - SDLC Master Plan

## 1. Project Context & Objectives
- **Domain:** Pharmacy / Drugstore
- **Type:** Point of Sale (POS) & Reporting System (Brand: BotikaPlus)
- **Architecture:** Local-First Desktop App (Offline capability via Electron/SQLite) + Cloud Sync (Turso).
- **Goal:** Deliver a modern, highly responsive, and user-friendly system, avoiding complex local server dependencies (e.g. MSVC++) for easy deployment on Windows machines.

---

## 2. Software Development Life Cycle (SDLC)

### PHASE 1: Requirements Gathering & UI Prototyping (CURRENTLY COMPLETING)
*Goal: Solidify the logic, user flow, component architecture, and mock-schemas before touching a real database.*

**Status: 95% Complete - Solidifying Frontend Flow**
- ✅ **Authentication:** Dynamic Login System with role-based routing (Admin, Manager, Staff).
- ✅ **Dashboard:** Built reactive charting (Recharts) parsing dynamic timeframes to render realistic Sales, Orders, and Revenue metrics.
- ✅ **Inventory Management:** Created a backend-ready `mockData.ts` adhering strictly to Pharmacy requirements (Rx vs OTC, Generic vs Branded labels). Built the rich data-table view and add-item forms.
- ✅ **Point of Sale (POS):** 
  - Overhauled to use a sleek, pristine Grid-Card layout (image-less) mapping exact generic/branded data.
  - Functional cart logic with dynamic discount applications (Senior, PWD, Custom), Doctor's Rx validation, and precise exact-change calculations.
- ✅ **Component Reusability:** Built the robust `<ProductCard />` component shared seamlessly between Inventory viewing and POS Add-to-Cart logic.

### PHASE 2: Backend Integration & Database Design (NEXT PHASE)
*Goal: Replace `mockData.ts` with real SQLite records and Turso cloud synchronization.*

1. **Schema Refinement:** Create normalized tables for `Products`, `Transactions`, `TransactionItems`, and `Users`.
2. **Setup Electron IPC:** Bridge the React frontend strictly to the Node.js/SQLite backend for secure queries (e.g., `window.api.getInventory()`).
3. **Migrate State:** Swap React's `useState(INVENTORY_DB)` arrays to instead query the embedded database, ensuring 0ms latency local reads.
4. **Implement Transactions:** Create atomic SQL transactions for POS Checkouts to deduct stock instantly and write to the Sales ledger.

### PHASE 3: Cloud Synchronization & Offline Resilience
*Goal: Ensure seamless local-first capabilities.*

1. **Turso Integration:** Configure the Embedded Replica.
2. **Background Sync Mechanism:** Whenever internet is restored, bulk upload local `Transactions` to the Turso master database.
3. **Conflict Resolution:** Establish rules for data overrides (e.g., central Admin updating prices vs local POS machine reading prices).

### PHASE 4: Security, UAT & Deployment
*Goal: Finalize the desktop `.exe` rollout to the remote client.*

1. **Role Access Control (RBAC):** Move UI role protections to the Backend (verifying JWTs or Session IDs before executing restricted SQL deletes/updates).
2. **User Acceptance Testing (UAT):** Deliver a test `.exe` bundle via `electron-builder` to the client to simulate a full day of offline pharmacy operations.
3. **Auto-Updates:** Implement Electron Auto-Updater to seamlessly stream future fixes.

---

## 3. Technology Stack Recommendations
- **Frontend Engine:** React 18 + Vite (Fast HMR, large AI context ecosystem).
- **UI Frameworks:** Tailwind CSS v4 + minimal Shadcn UI (for accessible modals/dropdowns).
- **Backend Wrapper:** Electron (Bypasses local server setups, runs as a native Desktop App).
- **Database Layer:** SQLite (Local) / Turso (Cloud Repo).

---

## 4. AI-Assisted Implementation Guide
When passing this plan to AI agents for Phase 2:
- *"Given the SDLC Phase 2 plan, please convert our `mockData.ts` InventoryItem interface into a strict SQLite table schema."*
- *"Based on our existing POS cart logic, write the Electron IPC handler to process this checkout natively in SQLite."*
