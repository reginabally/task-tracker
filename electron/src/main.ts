import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import electronSquirrelStartup from 'electron-squirrel-startup';
import { initDatabase } from './services/database.js';
import { registerIpcHandlers } from './ipc-handlers.js';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure single instance
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (electronSquirrelStartup) {
  app.quit();
}

// Keep a global reference of the window object to avoid it being garbage collected
let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Use correct path for preload script - relative to dist-electron directory
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    // Use native window controls
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
  });

  // Load the app
  const indexPath = path.join(__dirname, '../out/index.html');
  console.log(`Loading index from: ${indexPath}`);
  mainWindow.loadFile(indexPath);

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
};

// Initialize app
const initApp = async (): Promise<void> => {
  try {
    // Initialize database
    await initDatabase();
    
    // Register all IPC handlers
    registerIpcHandlers();
    
    // Create the window
    createWindow();
  } catch (error) {
    console.error('Error initializing app:', error);
    app.quit();
  }
};

// Create window when Electron is ready
app.whenReady().then(initApp);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, recreate a window when dock icon is clicked and no windows are open
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process code.
// You can also put them in separate files and import them here. 