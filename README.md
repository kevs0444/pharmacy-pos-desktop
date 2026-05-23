# Pharmacy POS Desktop Application

A modern desktop application for pharmacy point-of-sale and inventory management, built specifically to modernize legacy systems while maintaining high-density, familiar workflows for existing users.

## 🏗 Architecture Overview

This application uses an Electron-based desktop architecture combined with a modern React web frontend and a robust local SQLite backend.

- **Frontend:** React, TypeScript, Tailwind CSS, Vite.
- **Backend:** Node.js (via Electron Main Process), `better-sqlite3` for synchronous high-performance local database access.
- **IPC Layer:** Electron IPC bridge (`window.electronAPI`) connects the React frontend to the backend repositories.

### Database Design
The local SQLite database (`botikaplus.sqlite`) uses `better-sqlite3` in WAL (Write-Ahead Logging) mode with foreign keys strictly enforced. 
We use a custom `DatabaseManager` that handles automatic migration scripts on boot and runs seeding.

## ✨ Implemented Features

### 1. Purchase Orders (Purchasing)
- **Dense Data Grid:** A spreadsheet-like layout designed to mimic the legacy software's high data density.
- **Key Fields:** Stock No, Unit, Pkg Qty, Quantity, Unit Cost, Discount %, Net UCost, Extended Cost, Received qty, PR Num.
- **Header Controls:** Full status tracking (Processing, In Transit, Delivered, Cancelled), Doc No navigation, Term Days, Due Dates, and locking.
- **Backend:** Schema completed (`purchase_orders` and `purchase_order_items`). *Pending IPC wiring to Save/Load.*

### 2. User Authentication & Authorization
- **Login Screen:** Secure login screen built.
- **Backend:** `users` schema implemented with basic roles (ADMIN, MANAGER, STAFF) and secure password hashing.

### 3. Manufacturers & Products
- **Schema:** Full relational database schema for manufacturers, products, product batches (with expiry dates), and inventory movements.
- **Seed Data:** Over 1000 dummy pharmaceutical products are auto-generated for testing scale and performance.

### 4. Layout & Navigation
- **Sidebar Menu:** Sales, Inventory, Purchasing, Cashiering, Dashboard, Branch.
- **Top Bar:** Quick navigation commands, cloud sync icons, and date/period settings.

## 🚀 Pending Work (Roadmap)

### 1. Cashiering (POS) Modernization
- **Goal:** Redesign the POS terminal to mimic the old software's "Point of Sale" layout.
- **Key Requirements:**
  - High-density barcode/item grid.
  - Quick function keys mapping (F2 New Sale, F3 Post Sale, F12 Cash).
  - Prominent "Change" and "Amount" calculators.
  - Senior Citizen / PWD discount toggles.

### 2. Inventory Modernization
- **Goal:** Redesign the Inventory views based on legacy screenshots ("Stockmaster Initializer", "Stocks Adjustments", "Stock Status", "Sales Summary").
- **Key Requirements:**
  - Dense tracking of Expiry dates, Batch numbers, and Markup percentages.
  - Summary tables grouped by "StockGroup" (e.g., GEN, GALE, BRD).
  - Quick view tables for stock status (In Stock, On Order, Monthly Avg).

### 3. IPC Repository Wiring
- Connect the polished React UI screens (like Purchase Orders) to the SQLite repositories via Electron's `ipcMain.handle` to enable real-time saving and loading of actual data.

### 4. Advanced Authorization Maintenance
- Implement the "Authorization Maintenance" matrix to allow fine-grained toggle controls for specific user procedures (e.g., Allow 10% discount, Delete PO, Allow Zero Price).
