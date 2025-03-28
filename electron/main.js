const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';
const nodemailer = require('nodemailer');

// Path for storing app data locally (outside of app installation directory)
const userDataPath = app.getPath('userData');
const employeesDataPath = path.join(userDataPath, 'employees.json');
const settingsDataPath = path.join(userDataPath, 'settings.json');

// Track birthday notification sent today
let birthdayCheckedToday = false;

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

  // Check for birthdays on app start
  checkForBirthdaysAndNotify();
}

// Initialize the app
app.whenReady().then(() => {
  createWindow();

  // Schedule birthday check daily at 6AM
  scheduleDailyBirthdayCheck();

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Schedule daily birthday check at 6AM
function scheduleDailyBirthdayCheck() {
  const now = new Date();
  const sixAM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    6, 0, 0
  );
  
  // If it's already past 6AM, schedule for tomorrow
  if (now > sixAM) {
    sixAM.setDate(sixAM.getDate() + 1);
  }
  
  const timeToSixAM = sixAM.getTime() - now.getTime();
  
  // Schedule the first check
  setTimeout(() => {
    checkForBirthdaysAndNotify();
    
    // Then schedule the check to happen daily at 6AM
    setInterval(checkForBirthdaysAndNotify, 24 * 60 * 60 * 1000);
  }, timeToSixAM);
}

// Function to check for birthdays and send notifications
async function checkForBirthdaysAndNotify() {
  try {
    // Reset the flag at midnight
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      birthdayCheckedToday = false;
    }
    
    // If we've already sent notifications today, don't send again
    if (birthdayCheckedToday) {
      return;
    }
    
    // Load employees and settings
    const employees = await loadEmployees();
    const settings = await loadSettings();
    
    if (!settings.emailSettings) {
      console.log("No email settings configured, skipping birthday notifications");
      return;
    }
    
    // Today's date in MM-DD format
    const today = new Date();
    const todayMMDD = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    // Find employees with birthdays today
    const birthdayEmployees = employees.filter(emp => {
      if (!emp.birthDate) return false;
      const birthDate = new Date(emp.birthDate);
      const birthDateMMDD = `${(birthDate.getMonth() + 1).toString().padStart(2, '0')}-${birthDate.getDate().toString().padStart(2, '0')}`;
      return birthDateMMDD === todayMMDD;
    });
    
    if (birthdayEmployees.length > 0) {
      console.log(`Found ${birthdayEmployees.length} employees with birthdays today!`);
      await sendBirthdayEmails(birthdayEmployees, settings.emailSettings);
      birthdayCheckedToday = true;
    } else {
      console.log("No birthdays today");
    }
  } catch (error) {
    console.error("Error checking for birthdays:", error);
  }
}

// Function to send birthday emails
async function sendBirthdayEmails(birthdayEmployees, emailSettings) {
  try {
    // Create email transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Replace with your SMTP server
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || '', // These should be set via environment variables
        pass: process.env.EMAIL_PASS || '',
      },
    });
    
    // Send email for each birthday employee
    for (const employee of birthdayEmployees) {
      // Get GF emails (filter out empty ones)
      const gfEmails = emailSettings.gf.filter(email => email.trim() !== '');
      
      // Find department leader email for employee's cost center
      const departmentEmail = emailSettings.departmentEmails.find(
        item => item.costCenter === employee.costCenter
      );
      
      // Combine recipient list
      const toEmails = gfEmails.slice();
      if (departmentEmail) {
        toEmails.push(departmentEmail.email);
      }
      
      if (toEmails.length === 0) {
        console.log(`No recipients configured for employee ${employee.name}, skipping notification`);
        continue;
      }
      
      // Format email
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@example.com',
        to: toEmails.join(', '),
        subject: `Geburtstag: ${employee.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Mitarbeiter Geburtstag</h2>
            <p>Heute hat folgender Mitarbeiter Geburtstag:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Name:</strong> ${employee.name}</p>
              <p><strong>Kostenstelle:</strong> ${employee.costCenter}</p>
            </div>
            <p>Diese automatische Benachrichtigung wurde vom Mitarbeiter-Verwaltungssystem gesendet.</p>
          </div>
        `
      };
      
      // Send the email
      console.log(`Sending birthday email for ${employee.name} to ${toEmails.join(', ')}`);
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error("Error sending birthday emails:", error);
  }
}

// Helper function to load employees
async function loadEmployees() {
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
}

// Helper function to load settings
async function loadSettings() {
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
}

// Set up IPC handlers for file operations
ipcMain.handle('loadEmployees', async () => {
  return await loadEmployees();
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
  return await loadSettings();
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

// Add IPC handler for manual birthday check
ipcMain.handle('checkBirthdays', async () => {
  await checkForBirthdaysAndNotify();
  return true;
});
