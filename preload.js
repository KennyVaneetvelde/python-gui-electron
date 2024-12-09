const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getApiUrl: () => {
    // Use the API_PORT from the window object, which is set by main.js
    const port = window.API_PORT;
    if (!port) {
      console.error('API_PORT not set in window object');
      return null;
    }
    return {
      http: `http://127.0.0.1:${port}`,
      ws: `ws://127.0.0.1:${port}/ws`
    };
  }
});
