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

## 3. Software Development Life Cycle (SDLC) & ROADMAP

### PHASE 1: Client Demo UI (Current Focus - Fortifying Frontend)
*Goal: Provide a fully clickable, high-fidelity prototype to the client so they can visualize the workflow before we connect the database.*

1. **Login System:** Implement a beautiful, branded login screen featuring the "BotikaPlus" logo and styling.
2. **Dashboard Overview:** Comprehensive reporting UI (Charts, Stock levels, Calendar).
3. **Inventory & Sales Previews:** Data tables showing sample realistic products with image links from the internet.
4. **Point of Sale (POS) Interface:** The core selling screen. A grid of products with images, a calculation cart, and checkout capability (UI only).

### PHASE 2: Database & Offline Architecture
*Goal: Bring the static UI to life by hooking it up to Turso and Local SQLite.*

1. Define the SQL schema (Tables: `Products`, `Categories`, `Sales`, `Sale_Items`, `Users`).
2. Execute SQL transactions locally in Electron's Main thread via `ipcRenderer.invoke`.
3. Implement cart calculation, applying discounts, and checking out natively.
4. Build the Background Sync mechanism to push local offline transactions to the remote Turso Cloud Database when internet is available.

### PHASE 3: Role-based Authentication & Security
*Goal: Restrict actions based on user tier.*

1. Implement Cashier vs. Admin role validation logic in the Electron backend.
2. Hide/Show specific Dashboard widgets and Inventory editing features based on the logged-in user role.
3. Secure the IPC bridge so that only Admins can trigger destructive/editing SQL queries.

### PHASE 4: Testing & Deployment
*Goal: Deliver the `.exe` to the client.*

1. Test internet dropping mid-transaction to ensure local DB handles it perfectly.
2. Use `electron-builder` to automatically compile an `.exe` installer. Electron has built-in Auto-Updaters so you can push bug fixes remotely.

## 4. How to Maximize AI in this Project
When passing this workflow to AI tools, follow these structured prompts:
1. "Given our AI Master Plan, generate the SQLite database schema for the Pharmacy POS in Electron main process."
2. "Write an Electron IPC handler in `backend/main.ts` to fetch products."
3. "Generate a React Context hook in `frontend/` to manage the POS cart state."
