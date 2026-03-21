# BotikaPlus Pharmacy POS - SDLC Master Plan

## 1. Project Context & Objectives
- **Domain:** Pharmacy / Drugstore
- **Type:** Point of Sale (POS) & Reporting System (Brand: BotikaPlus)
- **Architecture:** Local-First Desktop App (Offline capability via Electron/SQLite) + Cloud Sync (Turso).
- **Goal:** Deliver a modern, highly responsive, and user-friendly system, avoiding complex local server dependencies (e.g. MSVC++) for easy deployment on Windows machines.

---

## 2. Software Development Life Cycle (SDLC)

### PHASE 1: Requirements Gathering & UI Prototyping ✅ COMPLETED
*Goal: Solidify the logic, user flow, component architecture, and mock-schemas before touching a real database.*

**Status: 100% Complete — All Frontend Flows Solidified**

#### ✅ Core Systems
- **Authentication:** Dynamic Login System with role-based routing (Admin, Manager, Staff).
- **Dashboard:** Reactive charting (Recharts) parsing dynamic timeframes for Sales, Orders, and Revenue metrics.

#### ✅ Inventory Management (`Inventory.tsx`)
- Backend-ready `mockData.ts` with strict pharmacy schema (Rx vs OTC, Generic vs Branded).
- **Dual-view mode:** List (table) and Card toggle — List as default.
- **Complex data schema:** Category → SubCategory hierarchy, packaging units (Box/Bottle/Pack), base units (Tablet/Capsule/Piece), dual pricing (per unit + per piece).
- **Pagination:** 20 items/page (list), 12 items/page (card) with smart page controls.
- **Add/Edit item form:** Full product master data including packaging hierarchy, cost/selling prices, margin preview, discount %.
- **Delete product:** Confirmation dialog with warning, suggests disabling instead.
- **Disable/Enable product:** Toggle hides product from POS while keeping Inventory record.
- **FEFO Batch Tracking:** Each product has `batches[]` with Lot#, Mfg Date, Expiry Date, per-batch stock.

#### ✅ Point of Sale / Sales Counter (`POS.tsx`)
- **Dual-view mode:** Card (default for POS) and List toggle.
- **Box/Piece sales modal:** When product has piecesPerUnit > 1, user selects selling unit type.
- **FEFO Cart Logic:** Automatically selects the earliest-expiring batch (First Expired, First Out).
- **Cart displays:** Lot Number + Expiry Date per item, near-expiry warnings (≤3 months = red border).
- **Active-only filter:** Disabled products (`isActive: false`) are hidden from POS product browser.
- **Pagination:** 8 cards/page or 15 list rows/page.
- **Filters:** Category, SubCategory, Rx-only toggle, search, sort.

#### ✅ Purchase Orders (`Orders.tsx`)
- **Dual-view mode:** List (default) and Card toggle.
- **Advanced filters:** Manufacturer, Order Status (Processing/In Transit/Delivered/Cancelled), Priority (Low/Normal/Urgent), Staff who placed order.
- **Pagination** with page controls.
- **Enhanced New Order form:** Contact Person, Ordered By staff, ETA date, Remarks field.

#### ✅ Admin & Accounts System (`Admin.tsx`)
- **Dashboard:** Role distribution visual, quick stats (manufacturers/employees), activity log, manufacturer manager.
- **Accounts System:** Card/List toggle (Card default), live search by name/email, Role filter (Admin/Manager/Staff), Status filter (Active/Inactive), pagination.
- **Add Manufacturer modal:** Company name, contact person, email, phone, category, address.
- **Add Employee modal:** Full name, email, role, initial password.

#### ✅ Product Card Component (`ProductCard.tsx`)
- Shared between POS and Inventory views.
- **Category-based icons:** Pill (Medicine), HeartPulse (Vitamins), Stethoscope (Devices), Baby (Baby & Mom), etc.
- **Color-coded expiry badges** (client-specified thresholds):
  - 🟢 **Green** = 1+ year remaining
  - 🟠 **Orange** = 3 months to 1 year
  - 🔴 **Red** = 3 months or less / Expired
- **Stock formatting:** "2 Boxes, 15 Tablets" human-readable format with low-stock warnings.
- **Dual pricing display:** Per packaging unit + per base unit.

#### ✅ FEFO Batch System (`mockData.ts`)
- `ProductBatch` interface: batchId, lotNumber, manufacturingDate, expiryDate, stockPieces, receivedDate.
- Helper functions: `getActiveBatches()`, `getNextBatch()`, `getNearExpiryBatches()`, `getExpiryStatus()`, `deductFEFO()`.
- `isActive` field on products — false = hidden from POS, visible in Inventory as "Disabled".
- 12 realistic mock products with multi-batch data (some near-expiry for testing).

#### ✅ Typography & Design System
- **Inter** (Google Fonts) — weights 400–900 for consistent premium UI across all pages.
- Custom brand color tokens: `brand-blue`, `brand-green`, `brand-light`.

---

### PHASE 2: Backend Integration & Database Design (NEXT PHASE)
*Goal: Replace `mockData.ts` with real SQLite records and Turso cloud synchronization.*

1. **Schema Refinement:** Create normalized tables for `Products`, `ProductBatches`, `Transactions`, `TransactionItems`, `Users`, `Manufacturers`.
2. **Setup Electron IPC:** Bridge the React frontend to the Node.js/SQLite backend for secure queries (e.g., `window.api.getInventory()`).
3. **Migrate State:** Swap React's `useState(INVENTORY_DB)` arrays to database queries, ensuring 0ms latency local reads.
4. **Implement Transactions:** Atomic SQL transactions for POS Checkouts — deduct batch stock via FEFO and write to Sales ledger.
5. **Batch Management:** IPC handlers for receiving deliveries (add batch), stock adjustments, and FEFO deductions.

#### Performance Strategy (Designed for 10,000+ Products)
The UI is already architected for scale. When connecting to the real DB:
- **Pagination at SQL level:** `SELECT * FROM products LIMIT 20 OFFSET {page * 20}` — never load the full dataset into memory.
- **Full-Text Search:** Enable `FTS5` virtual table in SQLite for instant name/barcode search across huge catalogs.
- **Lazy Loading:** POS grid only renders the current page (8 cards). Switching pages triggers a new IPC query.
- **Indexed columns:** Index `category`, `subCategory`, `name`, `code`, `isActive` for sub-millisecond filter queries.
- **Navigation:** Category/SubCategory filter + search bar together narrow to < 20 results.

### PHASE 3: Cloud Synchronization & Offline Resilience
*Goal: Ensure seamless local-first capabilities.*

1. **Turso Integration:** Configure the Embedded Replica.
2. **Background Sync Mechanism:** Whenever internet is restored, bulk upload local `Transactions` to the Turso master database.
3. **Conflict Resolution:** Establish rules for data overrides (e.g., central Admin updating prices vs local POS machine reading prices).

### PHASE 4: Security, UAT & Deployment
*Goal: Finalize the desktop `.exe` rollout to the remote client.*

1. **Role Access Control (RBAC):** Move UI role protections to the Backend (verifying JWTs or Session IDs before executing restricted SQL).
2. **User Acceptance Testing (UAT):** Deliver test `.exe` via `electron-builder` for a full day of offline pharmacy operations.
3. **Auto-Updates:** Implement Electron Auto-Updater for seamless future fixes.

---

## 3. Technology Stack
- **Frontend Engine:** React 18 + Vite (Fast HMR, large AI context ecosystem).
- **UI Framework:** Tailwind CSS v4 + Inter (Google Fonts).
- **Backend Wrapper:** Electron (native Desktop App, no local server setup).
- **Database Layer:** SQLite (Local) / Turso (Cloud Replica).

---

## 4. AI-Assisted Implementation Guide
When passing this plan to AI agents for Phase 2:
- *"Given the SDLC Phase 2 plan, convert our `mockData.ts` InventoryItem + ProductBatch interfaces into a normalized SQLite schema including the `product_batches` table for FEFO tracking."*
- *"Based on our existing FEFO cart logic, write the Electron IPC handler to process checkout — deducting stock from the earliest-expiring batch first."*
- *"Create the IPC handler for receiving a new delivery: insert a new batch row and update the product's totalStockPieces."*
