# 🏥 Pharmacy POS & Reporting Desktop Application

A modern, offline-first Point of Sale (POS) and inventory reporting desktop application specifically designed for Pharmacies. 

Built with the ultimate **"Local-First" Electron Architecture**, ensuring zero latency during checkouts, perfect offline capability when internet drops, and seamless background cloud syncing.

## 🚀 Tech Stack
- **Desktop Framework:** [Electron](https://www.electronjs.org/) (via `vite-plugin-electron`)
- **Frontend UI:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + Custom modern UI components
- **Database (Offline & Online):** Local SQLite embedded database syncing automatically to a Turso Cloud Database via embedded libSQL.

## 📁 Project Structure

This repository follows a strict separation of frontend UI from backend OS capabilities to maximize scalability and AI-assisted development.

```text
/
├── backend/            # Electron Main Process (Node.js backend & Window control)
│   ├── main.ts         # Bootstraps the application window and local DB connection
│   └── preload.ts      # The secure IPC bridge locking down OS features from React
│
├── frontend/           # The React Application (Renderer Process)
│   ├── App.tsx         # Handlers, POS views, and UI entry point
│   └── components/     # Scalable Feature-Sliced React components
│
├── AI_PROJECT_PLAN.md  # Detailed masterplan for AI IDEs analyzing the project context
└── package.json        # Unified scripts and dependency map
```

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (Node Package Manager)

### 2. Installation
Clone the repository and install the Node modules. Because this uses Electron instead of Tauri, there are absolutely no heavy C++ compilers or Rust setup requirements!

```bash
git clone https://github.com/kevs0444/pharmacy-pos-desktop.git
cd pharmacy-pos-desktop
npm install
```

### 3. Running in Development
To launch the desktop window instantly in development mode with Hot-Module Replacement (HMR) for both React and the Electron backend:

```bash
npm run dev
```

### 4. Building for Production
When the app is finished and ready to install on the Pharmacy's computer, you can compile the incredibly secure, optimized `.exe` installer by running:

```bash
npm run build
```

---

*This architecture was engineered specifically to be friendly to Remote Offline Sync capabilities and LLM-assisted software engineering.*
