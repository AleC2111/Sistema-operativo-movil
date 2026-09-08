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
      accentColor: '#e84393',
      theme: 'dark',
      wallpaper: 'sakura-shapes',
      batterySaver: false,
      gpsEnabled: true,
      gpsCity: 'Caracas',
      gpsLat: 10.4806,
      gpsLng: -66.9036,
      gpsState: 'Distrito Capital',
      gpsAlt: '900m'
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
      'browser': 450,
      'phone': 150,
      'messages': 180,
      'contacts': 130,
      'music': 180,
      'clock': 100,
      'calculator': 80,
      'calendar': 110,
      'telegram': 220,
      'gps': 160
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
          this.uiCallback(`Low Memory Killer cerró ${oldestPaused}`);
        }
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
    this.battery = 88.0; // Simulated default battery percentage
    this.batterySaver = false;
    this.isCharging = false;
    this.networkActive = true;
    this.brightness = 1.0; // 0.1 to 1.0
    this.activeAppsCount = 0;
    this.updateCallback = updateCallback;
    this.lastDrainRate = 0.05;

    // Run simulated battery tick every 1 second
    setInterval(() => this.drainBattery(), 1000);
  }

  setBatterySaver(state) {
    this.batterySaver = state;
    this.drainBattery(); // Immediate UI update
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
  setBatteryLevel(val) {
    this.battery = Math.max(0, Math.min(100, val));
    this.drainBattery();
  }
  setCharging(state) {
    this.isCharging = state;
    this.drainBattery();
  }

  drainBattery() {
    let drainRate = 0.04; // Base OS drain per second

    if (this.isCharging) {
      // Battery is charging
      this.battery = Math.min(100, this.battery + 0.5);
      this.lastDrainRate = -0.5; // Negative drain = charging
    } else {
      if (!this.batterySaver) {
        // Normal power consumption mode
        drainRate += (this.brightness * 0.05);
        if (this.networkActive) drainRate += 0.03;
        drainRate += (this.activeAppsCount * 0.04);
      } else {
        // Battery Saver mode (reduces drain rate by ~75%)
        drainRate = 0.01 + (this.brightness * 0.01);
        if (this.networkActive) drainRate += 0.005;
        drainRate += (this.activeAppsCount * 0.005);
      }

      this.battery -= drainRate;
      if (this.battery < 0) this.battery = 0;
      this.lastDrainRate = drainRate;
    }

    if (this.updateCallback) {
      this.updateCallback(this.battery, this.lastDrainRate, this.batterySaver, this.isCharging);
    }
  }
}

// --- Hardware Sensors (GPS Venezuela & Camera) ---
class HardwareSensors {
  constructor() {
    // Preset cities in Venezuela
    this.venezuelaCities = {
      'Caracas': { lat: 10.4806, lng: -66.9036, state: 'Distrito Capital', alt: '900m' },
      'Valencia': { lat: 10.2222, lng: -67.9739, state: 'Carabobo', alt: '479m' },
      'Maracaibo': { lat: 10.6427, lng: -71.6125, state: 'Zulia', alt: '6m' },
      'Barquisimeto': { lat: 10.0647, lng: -69.3570, state: 'Lara', alt: '566m' },
      'Mérida': { lat: 8.5983, lng: -71.1450, state: 'Mérida', alt: '1630m' },
      'Puerto La Cruz': { lat: 10.2169, lng: -64.6300, state: 'Anzoátegui', alt: '10m' },
      'Ciudad Guayana': { lat: 8.3500, lng: -62.6500, state: 'Bolívar', alt: '13m' },
      'San Cristóbal': { lat: 7.7669, lng: -72.2250, state: 'Táchira', alt: '860m' }
    };

    const savedSettings = (window.fileSystem && window.fileSystem.getSettings) ? window.fileSystem.getSettings() : {};
    this.currentCity = savedSettings.gpsCity || 'Caracas';
    const cityData = this.venezuelaCities[this.currentCity] || this.venezuelaCities['Caracas'];
    this.gps = {
      lat: savedSettings.gpsLat !== undefined ? savedSettings.gpsLat : cityData.lat,
      lng: savedSettings.gpsLng !== undefined ? savedSettings.gpsLng : cityData.lng,
      city: this.currentCity,
      state: savedSettings.gpsState || cityData.state,
      country: 'Venezuela',
      alt: savedSettings.gpsAlt || cityData.alt,
      accuracy: '± 4m',
      isReal: false
    };

    // Try detecting real GPS from browser/navigator if available
    this.initRealGPS();
  }

  initRealGPS() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // If browser real position available
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          // Check if coordinates are close to Venezuela lat range (approx 0.5 to 12.5 lat, -73 to -59 lng)
          const inVenezuela = lat >= 0.5 && lat <= 13.0 && lng >= -73.5 && lng <= -59.0;
          
          if (inVenezuela) {
            this.gps.lat = lat;
            this.gps.lng = lng;
            this.gps.accuracy = `± ${Math.round(pos.coords.accuracy || 5)}m`;
            this.gps.isReal = true;
            this.gps.city = 'Ubicación Real (Venezuela)';
            this.gps.state = 'GPS Sensor';
          }
        },
        (err) => {
          // Keep default approximate Venezuela location
          this.gps.isReal = false;
        },
        { timeout: 4000 }
      );
    }
  }

  getGPS() {
    return this.gps;
  }

  setCity(cityName) {
    if (this.venezuelaCities[cityName]) {
      this.currentCity = cityName;
      const c = this.venezuelaCities[cityName];
      this.gps.lat = c.lat;
      this.gps.lng = c.lng;
      this.gps.city = cityName;
      this.gps.state = c.state;
      this.gps.alt = c.alt;
      this.gps.isReal = false;

      if (window.fileSystem && window.fileSystem.updateSettings) {
        window.fileSystem.updateSettings({
          gpsCity: cityName,
          gpsLat: c.lat,
          gpsLng: c.lng,
          gpsState: c.state,
          gpsAlt: c.alt
        });
      }
    }
  }

  setGPS(lat, lng, city = 'Personalizado', state = 'Venezuela') {
    this.gps.lat = parseFloat(lat);
    this.gps.lng = parseFloat(lng);
    this.gps.city = city;
    this.gps.state = state;
    this.gps.isReal = false;

    if (window.fileSystem && window.fileSystem.updateSettings) {
      window.fileSystem.updateSettings({
        gpsCity: city,
        gpsLat: this.gps.lat,
        gpsLng: this.gps.lng,
        gpsState: state,
        gpsAlt: this.gps.alt || '0m'
      });
    }
  }

  getVenezuelaCities() {
    return this.venezuelaCities;
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

