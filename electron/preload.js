const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startPython: async () => {
    return await ipcRenderer.invoke('python:start');
  },
  sendToPython: async (message) => {
    return await ipcRenderer.invoke('python:send', message);
  },
  cleanup: async () => {
    return await ipcRenderer.invoke('python:stop');
  },
  onPythonOutput: (callback) => {
    ipcRenderer.on('python:output', (event, value) => callback(value));
  }
});
