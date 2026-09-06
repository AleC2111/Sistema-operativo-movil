const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');

// --- FileSystem Manager ---
class FileSystemManager {
  constructor() {
    this.vfsPath = path.join(__dirname, '..', '.os-vfs.json');
    this.load();
  }

  load() {
    if (fs.existsSync(this.vfsPath)) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.vfsPath, 'utf-8'));
        if (!this.data.settings) this.data.settings = this.getDefaultSettings();
        if (!this.data.contacts) this.data.contacts = [];
        if (!this.data.conversations) this.data.conversations = [];
        if (!this.data.alarms) this.data.alarms = [];
      } catch(e) {
        this.data = { files: [], settings: this.getDefaultSettings(), contacts: [], conversations: [], alarms: [] };
      }
    } else {
      this.data = { files: [], settings: this.getDefaultSettings(), contacts: [], conversations: [], alarms: [] };
    }
  }

  getDefaultSettings() {
    return {
      lockPin: '',
      use24h: false,
      accentColor: '#3498db',
      theme: 'dark',
      wallpaper: 'default'
    };
  }

  getSettings() {
    return this.data.settings || this.getDefaultSettings();
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
  }

  save() {
    fs.writeFileSync(this.vfsPath, JSON.stringify(this.data, null, 2));
  }

  addFile(name, type, content, size) {
    const file = {
      id: Date.now().toString(),
      name,
      type,
      content,
      size, // in KB
      createdAt: new Date().toISOString()
    };
    this.data.files.push(file);
    this.save();
    return file;
  }

  deleteFile(id) {
    this.data.files = this.data.files.filter(f => f.id !== id);
    this.save();
  }

  updateFile(id, name, content) {
    const file = this.data.files.find(f => f.id === id);
    if (file) {
      file.name = name;
      file.content = content;
      file.size = Math.ceil(content.length / 1024);
      this.save();
    }
  }

  getFiles() {
    return this.data.files;
  }

  // --- Contacts ---
  getContacts() {
    return this.data.contacts || [];
  }
  addContact(name, number) {
    const contact = {
      id: Date.now().toString(),
      name,
      number
    };
    if (!this.data.contacts) this.data.contacts = [];
    this.data.contacts.push(contact);
    this.save();
    return contact;
  }
  deleteContact(id) {
    if (!this.data.contacts) return;
    this.data.contacts = this.data.contacts.filter(c => c.id !== id);
    this.save();
  }

  // --- Conversations ---
  getConversations() {
    return this.data.conversations || [];
  }
  saveConversations(conversations) {
    this.data.conversations = conversations;
    this.save();
  }

  // --- Calendar Events ---
  getEvents() {
    return this.data.events || {}; // Map of "YYYY-MM-DD" -> array of events
  }
  saveEvents(events) {
    this.data.events = events;
    this.save();
  }

  // --- Alarms ---
  getAlarms() {
    return this.data.alarms || [];
  }
  saveAlarms(alarms) {
    this.data.alarms = alarms;
    this.save();
  }
}

// --- Process Manager ---
class ProcessManager {
  constructor(powerManager, uiCallback) {
    this.apps = {}; // Map of appId -> App instance
    this.powerManager = powerManager;
    this.uiCallback = uiCallback; // To notify UI of RAM kills
    
    // Total Simulated RAM: 2048 MB
    this.TOTAL_RAM = 2048;
    this.RAM_THRESHOLD = 0.85; // 85%

    // Base OS RAM
    this.osRam = 400; 

    // Update stats every second
    setInterval(() => this.checkMemory(), 2000);
  }

  registerApp(appId, appInstance) {
    this.apps[appId] = {
      instance: appInstance,
      state: 'Terminated',
      ramUsage: 0,
      lastActive: 0
    };
  }

  launchApp(appId) {
    if (!this.apps[appId]) return;
    
    // Check memory before launching
    this.checkMemory();

    const proc = this.apps[appId];
    if (proc.state === 'Terminated') {
      // Simulate loading RAM
      proc.ramUsage = this.getSimulatedRam(appId);
      proc.instance.onLaunch();
    }
    
    // Put all running into Paused
    Object.keys(this.apps).forEach(id => {
      if (this.apps[id].state === 'Running') {
        this.apps[id].state = 'Paused';
        this.apps[id].instance.onPause();
      }
    });

    proc.state = 'Running';
    proc.lastActive = Date.now();
    proc.instance.onResume();
    
    this.powerManager.updateActiveApps(this.getRunningAppsCount());
  }

  pauseApp(appId) {
    if (!this.apps[appId]) return;
    const proc = this.apps[appId];
    if (proc.state === 'Running') {
      proc.state = 'Paused';
      proc.instance.onPause();
    }
  }

  terminateApp(appId) {
    if (!this.apps[appId]) return;
    const proc = this.apps[appId];
    proc.state = 'Terminated';
    proc.ramUsage = 0;
    proc.instance.onTerminate();
    this.powerManager.updateActiveApps(this.getRunningAppsCount());
  }

  getSimulatedRam(appId) {
    const baselines = {
      'settings': 120,
      'file-explorer': 150,
      'gallery': 200,
      'camera': 300,
      'dev-options': 100,
      'browser': 450, // Heavy app to test memory limits
      'phone': 150,
      'messages': 180,
      'contacts': 130,
      'music': 180,
      'clock': 100,
      'calculator': 80,
      'calendar': 110
    };
    return baselines[appId] || 100;
  }

  getTotalRamUsage() {
    let total = this.osRam;
    for (let id in this.apps) {
      total += this.apps[id].ramUsage;
    }
    return total;
  }

  getRunningAppsCount() {
    let count = 0;
    for (let id in this.apps) {
      if (this.apps[id].state === 'Running' || this.apps[id].state === 'Paused') count++;
    }
    return count;
  }

  checkMemory() {
    const currentRam = this.getTotalRamUsage();
    const ratio = currentRam / this.TOTAL_RAM;
    
    if (ratio > this.RAM_THRESHOLD) {
      // Find oldest paused app to kill
      let oldestPaused = null;
      let oldestTime = Infinity;

      for (let id in this.apps) {
        if (this.apps[id].state === 'Paused' && this.apps[id].lastActive < oldestTime) {
          oldestTime = this.apps[id].lastActive;
          oldestPaused = id;
        }
      }

      if (oldestPaused) {
        console.log(`Low Memory Killer: Terminating ${oldestPaused} to free RAM.`);
        this.terminateApp(oldestPaused);
        if (this.uiCallback) {
          this.uiCallback(`Low Memory Killer closed ${oldestPaused}`);
        }
        // Re-check memory recursively if still high (delayed slightly)
        setTimeout(() => this.checkMemory(), 500);
      }
    }
  }

  getStats() {
    let appStats = {};
    for (let id in this.apps) {
      appStats[id] = {
        state: this.apps[id].state,
        ram: this.apps[id].ramUsage
      };
    }
    return {
      totalRam: this.TOTAL_RAM,
      usedRam: this.getTotalRamUsage(),
      apps: appStats
    };
  }
}

// --- Power Manager ---
class PowerManager {
  constructor(updateCallback) {
    this.battery = 100.0;
    this.batterySaver = false;
    this.networkActive = true;
    this.brightness = 1.0; // 0.1 to 1.0
    this.activeAppsCount = 0;
    this.updateCallback = updateCallback;
    this.isUsingSystemBattery = false;

    if ('getBattery' in navigator) {
      navigator.getBattery().then(batteryManager => {
        this.isUsingSystemBattery = true;
        this.battery = batteryManager.level * 100;
        this.updateCallback(this.battery, 0); // Initial
        
        batteryManager.addEventListener('levelchange', () => {
          this.battery = batteryManager.level * 100;
          this.updateCallback(this.battery, 0);
        });
      }).catch(() => {
        setInterval(() => this.drainBattery(), 1000);
      });
    } else {
      setInterval(() => this.drainBattery(), 1000);
    }
  }

  setBatterySaver(state) {
    this.batterySaver = state;
  }
  setNetwork(state) {
    this.networkActive = state;
  }
  setBrightness(val) {
    this.brightness = val;
  }
  updateActiveApps(count) {
    this.activeAppsCount = count;
  }

  drainBattery() {
    if (this.isUsingSystemBattery) return;
    if (this.battery <= 0) return;

    let drainRate = 0.05; // Base OS drain

    if (!this.batterySaver) {
      // Brightness impact
      drainRate += (this.brightness * 0.1);
      // Network impact
      if (this.networkActive) drainRate += 0.05;
      // Apps impact
      drainRate += (this.activeAppsCount * 0.08);
    } else {
      // Battery saver throttling
      drainRate = 0.02; 
    }

    this.battery -= drainRate;
    if (this.battery < 0) this.battery = 0;

    this.updateCallback(this.battery, drainRate);
  }
}

// --- Hardware Sensors ---
class HardwareSensors {
  constructor() {
    this.gps = { lat: 10.2222, lng: -67.9739 }; // Example coordinate
  }

  getGPS() {
    return this.gps;
  }
  setGPS(lat, lng) {
    this.gps = { lat, lng };
  }

  async takePhoto() {
    const filePath = await ipcRenderer.invoke('take-photo');
    return filePath; // returns absolute path
  }
}

window.OS = {
  FileSystemManager,
  ProcessManager,
  PowerManager,
  HardwareSensors
};
