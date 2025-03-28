
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  loadEmployees: () => ipcRenderer.invoke('loadEmployees'),
  saveEmployees: (employees) => ipcRenderer.invoke('saveEmployees', employees),
  loadSettings: () => ipcRenderer.invoke('loadSettings'),
  saveSettings: (settings) => ipcRenderer.invoke('saveSettings', settings),
  checkBirthdays: () => ipcRenderer.invoke('checkBirthdays')
});
