const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload em CommonJS para compatibilidade máxima com sandbox do Electron.
 */
contextBridge.exposeInMainWorld('twCommander', {
  isElectron: true,
  maps: {
    list: () => ipcRenderer.invoke('maps:list'),
    read: (filePath) => ipcRenderer.invoke('maps:read', filePath),
    import: () => ipcRenderer.invoke('maps:import'),
    openFolder: () => ipcRenderer.invoke('maps:open-folder'),
  },
});
