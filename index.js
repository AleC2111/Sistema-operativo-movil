const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    title: 'FlowerOS Mobile',
    width: 450,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simplicity in this local project, we'll allow node integration directly
      webviewTag: true,
      sandbox: false
    },
    resizable: true
  });

  // Set session permissions for Telegram Web and camera access
  const session = win.webContents.session;
  session.setPermissionRequestHandler((webContents, permission, callback) => {
    // Allow camera, microphone, notifications, and media permissions for Telegram WebRTC calls
    const allowedPermissions = ['media', 'video', 'audio', 'notifications', 'pointerLock', 'fullscreen'];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(true); // Allow by default for full Telegram Web integration
    }
  });

  win.loadFile('index.html');
  
  // Open DevTools for debugging (can be commented out later)
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handler for taking photos (selecting file from host)
ipcMain.handle('take-photo', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]; // Return the absolute path of the selected image
  }
  return null;
});
