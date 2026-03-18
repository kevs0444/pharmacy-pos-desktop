# Pharmacy POS & Reporting Desktop Application - AI Master Plan

## 1. Project Context & Objectives
- **Domain:** Pharmacy
- **Type:** Point of Sale (POS) & Reporting System.
- **Form Factor:** Desktop Application (Windows/Mac) + Web-based Reporting Dashboard.
- **Key Constraints:**
  - Must support **Offline-First** capability (works perfectly without internet, syncs when internet is restored).
  - Client is remote, requiring easy deployment, updates, and cloud-based reporting access.
  - UI must be modern, highly responsive, and user-friendly.
  - Tech stack must have generous free tiers (budget-friendly for initial client).

## 2. Recommended Tech Stack: The "Local-First" Stack
To maximize modern AI-assisted engineering while keeping costs at $0 for the starter phase:

### Desktop Framework: **Tauri** (over Electron)
* **Why:** Tauri generates much smaller app sizes (~5MB vs Electron's ~100MB) and uses significantly less RAM. Pharmacy computers are often older or lower-spec; Tauri guarantees a smooth, native-feeling experience.
* **Language:** Rust (backend/system) + TypeScript/JavaScript (frontend).

### Frontend UI: **React (via Vite) + TailwindCSS + shadcn/ui**
* **Why:** React has the largest AI context available. Tailwind + shadcn/ui provides beautiful, modern, accessible components out of the box without needing a custom designer.

### Database Architecture: **Turso (libSQL)** - *The Game Changer*
Using Turso is actually **better** than Supabase for this specific "offline/online" requirement. Turso is built on libSQL (a fork of SQLite).
* **Local Database (Offline):** Embedded libSQL replica inside the Tauri app. Because it's **100% SQL**, you get full relational queries (JOINs for products and sales) locally at 0ms latency.
* **Remote Database (Online):** Turso Cloud Database (Generous free tier up to 9GB storage).
* **Sync Strategy (Automatic):** Instead of writing complex background sync workers manually, libSQL features **Embedded Replicas**. The Tauri app reads/writes to the local SQLite file. When the internet connection is active, libSQL *automatically* syncs the local file with the remote Turso database in the background. If the internet drops, the app continues reading/writing to the local file seamlessly.

### Backend/API (For the Web Dashboard)
* **Next.js (App Router) or Vite + Hono (deployed on Cloudflare/Vercel):** Used strictly to serve the remote reporting dashboard to the client. It queries the main Turso Cloud DB directly using edge functions for blazing fast global access.

## 3. Software Development Life Cycle (SDLC)

### Phase 1: Requirements Gathering & Wireframing
- Get a sample product list from the client. Identify the exact reports she wants (e.g., Daily Sales, Low Stock Alerts).
- Define the SQL schema (Tables: `Products`, `Categories`, `Sales`, `Sale_Items`, `Users`).

### Phase 2: System Architecture & Setup (Current)
- Initialize the Tauri + React project.
- Setup Turso Database and provision the embedded libSQL client inside the Tauri/React app.

### Phase 3: Core Offline Features (MVP - Minimum Viable Product)
- Build the UI for the POS terminal.
- Implement barcode scanning capabilities (scanners act as rapid keyboards).
- Implement cart calculation, applying discounts, and checking out.
- Execute SQL transactions locally using the libSQL client.

### Phase 4: Sync & Authentication
- Setup authentication (e.g., using Clerk or standard JWT) for Cashier vs Admin roles.
- Test that the libSQL embedded replica successfully syncs local sales to the Turso cloud when the internet is available.

### Phase 5: Reporting & Remote Access
- Build a lightweight web dashboard (e.g., in Next.js) connected to the same Turso database so the remote client can see reports anywhere in the world from her phone or laptop, without needing the desktop app open.

### Phase 6: Testing & Deployment
- Test internet dropping mid-transaction to ensure the local libSQL replica handles it perfectly.
- **Deployment:** Use Tauri's built-in GitHub Actions to automatically compile `.exe` installers for Windows. Send the installer link to the client. Configure Tauri auto-updater to deploy updates remotely.

## 4. How to Maximize AI in this Project
When passing this workflow to AI tools (or continuing here), follow these structured prompts:
1. "Given our AI Master Plan, generate the SQLite/Turso database schema for the Pharmacy POS."
2. "Write a React component using Tailwind CSS for the POS Cart layout."
3. "Generate the setup code to configure a libSQL embedded replica in a React/Tauri application."
4. "Show me the SQL JOIN query needed to generate a Daily Sales Report including product categories."
