import { app, BrowserWindow, Menu } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { DatabaseManager } from './db/DatabaseManager'
import { createAppServices } from './services'
import { registerIpcHandlers } from './ipc/registerIpcHandlers'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let databaseManager: DatabaseManager | null = null

// Remove default OS menu to match the clean web app look
Menu.setApplicationMenu(null)

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'BotikaPlus',
    icon: path.join(process.env.APP_ROOT!, 'frontend', 'assets', 'logos', 'logo.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Prevent menubar from appearing even if ALT is pressed.
  win.setMenuBarVisibility(false)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

async function bootstrapApplication() {
  databaseManager = DatabaseManager.bootstrap(app)
  const services = createAppServices(databaseManager)
  registerIpcHandlers(services)
  createWindow()
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    databaseManager?.close()
    app.quit()
    win = null
  }
})

app.on('before-quit', () => {
  databaseManager?.close()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(bootstrapApplication)
