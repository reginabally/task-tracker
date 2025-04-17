// This file will integrate with the React app once we migrate it
// For now, it just contains placeholder functionality for the initial demo

// Display version information
document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (window.api && window.api.app) {
      // Get app version
      const appVersion = await window.api.app.getVersion();
      const appVersionEl = document.getElementById('app-version');
      if (appVersionEl) {
        appVersionEl.textContent = appVersion;
      }
    }
    
    // The following would normally not work with contextIsolation,
    // but our preload script would provide these values via IPC
    const electronVersionEl = document.getElementById('electron-version');
    const chromeVersionEl = document.getElementById('chrome-version');
    const nodeVersionEl = document.getElementById('node-version');
    
    if (electronVersionEl) electronVersionEl.textContent = 'TBD via IPC';
    if (chromeVersionEl) chromeVersionEl.textContent = 'TBD via IPC';
    if (nodeVersionEl) nodeVersionEl.textContent = 'TBD via IPC';
  } catch (error) {
    console.error('Error getting version info:', error);
  }
}); 