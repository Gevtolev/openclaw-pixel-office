const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (command, args) => ipcRenderer.invoke('tauri:invoke', { command, args }),
  onEvent: (callback) => {
    ipcRenderer.on('tauri:event', (_event, data) => callback(data));
  },
  setSize: (width, height) => ipcRenderer.invoke('window:set-size', { width, height }),
  getPosition: () => ipcRenderer.invoke('window:get-position'),
  setPosition: (x, y) => ipcRenderer.invoke('window:set-position', { x, y }),
});
