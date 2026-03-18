# Pharmacy POS & Reporting Desktop Application - AI Master Plan

## 1. Project Context & Objectives
- **Domain:** Pharmacy
- **Type:** Point of Sale (POS) & Reporting System.
- **Form Factor:** Desktop Application (Windows/Mac) + Web-based Reporting Dashboard.
- **Key Constraints:**
  - Must support **Offline-First** capability (works perfectly without internet, syncs when internet is restored).
  - Client is remote, requiring easy deployment, updates, and cloud-based reporting access.
  - UI must be modern, highly responsive, and user-friendly.

## 2. Recommended Tech Stack: The "Local-First" Stack
We have shifted the architecture to **Electron** per the client's decision for easier native JS/TS ecosystem integration.

### Desktop Framework: **Electron** (via Vite)
* **Why:** Electron relies purely on standard Node.js and Chromium. It completely bypasses the need for the heavy Microsoft Visual Studio C++ SDK installation on the developer machine, making the setup seamless out of the box for Windows environments.
* **Architecture:** 
  - `backend/main.ts` (Electron Main Process controlling the OS window)
  - `backend/preload.ts` (Secure IPC bridge to React)
  - `frontend/` (React Renderer Process containing all UI)

### Frontend UI: **React (via Vite) + TailwindCSS v4 + shadcn/ui**
* **Why:** React has the largest AI context available. Tailwind + shadcn/ui provides beautiful, modern, accessible components out of the box without needing a custom designer.

### Database Architecture: **Turso / SQLite**
* **Local Database (Offline):** Embedded SQLite inside the Electron Main process. Because it's **100% SQL**, you get full relational queries (JOINs for products and sales) locally at 0ms latency.
* **Remote Database (Online):** Turso Cloud Database.
* **Sync Strategy (Automatic):** The local SQLite embedded replica lives inside Electron and automatically synchronizes with the remote Turso Database whenever the computer detects an active internet connection.

## 3. Software Development Life Cycle (SDLC)

### Phase 1: Requirements Gathering & Wireframing
- Get a sample product list from the client.
- Define the SQL schema (Tables: `Products`, `Categories`, `Sales`, `Sale_Items`, `Users`).

### Phase 2: System Architecture & Setup (Current)
- Initialize the Electron + Vite + React project.
- Connect the Electron Main process to the React Renderer via ContextBridge.

### Phase 3: Core Offline Features (MVP - Minimum Viable Product)
- Build the UI for the POS terminal inside `frontend/`.
- Implement barcode scanning capabilities.
- Implement cart calculation, applying discounts, and checking out.
- Execute SQL transactions locally in Electron's Main thread via `ipcRenderer.invoke`.

### Phase 4: Sync & Authentication
- Setup authentication (e.g., Clerk) for Cashier vs Admin roles.
- Ensure the local SQLite system seamlessly syncs off-grid transactions up to Turso when internet returns.

### Phase 5: Testing & Deployment
- Test internet dropping mid-transaction to ensure local DB handles it perfectly.
- **Deployment:** Use `electron-builder` to automatically compile an `.exe` installer. Electron has built-in Auto-Updaters so you can push bug fixes remotely.

## 4. How to Maximize AI in this Project
When passing this workflow to AI tools, follow these structured prompts:
1. "Given our AI Master Plan, generate the SQLite database schema for the Pharmacy POS in Electron main process."
2. "Write an Electron IPC handler in `backend/main.ts` to fetch products."
3. "Generate a React Context hook in `frontend/` to manage the POS cart state."
