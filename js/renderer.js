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

window.powerManager = new window.OS.PowerManager((battery, drainRate, batterySaver, isCharging) => {
  const batText = document.getElementById('battery-text');
  const batIcon = document.getElementById('battery-icon');
  const saverIcon = document.getElementById('saver-icon');

  if (batText) batText.innerText = `${Math.max(0, battery).toFixed(0)}%`;
  
  if (saverIcon) {
    if (batterySaver) saverIcon.classList.remove('hidden');
    else saverIcon.classList.add('hidden');
  }

  if (batIcon) {
    if (isCharging) {
      batIcon.innerText = '⚡';
    } else if (battery <= 15) {
      batIcon.innerText = '🪫';
    } else if (batterySaver) {
      batIcon.innerText = '🍃';
    } else {
      batIcon.innerText = '🔋';
    }
  }

  if (battery <= 0 && !isCharging) {
    if (window.powerOffSystem) window.powerOffSystem();
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
  'contacts': new window.Apps.ContactsApp(),
  'music': new window.Apps.MusicApp(),
  'clock': new window.Apps.ClockApp(),
  'calculator': new window.Apps.CalculatorApp(),
  'calendar': new window.Apps.CalendarApp(),
  'telegram': new window.Apps.TelegramApp(),
  'gps': new window.Apps.GPSApp()
};

// Shape-based Floral Wallpapers Engine (using SVG vector shapes & geometric petals)
window.applyWallpaper = function(wallpaper) {
  const screen = document.getElementById('screen');
  const shapesLayer = document.getElementById('wallpaper-shapes-layer');
  if (!screen) return;
  if (shapesLayer) shapesLayer.innerHTML = '';

  if (wallpaper === 'solid-black') {
    screen.style.backgroundImage = 'none';
    screen.style.backgroundColor = '#000000';
    return;
  }

  screen.style.backgroundColor = 'transparent';

  if (wallpaper === 'sakura-shapes' || wallpaper === 'sakura') {
    screen.style.backgroundImage = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #feada6 100%)';
    if (shapesLayer) {
      shapesLayer.innerHTML = `
        <svg class="wallpaper-svg-shapes" viewBox="0 0 320 650" xmlns="http://www.w3.org/2000/svg">
          <!-- Geometric Sakura Petals (Strictly Outside Icon Grid Zone) -->
          <g fill="rgba(255, 255, 255, 0.3)" stroke="rgba(232, 67, 147, 0.3)" stroke-width="1.5">
            <!-- Top Right Corner (Above Grid) -->
            <g transform="translate(285, 35) scale(0.65)">
              <circle cx="0" cy="-25" r="16" />
              <circle cx="23" cy="-8" r="16" />
              <circle cx="15" cy="20" r="16" />
              <circle cx="-15" cy="20" r="16" />
              <circle cx="-23" cy="-8" r="16" />
              <circle cx="0" cy="0" r="8" fill="#e84393" opacity="0.8" />
            </g>
            <!-- Top Left Corner (Above Grid) -->
            <g transform="translate(35, 35) scale(0.55)">
              <circle cx="0" cy="-25" r="16" />
              <circle cx="23" cy="-8" r="16" />
              <circle cx="15" cy="20" r="16" />
              <circle cx="-15" cy="20" r="16" />
              <circle cx="-23" cy="-8" r="16" />
              <circle cx="0" cy="0" r="8" fill="#e84393" opacity="0.8" />
            </g>
            <!-- Bottom Margin (Below Grid) -->
            <g transform="translate(160, 630) scale(0.6)">
              <circle cx="0" cy="-25" r="16" />
              <circle cx="23" cy="-8" r="16" />
              <circle cx="15" cy="20" r="16" />
              <circle cx="-15" cy="20" r="16" />
              <circle cx="-23" cy="-8" r="16" />
              <circle cx="0" cy="0" r="10" fill="#fd79a8" opacity="0.8" />
            </g>
          </g>
        </svg>
      `;
    }
  } else if (wallpaper === 'sunflower-shapes' || wallpaper === 'sunflower') {
    screen.style.backgroundImage = 'linear-gradient(135deg, #1e0f00 0%, #b76e00 50%, #f6d365 100%)';
    if (shapesLayer) {
      shapesLayer.innerHTML = `
        <svg class="wallpaper-svg-shapes" viewBox="0 0 320 650" xmlns="http://www.w3.org/2000/svg">
          <!-- Geometric Sunflower Shapes (Strictly Outside Icon Grid Zone) -->
          <g transform="translate(285, 35) scale(0.55)" fill="rgba(241, 196, 15, 0.35)" stroke="rgba(230, 126, 34, 0.3)" stroke-width="2">
            <ellipse cx="0" cy="-60" rx="10" ry="30" transform="rotate(0)" />
            <ellipse cx="0" cy="-60" rx="10" ry="30" transform="rotate(45)" />
            <ellipse cx="0" cy="-60" rx="10" ry="30" transform="rotate(90)" />
            <ellipse cx="0" cy="-60" rx="10" ry="30" transform="rotate(135)" />
            <ellipse cx="0" cy="-60" rx="10" ry="30" transform="rotate(180)" />
            <ellipse cx="0" cy="-60" rx="10" ry="30" transform="rotate(225)" />
            <ellipse cx="0" cy="-60" rx="10" ry="30" transform="rotate(270)" />
            <ellipse cx="0" cy="-60" rx="10" ry="30" transform="rotate(315)" />
            <circle cx="0" cy="0" r="28" fill="#5d4037" stroke="#e67e22" stroke-width="2" />
          </g>
          <g transform="translate(35, 625) scale(0.55)" fill="rgba(241, 196, 15, 0.35)" stroke="rgba(230, 126, 34, 0.3)" stroke-width="2">
            <ellipse cx="0" cy="-60" rx="10" ry="30" transform="rotate(0)" />
            <ellipse cx="0" cy="-60" rx="10" ry="30" transform="rotate(45)" />
            <ellipse cx="0" cy="-60" rx="10" ry="30" transform="rotate(90)" />
            <ellipse cx="0" cy="-60" rx="10" ry="30" transform="rotate(135)" />
            <circle cx="0" cy="0" r="28" fill="#5d4037" />
          </g>
        </svg>
      `;
    }
  } else if (wallpaper === 'lotus-shapes' || wallpaper === 'midnight-garden') {
    screen.style.backgroundImage = 'linear-gradient(135deg, #0f0c29 0%, #1e1b4b 50%, #24243e 100%)';
    if (shapesLayer) {
      shapesLayer.innerHTML = `
        <svg class="wallpaper-svg-shapes" viewBox="0 0 320 650" xmlns="http://www.w3.org/2000/svg">
          <!-- Geometric Lotus Shapes (Strictly Outside Icon Grid Zone) -->
          <g transform="translate(160, 625) scale(0.65)" fill="rgba(162, 155, 254, 0.35)" stroke="#00cec9" stroke-width="1.5">
            <path d="M 0,0 C -30,-40 -40,-80 0,-100 C 40,-80 30,-40 0,0 Z" />
            <path d="M 0,0 C -50,-20 -80,-50 -60,-90 C -20,-70 0,-40 0,0 Z" opacity="0.8" />
            <path d="M 0,0 C 50,-20 80,-50 60,-90 C 20,-70 0,-40 0,0 Z" opacity="0.8" />
            <circle cx="0" cy="-35" r="10" fill="#fd79a8" opacity="0.8" />
          </g>
        </svg>
      `;
    }
  } else if (wallpaper === 'rose-shapes') {
    screen.style.backgroundImage = 'linear-gradient(135deg, #2c000e 0%, #80091d 50%, #b00020 100%)';
    if (shapesLayer) {
      shapesLayer.innerHTML = `
        <svg class="wallpaper-svg-shapes" viewBox="0 0 320 650" xmlns="http://www.w3.org/2000/svg">
          <!-- Rose Spiral Shapes (Strictly Outside Icon Grid Zone) -->
          <g transform="translate(285, 35) scale(0.55)" fill="none" stroke="rgba(255, 118, 117, 0.4)" stroke-width="2">
            <path d="M0,0 Q-20,-40 0,-70 Q40,-50 0,0" fill="rgba(214, 48, 49, 0.35)" />
            <circle cx="0" cy="0" r="14" fill="#d63031" opacity="0.7" />
          </g>
          <g transform="translate(35, 625) scale(0.55)" fill="none" stroke="rgba(255, 118, 117, 0.4)" stroke-width="2">
            <path d="M0,0 Q-20,-40 0,-70 Q40,-50 0,0" fill="rgba(214, 48, 49, 0.35)" />
            <circle cx="0" cy="0" r="14" fill="#d63031" opacity="0.7" />
          </g>
        </svg>
      `;
    }
  } else {
    // Default 'botanical-spectrum' FlowerOS wallpaper
    screen.style.backgroundImage = 'linear-gradient(135deg, #1e0524 0%, #571845 50%, #900c3f 100%)';
    if (shapesLayer) {
      shapesLayer.innerHTML = `
        <svg class="wallpaper-svg-shapes" viewBox="0 0 320 650" xmlns="http://www.w3.org/2000/svg">
          <!-- Top Corner Flower Bloom (Strictly Outside Icon Grid Zone) -->
          <g transform="translate(285, 35) scale(0.55)" fill="rgba(232, 67, 147, 0.4)" stroke="#ff7675" stroke-width="1.5">
            <circle cx="0" cy="-25" r="16" />
            <circle cx="23" cy="-8" r="16" />
            <circle cx="15" cy="20" r="16" />
            <circle cx="-15" cy="20" r="16" />
            <circle cx="-23" cy="-8" r="16" />
            <circle cx="0" cy="0" r="10" fill="#f1c40f" opacity="0.8" />
          </g>
        </svg>
      `;
    }
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
        app.initiateTelegramCall(params.number);
      } else if (appId === 'messages' && params.action === 'chat') {
        app.initiateTelegramChat(params.number, params.name);
      } else if (appId === 'telegram') {
        if (params.action === 'call' || params.action === 'chat') {
          app.openContact(params.number, params.name);
        }
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

// --- System Power Controls (Bloquear, Reiniciar, Apagar) ---
window.showPowerMenu = function() {
  const modal = document.getElementById('power-menu-modal');
  if (modal) modal.classList.remove('hidden');
};

window.hidePowerMenu = function() {
  const modal = document.getElementById('power-menu-modal');
  if (modal) modal.classList.add('hidden');
};

window.lockSystem = function() {
  window.hidePowerMenu();
  const lockScreen = document.getElementById('lock-screen');
  const pinContainer = document.getElementById('lock-pin-container');
  const swipeText = document.getElementById('lock-swipe-text');
  const pinInput = document.getElementById('lock-pin-input');

  if (lockScreen) {
    lockScreen.classList.add('active');
    const notif = document.getElementById('lock-notif-msg');
    if (notif) notif.style.display = 'none';
  }

  if (swipeText) swipeText.style.display = 'block';
  if (pinContainer) pinContainer.classList.add('hidden');
  if (pinInput) pinInput.value = '';

  if (window.goHome) window.goHome();
};

window.restartSystem = function() {
  window.hidePowerMenu();
  const rebootScreen = document.getElementById('reboot-screen');
  if (rebootScreen) rebootScreen.classList.remove('hidden');

  setTimeout(() => {
    // Reset processes & reload settings
    const settings = window.fileSystem.getSettings();
    if (settings.wallpaper) window.applyWallpaper(settings.wallpaper);
    if (rebootScreen) rebootScreen.classList.add('hidden');
    window.lockSystem();
  }, 2200);
};

window.powerOffSystem = function() {
  window.hidePowerMenu();
  const offScreen = document.getElementById('powered-off-screen');
  if (offScreen) offScreen.classList.remove('hidden');
};

window.turnOnSystem = function() {
  const offScreen = document.getElementById('powered-off-screen');
  if (offScreen) offScreen.classList.add('hidden');

  const rebootScreen = document.getElementById('reboot-screen');
  if (rebootScreen) {
    rebootScreen.classList.remove('hidden');
    setTimeout(() => {
      rebootScreen.classList.add('hidden');
      window.lockSystem();
    }, 1800);
  } else {
    window.lockSystem();
  }
};

// Power Buttons Event Listeners
const physPowerBtn = document.getElementById('physical-power-btn');
if (physPowerBtn) {
  physPowerBtn.addEventListener('click', () => {
    window.showPowerMenu();
  });
}

const statusPowerTrigger = document.getElementById('btn-power-menu-trigger');
if (statusPowerTrigger) {
  statusPowerTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    window.showPowerMenu();
  });
}

const closePowerMenuBtn = document.getElementById('btn-close-power-menu');
if (closePowerMenuBtn) {
  closePowerMenuBtn.addEventListener('click', window.hidePowerMenu);
}

const btnPowerLock = document.getElementById('btn-power-lock');
if (btnPowerLock) btnPowerLock.addEventListener('click', window.lockSystem);

const btnPowerRestart = document.getElementById('btn-power-restart');
if (btnPowerRestart) btnPowerRestart.addEventListener('click', window.restartSystem);

const btnPowerOff = document.getElementById('btn-power-off');
if (btnPowerOff) btnPowerOff.addEventListener('click', window.powerOffSystem);

const btnTurnOnDevice = document.getElementById('btn-turn-on-device');
if (btnTurnOnDevice) btnTurnOnDevice.addEventListener('click', window.turnOnSystem);

