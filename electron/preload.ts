// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require('electron');

// Expõe funções seguras para o renderer
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, data?: unknown) => {
    const validChannels = [
      'load-settings',
      'save-settings',
      'get-random-location',
      'update-location',
    ];
    if (validChannels.includes(channel)) {
      // console.log(`Invocando canal ${channel} com dados:`, data);
      return ipcRenderer.invoke(channel, data);
    }
    throw new Error(`Canal IPC não permitido: ${channel}`);
  },
});
