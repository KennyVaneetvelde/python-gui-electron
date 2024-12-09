const { app, BrowserWindow } = require('electron');
const { exec, spawn } = require('child_process');
const path = require('path');
const http = require('http');
const net = require('net');
const fs = require('fs');
const express = require('express');

let pythonProcess = null;
let viteProcess = null;
let API_PORT = 8000;
let STATIC_PORT = 3000;
let VITE_PORT = 5174;
let staticServer = null;

function getAppRoot() {
  return app.isPackaged ? path.dirname(app.getPath('exe')) : __dirname;
}

function getPythonResources() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar.unpacked', 'python');
  }
  return path.join(__dirname, 'python');
}

// Function to get Python path from virtual environment
function getPythonPath() {
  const pythonDir = getPythonResources();
  const venvPath = path.join(pythonDir, 'venv');
  const pythonPath = process.platform === 'win32'
    ? path.join(venvPath, 'Scripts', 'python.exe')
    : path.join(venvPath, 'bin', 'python');

  console.log('Python path:', pythonPath);
  return pythonPath;
}

function getServerScriptPath() {
  return path.join(getPythonResources(), 'server.py');
}

// Function to kill existing Python processes (Windows specific)
function killExistingPythonProcesses() {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      exec('taskkill /F /IM pythonw.exe & taskkill /F /IM python.exe', (error) => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, '127.0.0.1');

    server.on('listening', () => {
      server.close();
      resolve(true);
    });

    server.on('error', () => {
      resolve(false);
    });
  });
}

// Function to find an available port
async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
    if (port > startPort + 100) {  // Don't search forever
      throw new Error('No available ports found');
    }
  }
  return port;
}

// Function to check server with http module
function checkServer(port) {
  return new Promise((resolve, reject) => {
    const request = http.get(`http://127.0.0.1:${port}`, (response) => {
      if (response.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`Server returned status ${response.statusCode}`));
      }
      response.resume(); // Consume response data to free up memory
    });

    request.on('error', (err) => {
      reject(err);
    });

    request.end();
  });
}

// Function to wait for server to be ready
async function waitForServer(port, maxAttempts = 50) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms between attempts
      await checkServer(port);
      return true;
    } catch (e) {
      console.log(`Attempt ${i + 1}/${maxAttempts} to connect to server...`);
    }
  }
  throw new Error('Server failed to start');
}

// Function to start static file server
function startStaticServer(port) {
  const basePath = getAppRoot();
  const buildDir = app.isPackaged
    ? path.join(basePath, 'resources', 'app.asar', 'frontend', 'build')
    : path.join(__dirname, 'frontend', 'build');

  // Create express app
  const staticApp = require('express')();

  // Serve static files from the build directory
  staticApp.use(express.static(buildDir));

  // Fallback route for SPA
  staticApp.get('*', (req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });

  staticServer = staticApp.listen(port, '127.0.0.1', () => {
    console.log(`Static server running at http://127.0.0.1:${port}`);
  });
}

// Function to create a loading HTML content
function getLoadingHTML() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #1a1a1a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .container {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
          }
          .spinner {
            width: 56px;
            height: 56px;
            display: grid;
            border: 4px solid #0000;
            border-radius: 50%;
            border-right-color: #2196f3;
            animation: spinner-a4dj62 1s infinite linear;
          }
          .spinner::before,
          .spinner::after {
            content: "";
            grid-area: 1/1;
            margin: 2px;
            border: inherit;
            border-radius: 50%;
            animation: spinner-a4dj62 2s infinite;
          }
          .spinner::after {
            margin: 8px;
            animation-duration: 3s;
          }
          @keyframes spinner-a4dj62 {
            100% {
              transform: rotate(1turn);
            }
          }
          .loading-text {
            color: #fff;
            font-size: 16px;
            font-weight: 500;
            letter-spacing: 0.3px;
            opacity: 0.9;
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 0.9;
            }
            50% {
              opacity: 0.5;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <div class="loading-text">Starting development server...</div>
        </div>
      </body>
    </html>
  `;
}

// Function to check if Vite server is ready
async function checkViteServer(port) {
  try {
    const response = await fetch(`http://localhost:${port}`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Function to wait for Vite server
async function waitForViteServer(port, maxAttempts = 50) {
  const startTime = Date.now();
  const minLoadTime = 10000; // 10 seconds minimum loading time

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const isReady = await checkViteServer(port);
      if (isReady) {
        // Calculate remaining time to meet minimum load time
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadTime - elapsed);
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check if port has changed (Vite automatically increments port if taken)
      try {
        const response = await fetch('http://localhost:' + (port + 1));
        if (response.status === 200) {
          console.log(`Vite server found on port ${port + 1}`);
          VITE_PORT = port + 1;
          return true;
        }
      } catch (e) {
        // Ignore error, continue checking original port
      }
    } catch (error) {
      console.log(`Attempt ${i + 1}/${maxAttempts} to connect to Vite server...`);
    }
  }
  throw new Error('Vite server failed to start');
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  // Pass the API port to the renderer process
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.executeJavaScript(`
      window.API_PORT = ${API_PORT};
    `);
  });

  // In development, show loading screen and wait for Vite
  if (process.env.NODE_ENV === 'development') {
    // Show loading screen
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getLoadingHTML())}`);

    // Wait for Vite server and then load the app
    waitForViteServer(VITE_PORT).then(() => {
      mainWindow.loadURL(`http://localhost:${VITE_PORT}`);
    }).catch((error) => {
      console.error('Failed to connect to Vite server:', error);
    });

    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from our static server
    mainWindow.loadURL(`http://127.0.0.1:${STATIC_PORT}`);
    mainWindow.webContents.openDevTools(); // Keep for debugging
  }

  return mainWindow;
}

function startPythonServer(port) {
  return new Promise((resolve, reject) => {
    const pythonPath = getPythonPath();
    const serverScript = getServerScriptPath();

    console.log(`Starting Python server with: "${pythonPath}" "${serverScript}" ${port}`);

    // Use detached option and create process group
    pythonProcess = exec(`"${pythonPath}" "${serverScript}" ${port}`, {
      detached: true,
      windowsHide: true
    }, (error) => {
      if (error) {
        console.error(`Failed to start Python server: ${error}`);
        reject(error);
      }
    });

    // Unref the process to allow the parent to exit independently
    if (pythonProcess.stdout) pythonProcess.stdout.unref();
    if (pythonProcess.stderr) pythonProcess.stderr.unref();

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python server stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.log(`Python server stderr: ${data}`);
    });

    waitForServer(port)
      .then(() => resolve())
      .catch(reject);
  });
}

// Function to start Vite development server
function startViteServer() {
  return new Promise((resolve, reject) => {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const frontendPath = path.join(__dirname, 'frontend');

    viteProcess = spawn(npmCmd, ['run', 'dev'], {
      cwd: frontendPath,
      shell: true,
      env: { ...process.env, PORT: VITE_PORT }
    });

    viteProcess.stdout.on('data', (data) => {
      const output = data.toString();
      // Only log Vite-specific messages
      if (output.includes('VITE') || output.includes('Local:') || output.includes('Network:')) {
        console.log(output.trim());
      }
      // Check if Vite is ready
      if (output.includes('VITE') && output.includes('ready')) {
        resolve();
      }
    });

    viteProcess.stderr.on('data', (data) => {
      console.error(`Vite error: ${data}`);
    });

    viteProcess.on('error', (error) => {
      console.error('Failed to start Vite:', error);
      reject(error);
    });

    // Set a timeout for Vite startup
    setTimeout(() => {
      reject(new Error('Vite server startup timeout'));
    }, 30000);
  });
}

// Function to setup Python virtual environment
async function setupPythonEnvironment() {
  const pythonDir = getPythonResources();
  const venvPath = path.join(pythonDir, 'venv');

  // Ensure python directory exists
  if (!fs.existsSync(pythonDir)) {
    fs.mkdirSync(pythonDir, { recursive: true });
  }

  // Check if venv already exists
  if (!fs.existsSync(venvPath)) {
    console.log('Python virtual environment not found, creating...');
    console.log('Python directory:', pythonDir);

    return new Promise((resolve, reject) => {
      // Create virtual environment
      exec('python -m venv venv', {
        cwd: pythonDir
      }, (error) => {
        if (error) {
          console.error('Failed to create virtual environment:', error);
          reject(error);
          return;
        }

        // Install requirements using pip
        const pythonPath = getPythonPath();
        const requirementsPath = path.join(pythonDir, 'requirements.txt');

        console.log('Python dependencies not found, installing...');
        exec(`"${pythonPath}" -m pip install -r "${requirementsPath}"`, (error) => {
          if (error) {
            console.error('Failed to install Python dependencies:', error);
            reject(new Error('Failed to install Python dependencies: ' + error));
            return;
          }
          resolve();
        });
      });
    });
  }
  return Promise.resolve();
}

// Function to ensure resources are copied
async function ensureResources() {
  if (app.isPackaged) {
    const resourcesPath = path.join(process.resourcesPath, 'app-resources');
    const userDataPath = path.join(app.getPath('userData'), 'app-resources');

    // Create directory if it doesn't exist
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });

      // Copy requirements.txt and server.py
      fs.copyFileSync(
        path.join(resourcesPath, 'requirements.txt'),
        path.join(userDataPath, 'requirements.txt')
      );
      fs.copyFileSync(
        path.join(resourcesPath, 'server.py'),
        path.join(userDataPath, 'server.py')
      );
    }
  }
}

// Function to check if Python dependencies are installed
async function checkPythonDependencies() {
  const pythonPath = getPythonPath();
  const venvPath = path.dirname(pythonPath);
  const pipPath = path.join(venvPath, process.platform === 'win32' ? 'pip.exe' : 'pip');

  // First check if venv exists
  if (!fs.existsSync(pythonPath)) {
    console.log('Python virtual environment not found, creating...');
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    await new Promise((resolve, reject) => {
      exec(`${pythonCmd} -m venv "${path.join(getPythonResources(), 'venv')}"`, (error) => {
        if (error) {
          console.error('Failed to create virtual environment:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  // Always install/upgrade requirements to ensure they're up to date
  try {
    await new Promise((resolve, reject) => {
      const requirementsPath = path.join(getPythonResources(), 'requirements.txt');
      console.log('Ensuring Python dependencies are up to date...');
      exec(`"${pythonPath}" -m pip install -r "${requirementsPath}" --upgrade`, (error) => {
        if (error) {
          console.error('Failed to install/upgrade Python dependencies:', error);
          reject(error);
        } else {
          console.log('Python dependencies are up to date');
          resolve();
        }
      });
    });
  } catch (error) {
    throw new Error('Failed to setup Python environment: ' + error.message);
  }
}

// Set up proper exit handlers
function setupExitHandlers() {
  let isCleaningUp = false;

  async function handleExit(reason) {
    if (isCleaningUp) return;
    isCleaningUp = true;

    console.log(`Exiting due to ${reason}...`);
    process.exit(0);
  }

  // Handle window-all-closed
  app.on('window-all-closed', () => handleExit('all windows closed'));

  // Handle app quit
  app.on('quit', () => handleExit('application quit'));

  // Handle process termination signals
  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, () => handleExit(signal));
  });
}

app.whenReady().then(async () => {
  try {
    setupExitHandlers();

    // Ensure resources are available
    await ensureResources();

    // Kill any existing Python processes
    await killExistingPythonProcesses();

    // Check and install Python dependencies
    await checkPythonDependencies();

    // Find available ports
    API_PORT = await findAvailablePort(8000);
    STATIC_PORT = await findAvailablePort(3000);
    VITE_PORT = await findAvailablePort(5174);

    console.log(`Found available ports - API: ${API_PORT}, Static: ${STATIC_PORT}, Vite: ${VITE_PORT}`);

    if (process.env.NODE_ENV === 'development') {
      console.log('Starting development servers...');
      await startViteServer();
    }

    // Start both servers
    await startPythonServer(API_PORT);
    startStaticServer(STATIC_PORT);
    console.log('All servers started successfully');

    // Then create the window
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
});
