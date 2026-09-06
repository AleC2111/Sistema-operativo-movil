// Initialize OS Core
window.fileSystem = new window.OS.FileSystemManager();
window.hardwareSensors = new window.OS.HardwareSensors();

window.showToast = function(msg) {
  const overlay = document.getElementById('os-overlay');
  const toast = document.getElementById('toast-message');
  toast.innerText = msg;
  overlay.classList.remove('hidden');
  setTimeout(() => {
    overlay.classList.add('hidden');
  }, 2500);
};

window.powerManager = new window.OS.PowerManager((battery, drainRate) => {
  document.getElementById('battery-text').innerText = `${Math.max(0, battery).toFixed(0)}%`;
  
  if (battery <= 15) {
    document.getElementById('battery-icon').innerText = '🪫';
  } else {
    document.getElementById('battery-icon').innerText = '🔋';
  }

  if (battery <= 0) {
    document.getElementById('screen').style.display = 'none'; // Phone dies
  }
});

window.processManager = new window.OS.ProcessManager(window.powerManager, window.showToast);

// Instantiate Apps
const appInstances = {
  'settings': new window.Apps.SettingsApp(),
  'dev-options': new window.Apps.DevOptionsApp(),
  'file-explorer': new window.Apps.FileExplorerApp(),
  'camera': new window.Apps.CameraApp(),
  'gallery': new window.Apps.GalleryApp(),
  'browser': new window.Apps.BrowserApp(),
  'phone': new window.Apps.PhoneApp(),
  'messages': new window.Apps.MessagesApp(),
  'whatsapp-web': new window.Apps.WhatsAppWebApp(),
  'contacts': new window.Apps.ContactsApp(),
  'music': new window.Apps.MusicApp(),
  'clock': new window.Apps.ClockApp(),
  'calculator': new window.Apps.CalculatorApp(),
  'calendar': new window.Apps.CalendarApp()
};

window.applyWallpaper = function(wallpaper) {
  const screen = document.getElementById('screen');
  if (wallpaper === 'solid-black') {
    screen.style.backgroundImage = 'none';
    screen.style.backgroundColor = '#000000';
  } else if (wallpaper === 'nature') {
    screen.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"100%\\" height=\\"100%\\"><rect width=\\"100%\\" height=\\"100%\\" fill=\\"%2327ae60\\"/><circle cx=\\"50%\\" cy=\\"50%\\" r=\\"20%\\" fill=\\"%23f1c40f\\"/></svg>")';
    screen.style.backgroundSize = 'cover';
    screen.style.backgroundPosition = 'center';
  } else {
    // Default gradient
    screen.style.backgroundImage = 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)';
    screen.style.backgroundColor = 'transparent';
  }
};

// Apply initial settings
const initSettings = window.fileSystem.getSettings();
if (initSettings.accentColor) {
  document.documentElement.style.setProperty('--accent-color', initSettings.accentColor);
}
if (initSettings.theme) {
  document.getElementById('screen').classList.add(`theme-${initSettings.theme}`);
}
if (initSettings.wallpaper) {
  window.applyWallpaper(initSettings.wallpaper);
}

for (let id in appInstances) {
  window.processManager.registerApp(id, appInstances[id]);
}

// Global functions for inline HTML events (like in DevOptions)
window.deleteFile = function(id) {
  window.fileSystem.deleteFile(id);
  appInstances['file-explorer'].renderFiles();
};

window.openNote = function(id) {
  const file = window.fileSystem.getFiles().find(f => f.id === id);
  if (file && file.type === 'text/plain') {
    const explorer = appInstances['file-explorer'].content;
    explorer.querySelector('#file-list').style.display = 'none';
    explorer.querySelector('#btn-new-note').style.display = 'none';
    explorer.querySelector('#text-editor').style.display = 'block';
    explorer.querySelector('#text-editor').setAttribute('data-editing-id', id);
    explorer.querySelector('#editor-title').value = file.name;
    explorer.querySelector('#editor-content').value = file.content;
  }
};

window.viewPhoto = function(id) {
  const file = window.fileSystem.getFiles().find(f => f.id === id);
  if (file && file.type.startsWith('image/')) {
    const gallery = appInstances['gallery'].content;
    gallery.querySelector('#gallery-grid').style.display = 'none';
    const viewer = gallery.querySelector('#photo-viewer');
    viewer.style.display = 'block';
    viewer.setAttribute('data-photo-id', id);
    const src = file.content.startsWith('data:') ? file.content : `file://${file.content}`;
    viewer.querySelector('#viewer-img').src = src;
  }
};

window.closePhoto = function() {
  const gallery = appInstances['gallery'].content;
  gallery.querySelector('#photo-viewer').style.display = 'none';
  gallery.querySelector('#gallery-grid').style.display = 'grid';
};

window.deletePhoto = function() {
  const gallery = appInstances['gallery'].content;
  const id = gallery.querySelector('#photo-viewer').getAttribute('data-photo-id');
  window.fileSystem.deleteFile(id);
  window.closePhoto();
  appInstances['gallery'].renderGallery();
  window.showToast('Photo deleted');
};

window.setWallpaper = function() {
  const gallery = appInstances['gallery'].content;
  const img = gallery.querySelector('#viewer-img');
  document.getElementById('screen').style.backgroundImage = `url("${img.src}")`;
  document.getElementById('screen').style.backgroundSize = 'cover';
  document.getElementById('screen').style.backgroundPosition = 'center';
  window.showToast('Wallpaper applied');
};

window.editPhoto = function() {
  const gallery = appInstances['gallery'].content;
  const id = gallery.querySelector('#photo-viewer').getAttribute('data-photo-id');
  const img = gallery.querySelector('#viewer-img');
  const canvas = gallery.querySelector('#viewer-canvas');
  
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  
  ctx.filter = 'grayscale(100%)';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  const dataUrl = canvas.toDataURL('image/jpeg');
  const file = window.fileSystem.getFiles().find(f => f.id === id);
  window.fileSystem.updateFile(id, file ? file.name : 'Edited.jpg', dataUrl);
  
  img.src = dataUrl;
  window.showToast('B&W Filter Applied & Saved');
};

// UI Interactions
let currentApp = null;

// Launcher
document.querySelectorAll('.app-icon').forEach(icon => {
  icon.addEventListener('click', () => {
    const appId = icon.getAttribute('data-app');
    launchApp(appId);
  });
});

function launchApp(appId) {
  currentApp = appId;
  document.getElementById('home-screen').style.display = 'none';
  window.processManager.launchApp(appId);
}

window.launchAppWithParams = function(appId, params) {
  launchApp(appId);
  setTimeout(() => {
    const app = appInstances[appId];
    if (app) {
      if (appId === 'phone' && params.action === 'call') {
        const display = app.content.querySelector('#dialer-display');
        if (display) display.innerText = params.number;
        app.renderCallScreen(params.number);
      } else if (appId === 'messages' && params.action === 'chat') {
        // Ensure conversation exists
        let conv = app.conversations.find(c => c.number === params.number);
        if (!conv) {
          conv = { id: Date.now().toString(), name: params.name, number: params.number, messages: [] };
          app.conversations.push(conv);
          window.fileSystem.saveConversations(app.conversations);
        }
        app.renderChat(conv.id);
      }
    }
  }, 100); // small delay to ensure app UI is loaded
};

function goHome() {
  if (currentApp) {
    window.processManager.pauseApp(currentApp);
    currentApp = null;
  }
  document.getElementById('home-screen').style.display = 'block';
}

// Gesture Bar (Swipe up to go home)
let startY = 0;
const gestureBar = document.getElementById('gesture-bar');

gestureBar.addEventListener('mousedown', (e) => {
  startY = e.clientY;
});
document.addEventListener('mouseup', (e) => {
  if (startY > 0) {
    const diff = startY - e.clientY;
    if (diff > 30) { // Swiped up
      goHome();
    }
    startY = 0;
  }
});

// Clock
let lastTriggeredAlarmTime = '';
window.updateClock = function() {
  const d = new Date();
  const settings = window.fileSystem.getSettings();
  const opts = { hour: '2-digit', minute:'2-digit', hour12: !settings.use24h };
  const timeStr = d.toLocaleTimeString([], opts);
  
  document.getElementById('clock').innerText = timeStr;
  
  const lockClock = document.getElementById('lock-clock');
  if (lockClock) lockClock.innerText = timeStr;

  const lockDate = document.getElementById('lock-date');
  if (lockDate) {
    const dateOpts = { weekday: 'long', day: 'numeric', month: 'short' };
    lockDate.innerText = d.toLocaleDateString('en-US', dateOpts); // Example: Monday, 1 Jan
  }

  // Check Alarms
  const currentHM = d.toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit', hour12: false });
  const alarms = window.fileSystem.getAlarms();
  if (alarms.includes(currentHM) && lastTriggeredAlarmTime !== currentHM) {
    window.showToast("⏰ ALARM: " + currentHM);
    lastTriggeredAlarmTime = currentHM;
    // Notify lock screen if locked
    if (document.getElementById('lock-screen').classList.contains('active')) {
      const notif = document.getElementById('lock-notif-msg');
      if (notif) {
        notif.innerText = "⏰ ALARM: " + currentHM;
        notif.style.display = 'flex';
      }
    }
  }
};
setInterval(window.updateClock, 1000);
window.updateClock();

// Lock Screen Logic
const lockScreen = document.getElementById('lock-screen');
const statusBar = document.getElementById('status-bar');
const pinContainer = document.getElementById('lock-pin-container');
const pinInput = document.getElementById('lock-pin-input');
const swipeText = document.getElementById('lock-swipe-text');

let currentPin = '';

// Lock the phone (double click status bar)
statusBar.addEventListener('dblclick', () => {
  lockScreen.classList.add('active');
  const notif = document.getElementById('lock-notif-msg');
  if (notif) notif.style.display = 'none'; // clear lock notifications on lock
  
  // reset pin state
  currentPin = '';
  if (pinInput) pinInput.value = '';
  
  // Go home when locking so it's clean on unlock
  goHome();
});

// Unlock logic
let lockStartY = 0;
lockScreen.addEventListener('mousedown', (e) => {
  lockStartY = e.clientY;
});
lockScreen.addEventListener('mouseup', (e) => {
  if (lockStartY > 0) {
    const diff = lockStartY - e.clientY;
    if (diff > 50) { // Swiped up
      const settings = window.fileSystem.getSettings();
      if (settings.lockPin && settings.lockPin.length === 4) {
        // Show PIN pad
        swipeText.style.display = 'none';
        pinContainer.classList.remove('hidden');
      } else {
        // Unlock directly
        lockScreen.classList.remove('active');
      }
    }
    lockStartY = 0;
  }
});

// PIN Pad logic
document.querySelectorAll('.pin-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // don't trigger swipe logic
    if (btn.classList.contains('pin-clear')) {
      currentPin = '';
      pinInput.value = '';
    } else if (btn.classList.contains('pin-enter')) {
      const settings = window.fileSystem.getSettings();
      if (currentPin === settings.lockPin) {
        // Unlock
        lockScreen.classList.remove('active');
        swipeText.style.display = 'block';
        pinContainer.classList.add('hidden');
        currentPin = '';
        pinInput.value = '';
      } else {
        window.showToast('Incorrect PIN');
        currentPin = '';
        pinInput.value = '';
      }
    } else {
      if (currentPin.length < 4) {
        currentPin += btn.innerText;
        pinInput.value = currentPin;
      }
    }
  });
});
