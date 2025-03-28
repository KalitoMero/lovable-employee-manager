
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

// Path for storing app data locally (outside of app installation directory)
const userDataPath = app.getPath('userData');
const employeesDataPath = path.join(userDataPath, 'employees.json');
const settingsDataPath = path.join(userDataPath, 'settings.json');

// Create the main application window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // Load the app - from dev server in development, from build folder in production
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Initialize the app
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Set up IPC handlers for file operations
ipcMain.handle('loadEmployees', async () => {
  try {
    if (fs.existsSync(employeesDataPath)) {
      const data = fs.readFileSync(employeesDataPath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading employees:', error);
    return [];
  }
});

ipcMain.handle('saveEmployees', async (_, employees) => {
  try {
    fs.writeFileSync(employeesDataPath, JSON.stringify(employees, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving employees:', error);
    return false;
  }
});

ipcMain.handle('loadSettings', async () => {
  try {
    if (fs.existsSync(settingsDataPath)) {
      const data = fs.readFileSync(settingsDataPath, 'utf8');
      return JSON.parse(data);
    }
    return { 
      notificationEmail: null,
      emailSettings: {
        gf: ['', '', '', '', ''],
        departmentEmails: []
      }
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return { 
      notificationEmail: null,
      emailSettings: {
        gf: ['', '', '', '', ''],
        departmentEmails: []
      }
    };
  }
});

ipcMain.handle('saveSettings', async (_, settings) => {
  try {
    fs.writeFileSync(settingsDataPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
});
