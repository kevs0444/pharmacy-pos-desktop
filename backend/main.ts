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
let splash: BrowserWindow | null = null
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
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.maximize()

  // Prevent menubar from appearing even if ALT is pressed.
  win.setMenuBarVisibility(false)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

function createSplashWindow() {
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    icon: path.join(process.env.APP_ROOT!, 'frontend', 'assets', 'logos', 'logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  const splashPath = path.join(process.env.VITE_PUBLIC!, 'splash.html')
    
  splash.loadFile(splashPath)
  
  splash.once('ready-to-show', () => {
    splash?.show()
  })
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function bootstrapApplication() {
  createSplashWindow()
  
  // Give it a moment to render
  await sleep(100)

  if (splash) {
    splash.webContents.executeJavaScript(`window.updateStatus && window.updateStatus("Initializing database...")`).catch(() => {})
  }
  await sleep(50)

  databaseManager = DatabaseManager.bootstrap(app)

  if (splash) {
    splash.webContents.executeJavaScript(`window.updateStatus && window.updateStatus("Optimizing performance...")`).catch(() => {})
  }
  await sleep(50)

  const services = createAppServices(databaseManager)
  registerIpcHandlers(services)

  if (splash) {
    splash.webContents.executeJavaScript(`window.updateStatus && window.updateStatus("Starting application UI...")`).catch(() => {})
  }
  await sleep(50)

  createWindow()

  if (win) {
    win.once('ready-to-show', () => {
      if (splash) {
        splash.close()
        splash = null
      }
      win?.show()
      win?.maximize()
    })
  }
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

app.on('web-contents-created', (_event, contents) => {
  contents.on('preload-error', (_e, preloadPath, error) => {
    console.error(`\n[CRITICAL ERROR] Preload script failed: ${preloadPath}`);
    console.error(error);
  });
});

app.whenReady().then(bootstrapApplication)
