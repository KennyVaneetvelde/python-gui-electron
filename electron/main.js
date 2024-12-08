// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const { exec } = require("child_process");
const path = require("path");

let pythonProcess = null;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, "guiExample.html"));
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle Python process management
ipcMain.handle('python:start', () => {
  pythonProcess = exec('python ./python/pythonExample.py');

  pythonProcess.stdout.on('data', (data) => {
    BrowserWindow.getAllWindows()[0].webContents.send('python:output', data.toString());
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  return true;
});

ipcMain.handle('python:send', (event, message) => {
  if (pythonProcess) {
    pythonProcess.stdin.write(message + '\n');
    return true;
  }
  return false;
});

ipcMain.handle('python:stop', () => {
  if (pythonProcess) {
    pythonProcess.stdin.write(JSON.stringify({ command: 'terminate' }) + '\n');
    pythonProcess.stdin.end();
    pythonProcess = null;
    return true;
  }
  return false;
});
