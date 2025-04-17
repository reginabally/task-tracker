// This file uses CommonJS syntax
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Database Operations
  task: {
    create: (data) => ipcRenderer.invoke('task:create', data),
    getAll: () => ipcRenderer.invoke('task:getAll'),
    getByFilters: (filters) => ipcRenderer.invoke('task:getByFilters', filters),
    update: (id, data) => ipcRenderer.invoke('task:update', id, data),
    delete: (id) => ipcRenderer.invoke('task:delete', id)
  },
  taskType: {
    getAll: () => ipcRenderer.invoke('taskType:getAll'),
    create: (data) => ipcRenderer.invoke('taskType:create', data),
    update: (id, data) => ipcRenderer.invoke('taskType:update', id, data),
    delete: (id) => ipcRenderer.invoke('taskType:delete', id)
  },
  tag: {
    getAll: () => ipcRenderer.invoke('tag:getAll'),
    create: (data) => ipcRenderer.invoke('tag:create', data),
    update: (id, data) => ipcRenderer.invoke('tag:update', id, data),
    delete: (id) => ipcRenderer.invoke('tag:delete', id)
  },
  reportingPeriod: {
    get: () => ipcRenderer.invoke('reportingPeriod:get'),
    update: (data) => ipcRenderer.invoke('reportingPeriod:update', data)
  },
  automationRule: {
    getAll: () => ipcRenderer.invoke('automationRule:getAll'),
    create: (data) => ipcRenderer.invoke('automationRule:create', data),
    update: (id, data) => ipcRenderer.invoke('automationRule:update', id, data),
    delete: (id) => ipcRenderer.invoke('automationRule:delete', id)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (data) => ipcRenderer.invoke('settings:update', data)
  },
  // AI Integration
  ai: {
    generateSummary: (tasks, options) => ipcRenderer.invoke('ai:generateSummary', tasks, options)
  },
  // File system operations
  files: {
    readFile: (filePath) => ipcRenderer.invoke('files:readFile', filePath),
    saveFile: (content, defaultPath) => ipcRenderer.invoke('files:saveFile', content, defaultPath)
  },
  // App operations
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    backupDatabase: () => ipcRenderer.invoke('app:backupDatabase')
  }
}); 

console.log('✅ preload.js is running') 