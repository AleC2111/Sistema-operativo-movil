class App {
  constructor(id, title) {
    this.id = id;
    this.title = title;
    this.container = document.createElement('div');
    this.container.className = 'app-window';
    this.container.id = `app-${id}`;
    
    // Header
    const header = document.createElement('div');
    header.className = 'app-header';
    header.innerHTML = `<span style="cursor:pointer; position:absolute; left:15px; font-weight:bold;" onclick="window.goHome()">⟵</span> ${title}`;
    
    // Content
    this.content = document.createElement('div');
    this.content.className = 'app-content';
    
    this.container.appendChild(header);
    this.container.appendChild(this.content);
    document.getElementById('apps-container').appendChild(this.container);
  }

  onLaunch() {}
  onResume() {
    this.container.classList.add('open');
    this.container.classList.remove('hidden-app');
  }
  onPause() {
    this.container.classList.remove('open');
  }
  onTerminate() {
    this.container.classList.remove('open');
    setTimeout(() => {
      this.container.classList.add('hidden-app');
    }, 300); // Wait for transition
  }
}

class SettingsApp extends App {
  constructor() {
    super('settings', 'Ajustes');
  }
  onLaunch() {
    const settings = window.fileSystem.getSettings();
    const gps = window.hardwareSensors.getGPS();
    const cities = window.hardwareSensors.getVenezuelaCities();

    let citiesOptionsHtml = '';
    for (let cName in cities) {
      const selected = (gps.city === cName) ? 'selected' : '';
      citiesOptionsHtml += `<option value="${cName}" ${selected}>📍 ${cName} (${cities[cName].state})</option>`;
    }

    this.content.innerHTML = `
      <div class="flower-about-card">
        <div class="flower-about-logo">🌸 FlowerOS</div>
        <div class="flower-about-version">Versión 2.0 (Integración de mensajes y temas)</div>
        <div class="flower-about-sub">Sistema Operativo Móvil Completo</div>
      </div>

      <div class="settings-section-title">⚡ Control de Energía y Batería</div>
      <div class="setting-row">
        <span>Ahorro de Batería (🍃)</span>
        <input type="checkbox" id="setting-saver" ${window.powerManager.batterySaver ? 'checked' : ''}>
      </div>
      <div class="setting-row">
        <span>Cargando Batería (🔌)</span>
        <input type="checkbox" id="setting-charging" ${window.powerManager.isCharging ? 'checked' : ''}>
      </div>

      <div class="settings-section-title">⏻ Control del Sistema</div>
      <div class="power-buttons-row">
        <button class="btn btn-power-lock" id="btn-settings-lock">🔒 Bloquear</button>
        <button class="btn btn-power-restart" id="btn-settings-restart">🔄 Reiniciar</button>
        <button class="btn btn-power-off" id="btn-settings-off">🔌 Apagar</button>
      </div>

      <div class="settings-section-title">📍 GPS Venezuela</div>
      <div class="setting-row">
        <span>Ciudad en Venezuela</span>
        <select id="setting-gps-city">
          ${citiesOptionsHtml}
        </select>
      </div>
      <div class="setting-row">
        <span>Latitud / Longitud</span>
        <div style="display:flex; gap:5px;">
          <input type="text" id="setting-lat" value="${gps.lat}" style="width:65px">
          <input type="text" id="setting-lng" value="${gps.lng}" style="width:65px">
        </div>
      </div>
      <div style="text-align:center; margin-top:8px; margin-bottom:12px;">
        <button class="btn" id="setting-save-gps">Actualizar Coordenadas GPS</button>
      </div>

      <div class="settings-section-title">🌸 Personalización y Formas</div>
      <div class="setting-row">
        <span>Fondo de Pantalla Floral</span>
        <select id="setting-wallpaper">
          <option value="sakura-shapes" ${settings.wallpaper === 'sakura-shapes' ? 'selected' : ''}>🌸 Flores de Cerezo (Formas Vectoriales)</option>
          <option value="sunflower-shapes" ${settings.wallpaper === 'sunflower-shapes' ? 'selected' : ''}>🌻 Girasol Dorado (Formas Radiales)</option>
          <option value="lotus-shapes" ${settings.wallpaper === 'lotus-shapes' ? 'selected' : ''}>🪷 Loto Místico (Formas Geométricas)</option>
          <option value="rose-shapes" ${settings.wallpaper === 'rose-shapes' ? 'selected' : ''}>🌹 Rosa Terciopelo (Espiral Vectorial)</option>
          <option value="botanical-spectrum" ${settings.wallpaper === 'botanical-spectrum' || settings.wallpaper === 'botanical' ? 'selected' : ''}>🌺 Spectrum FlowerOS (Jardín Completo)</option>
          <option value="solid-black" ${settings.wallpaper === 'solid-black' ? 'selected' : ''}>🖤 Negro Sólido</option>
        </select>
      </div>
      <div class="setting-row">
        <span>Color Floral de Acento</span>
        <input type="color" id="setting-color" value="${settings.accentColor}">
      </div>
      <div class="setting-row">
        <span>Tema del Sistema</span>
        <select id="setting-theme">
          <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Oscuro Floral</option>
          <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Claro Floral</option>
        </select>
      </div>

      <div class="settings-section-title">⚙️ Conectividad & Reloj</div>
      <div class="setting-row">
        <span>Wi-Fi / Red Móvil</span>
        <input type="checkbox" id="setting-wifi" ${window.powerManager.networkActive ? 'checked' : ''}>
      </div>
      <div class="setting-row">
        <span>Brillo de Pantalla</span>
        <input type="range" class="range-slider" id="setting-brightness" min="0.1" max="1" step="0.1" value="${window.powerManager.brightness}">
      </div>
      <div class="setting-row">
        <span>PIN de Bloqueo (4 dígitos)</span>
        <input type="password" id="setting-pin" placeholder="Ninguno" value="${settings.lockPin}" style="width:60px" maxlength="4">
      </div>
      <div class="setting-row">
        <span>Formato 24 Horas</span>
        <input type="checkbox" id="setting-24h" ${settings.use24h ? 'checked' : ''}>
      </div>
    `;

    // Event Listeners
    this.content.querySelector('#setting-wifi').addEventListener('change', (e) => {
      window.powerManager.setNetwork(e.target.checked);
      document.getElementById('network-icon').style.opacity = e.target.checked ? '1' : '0.3';
    });

    this.content.querySelector('#setting-saver').addEventListener('change', (e) => {
      window.powerManager.setBatterySaver(e.target.checked);
      if (window.showToast) window.showToast(e.target.checked ? 'Ahorro de batería ACTIVADO 🍃' : 'Ahorro de batería DESACTIVADO');
    });

    this.content.querySelector('#setting-charging').addEventListener('change', (e) => {
      window.powerManager.setCharging(e.target.checked);
      if (window.showToast) window.showToast(e.target.checked ? 'Cargador Conectado 🔌' : 'Cargador Desconectado');
    });

    // Power buttons
    this.content.querySelector('#btn-settings-lock').addEventListener('click', () => {
      if (window.lockSystem) window.lockSystem();
    });
    this.content.querySelector('#btn-settings-restart').addEventListener('click', () => {
      if (window.restartSystem) window.restartSystem();
    });
    this.content.querySelector('#btn-settings-off').addEventListener('click', () => {
      if (window.powerOffSystem) window.powerOffSystem();
    });

    // GPS Settings
    this.content.querySelector('#setting-gps-city').addEventListener('change', (e) => {
      const cityName = e.target.value;
      window.hardwareSensors.setCity(cityName);
      const newGps = window.hardwareSensors.getGPS();
      this.content.querySelector('#setting-lat').value = newGps.lat;
      this.content.querySelector('#setting-lng').value = newGps.lng;
      window.fileSystem.updateSettings({ gpsCity: cityName });
      window.showToast(`GPS configurado en ${cityName}, Venezuela 📍`);
    });

    this.content.querySelector('#setting-save-gps').addEventListener('click', () => {
      const lat = parseFloat(this.content.querySelector('#setting-lat').value);
      const lng = parseFloat(this.content.querySelector('#setting-lng').value);
      window.hardwareSensors.setGPS(lat, lng, 'Personalizado Vzla');
      window.showToast('Coordenadas GPS actualizadas');
    });

    this.content.querySelector('#setting-brightness').addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      window.powerManager.setBrightness(val);
      document.getElementById('screen').style.filter = `brightness(${val})`;
    });

    this.content.querySelector('#setting-pin').addEventListener('change', (e) => {
      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
      e.target.value = val;
      window.fileSystem.updateSettings({ lockPin: val });
    });

    this.content.querySelector('#setting-24h').addEventListener('change', (e) => {
      window.fileSystem.updateSettings({ use24h: e.target.checked });
      if (window.updateClock) window.updateClock();
    });

    this.content.querySelector('#setting-color').addEventListener('input', (e) => {
      const color = e.target.value;
      window.fileSystem.updateSettings({ accentColor: color });
      document.documentElement.style.setProperty('--accent-color', color);
    });

    this.content.querySelector('#setting-theme').addEventListener('change', (e) => {
      const theme = e.target.value;
      window.fileSystem.updateSettings({ theme });
      const screen = document.getElementById('screen');
      screen.classList.remove('theme-light', 'theme-dark');
      screen.classList.add(`theme-${theme}`);
    });

    this.content.querySelector('#setting-wallpaper').addEventListener('change', (e) => {
      const wallpaper = e.target.value;
      window.fileSystem.updateSettings({ wallpaper });
      window.applyWallpaper(wallpaper);
      window.showToast('Fondo de pantalla floral aplicado 🌸');
    });
  }
}

class DevOptionsApp extends App {
  constructor() {
    super('dev-options', 'Opciones de Desarrollador');
    this.updateInterval = null;
  }
  onLaunch() {
    this.content.innerHTML = `<div id="dev-stats"></div>`;
  }
  onResume() {
    super.onResume();
    this.updateInterval = setInterval(() => this.renderStats(), 1000);
    this.renderStats();
  }
  onPause() {
    super.onPause();
    if (this.updateInterval) clearInterval(this.updateInterval);
  }
  onTerminate() {
    super.onTerminate();
    if (this.updateInterval) clearInterval(this.updateInterval);
  }
  renderStats() {
    const stats = window.processManager.getStats();
    let html = `
      <div class="stat-box" style="border-left: 4px solid var(--accent-color);">
        <h3 style="color:var(--accent-color);">🌸 FlowerOS Kernel v1.0</h3>
        <p style="font-size:11px; opacity:0.8;">Arquitectura Móvil de Procesos & Memoria</p>
      </div>
      <div class="stat-box">
        <h3>Memoria (RAM)</h3>
        <p>Total: ${stats.totalRam} MB</p>
        <p>Usada: ${stats.usedRam} MB (${((stats.usedRam/stats.totalRam)*100).toFixed(1)}%)</p>
      </div>
      <div class="stat-box">
        <h3>Energía & Batería</h3>
        <p>Nivel: ${window.powerManager.battery.toFixed(2)}%</p>
        <p>Modo Ahorro: ${window.powerManager.batterySaver ? 'ACTIVADO' : 'DESACTIVADO'}</p>
      </div>
      <div class="stat-box">
        <h3>Procesos de Aplicaciones</h3>
    `;
    
    for (let id in stats.apps) {
      const app = stats.apps[id];
      html += `<div style="font-size:12px; margin-top:5px;">
        <strong>${id}</strong>: ${app.state} (${app.ram} MB)
        ${app.state !== 'Terminated' ? `<button class="btn" style="padding:2px 5px; font-size:10px; margin-left:10px;" onclick="window.processManager.terminateApp('${id}')">Kill</button>` : ''}
      </div>`;
    }
    html += `</div>`;
    
    if (this.content.querySelector('#dev-stats')) {
      this.content.querySelector('#dev-stats').innerHTML = html;
    }
  }
}

class FileExplorerApp extends App {
  constructor() {
    super('file-explorer', 'File Explorer');
  }
  onLaunch() {
    this.renderFiles();
  }
  onResume() {
    super.onResume();
    this.renderFiles();
  }
  renderFiles() {
    const files = window.fileSystem.getFiles();
    let html = `
      <div style="margin-bottom: 15px;">
        <button class="btn" id="btn-new-note">New Note</button>
      </div>
      <div id="file-list"></div>
      <div id="text-editor" style="display:none; margin-top:15px;" data-editing-id="">
        <input type="text" id="editor-title" style="width:100%; margin-bottom:5px; padding:5px; background:var(--input-bg); color:var(--input-text); border:1px solid var(--input-border); border-radius:5px;" placeholder="Note Title">
        <textarea id="editor-content" style="width:100%; height:150px; background:var(--input-bg); color:var(--input-text); border:1px solid var(--input-border); border-radius:5px; padding:5px;" placeholder="Note Content"></textarea>
        <button class="btn" id="btn-save-note" style="width:100%; margin-top:5px;">Save Note</button>
      </div>
    `;
    this.content.innerHTML = html;
    
    const list = this.content.querySelector('#file-list');
    if (files.length === 0) {
      list.innerHTML = '<p style="color:#aaa; text-align:center;">No files found.</p>';
    } else {
      files.forEach(f => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
          <div style="cursor:pointer; flex:1;" onclick="window.openNote('${f.id}')">
            <div style="font-weight:bold;">${f.name}</div>
            <div style="font-size:10px; color:#aaa;">${f.type} • ${f.size}KB</div>
          </div>
          <button class="btn" style="background:#e74c3c; margin-left:10px;" onclick="window.deleteFile('${f.id}')">Del</button>
        `;
        list.appendChild(item);
      });
    }

    this.content.querySelector('#btn-new-note').addEventListener('click', () => {
      this.content.querySelector('#file-list').style.display = 'none';
      this.content.querySelector('#btn-new-note').style.display = 'none';
      this.content.querySelector('#text-editor').style.display = 'block';
      this.content.querySelector('#text-editor').setAttribute('data-editing-id', '');
      this.content.querySelector('#editor-title').value = '';
      this.content.querySelector('#editor-content').value = '';
    });
    
    this.content.querySelector('#btn-save-note').addEventListener('click', () => {
      const title = this.content.querySelector('#editor-title').value || 'Untitled.txt';
      const text = this.content.querySelector('#editor-content').value;
      const editingId = this.content.querySelector('#text-editor').getAttribute('data-editing-id');
      if (editingId) {
        window.fileSystem.updateFile(editingId, title, text);
      } else {
        window.fileSystem.addFile(title, 'text/plain', text, Math.ceil(text.length/1024));
      }
      this.renderFiles();
      window.showToast('Note saved');
    });
  }
}

class CameraApp extends App {
  constructor() {
    super('camera', 'Camera');
  }
  onLaunch() {
    this.content.innerHTML = `
      <div style="text-align:center;">
        <video id="camera-stream" autoplay playsinline style="width:100%; border-radius:10px; background:black; margin-bottom:10px; height: 250px; object-fit: cover;"></video>
        <button class="btn" id="btn-take-photo" style="font-size:16px; padding:15px 30px; border-radius:30px; margin-bottom: 10px;">📸 Capture</button>
        <p style="font-size:12px; color:#aaa;">Using system camera.</p>
        <canvas id="camera-canvas" style="display:none;"></canvas>
      </div>
    `;
    this.startCamera();
    this.content.querySelector('#btn-take-photo').addEventListener('click', () => this.capturePhoto());
  }
  onResume() {
    super.onResume();
    this.startCamera();
  }
  onPause() {
    super.onPause();
    this.stopCamera();
  }
  onTerminate() {
    super.onTerminate();
    this.stopCamera();
  }
  
  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = this.content.querySelector('#camera-stream');
      if (video) video.srcObject = this.stream;
    } catch(err) {
      console.error(err);
      window.showToast("Camera access denied or unavailable.");
    }
  }
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
  capturePhoto() {
    const video = this.content.querySelector('#camera-stream');
    if (!this.stream || !video) return;
    const canvas = this.content.querySelector('#camera-canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    window.fileSystem.addFile('IMG_' + Date.now() + '.jpg', 'image/jpeg', dataUrl, 150);
    window.showToast('Photo saved to Gallery');
  }
}

class GalleryApp extends App {
  constructor() {
    super('gallery', 'Gallery');
  }
  onLaunch() {
    this.renderGallery();
  }
  onResume() {
    super.onResume();
    this.renderGallery();
  }
  renderGallery() {
    const files = window.fileSystem.getFiles().filter(f => f.type.startsWith('image/'));
    let html = `<div id="gallery-grid" class="gallery-grid">`;
    if (files.length === 0) {
      html += '<p style="color:#aaa; text-align:center; width:100%;">No photos yet.</p>';
    } else {
      files.forEach(f => {
        const src = f.content.startsWith('data:') ? f.content : `file://${f.content}`;
        html += `<img src="${src}" class="gallery-img" style="cursor:pointer;" onclick="window.viewPhoto('${f.id}')">`;
      });
    }
    html += `
      </div>
      <div id="photo-viewer" style="display:none; text-align:center;">
        <img id="viewer-img" style="width:100%; border-radius:10px; margin-bottom:10px; max-height:400px; object-fit:contain;">
        <canvas id="viewer-canvas" style="display:none;"></canvas>
        <div style="display:flex; flex-wrap:wrap; gap:5px; justify-content:center;">
          <button class="btn" onclick="window.closePhoto()">Back</button>
          <button class="btn" onclick="window.editPhoto()" style="background:#f1c40f; color:black;">B&W Edit</button>
          <button class="btn" onclick="window.setWallpaper()" style="background:#2ecc71;">Wallpaper</button>
          <button class="btn" onclick="window.deletePhoto()" style="background:#e74c3c;">Delete</button>
        </div>
      </div>
    `;
    this.content.innerHTML = html;
  }
}

class BrowserApp extends App {
  constructor() {
    super('browser', 'Browser');
  }
  onLaunch() {
    this.content.style.display = 'flex';
    this.content.style.flexDirection = 'column';
    this.content.style.height = '100%';
    this.content.style.padding = '10px';

    this.content.innerHTML = `
      <div style="display:flex; margin-bottom:10px;">
        <input type="text" id="browser-url" value="https://www.wikipedia.org/" style="flex:1; padding:5px; background:rgba(255,255,255,0.1); color:var(--text-color); border-radius:5px; border:1px solid rgba(255,255,255,0.2);">
        <button class="btn" id="btn-go" style="margin-left:5px;">Go</button>
      </div>
      <webview id="browser-view" src="https://www.wikipedia.org/" useragent="Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36" style="width:100%; flex:1; background:white; border-radius:5px;"></webview>
    `;
    this.content.querySelector('#btn-go').addEventListener('click', () => {
      let url = this.content.querySelector('#browser-url').value;
      if (!url.startsWith('http')) url = 'https://' + url;
      this.content.querySelector('#browser-view').src = url;
    });
  }
}

class PhoneApp extends App {
  constructor() {
    super('phone', 'Phone');
  }
  onLaunch() {
    this.renderDialer();
  }
  onResume() {
    super.onResume();
  }
  renderDialer() {
    this.content.innerHTML = `
      <div class="dialer-container">
        <div style="background:rgba(0,136,204,0.15); border:1px solid #0088cc; padding:8px 12px; border-radius:10px; font-size:12px; color:#5288c1; text-align:center; margin-bottom:10px;">
          ✈️ Llamadas de voz y video enrutadas por <strong>Telegram</strong>
        </div>
        <div id="dialer-display"></div>
        <div class="dialer-pad">
          <button class="dial-btn" data-num="1">1</button>
          <button class="dial-btn" data-num="2">2</button>
          <button class="dial-btn" data-num="3">3</button>
          <button class="dial-btn" data-num="4">4</button>
          <button class="dial-btn" data-num="5">5</button>
          <button class="dial-btn" data-num="6">6</button>
          <button class="dial-btn" data-num="7">7</button>
          <button class="dial-btn" data-num="8">8</button>
          <button class="dial-btn" data-num="9">9</button>
          <button class="dial-btn" data-num="*">*</button>
          <button class="dial-btn" data-num="0">0</button>
          <button class="dial-btn" data-num="#">#</button>
        </div>
        <div style="display:flex; gap:20px; align-items:center;">
          <button class="dial-btn" id="btn-backspace" style="font-size:18px;">⌫</button>
          <button class="dial-btn call-btn" id="btn-call" title="Llamar con Telegram">📞</button>
          <button class="dial-btn" style="visibility:hidden;">⌫</button>
        </div>
      </div>
    `;

    const display = this.content.querySelector('#dialer-display');
    this.content.querySelectorAll('.dialer-pad .dial-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        display.innerText += btn.getAttribute('data-num');
      });
    });
    this.content.querySelector('#btn-backspace').addEventListener('click', () => {
      display.innerText = display.innerText.slice(0, -1);
    });
    this.content.querySelector('#btn-call').addEventListener('click', () => {
      const number = display.innerText.trim();
      if (number.length > 0) {
        this.initiateTelegramCall(number);
      } else {
        window.showToast('Ingresa un número para llamar');
      }
    });
  }

  initiateTelegramCall(number) {
    window.showToast(`Conectando llamada a ${number} por Telegram ✈️`);
    if (window.launchAppWithParams) {
      window.launchAppWithParams('telegram', { action: 'call', number });
    }
  }
}

class MessagesApp extends App {
  constructor() {
    super('messages', 'Messages');
  }
  onLaunch() {
    this.renderList();
  }
  onResume() {
    super.onResume();
    this.renderList();
  }
  renderList() {
    this.content.innerHTML = `
      <div class="messages-container">
        <div style="background:rgba(0,136,204,0.15); border:1px solid #0088cc; padding:12px; border-radius:10px; font-size:12px; color:#5288c1; text-align:center; margin:10px;">
          ✈️ Mensajería integrada con <strong>Telegram</strong><br>
          Todas las conversaciones y chats del sistema se realizan mediante Telegram.
        </div>
        <div style="padding:10px; text-align:center;">
          <button class="btn" id="btn-open-telegram-web" style="background:#0088cc; width:100%; padding:12px; font-weight:bold;">
            ✈️ Abrir Telegram
          </button>
        </div>
        <div style="padding:10px; text-align:center;">
          <button class="new-msg-btn" id="btn-new-chat" style="width:100%;">+ Enviar Mensaje a Contacto</button>
        </div>
      </div>
      <div id="new-chat-modal" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:var(--app-bg); z-index:20; flex-direction:column;">
        <div style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1); font-weight:bold; display:flex; align-items:center;">
          <span style="margin-right:10px; cursor:pointer;" id="btn-close-new-chat">⟵</span>
          Seleccionar Contacto
        </div>
        <div id="new-chat-contacts" style="flex:1; overflow-y:auto;"></div>
      </div>
    `;

    this.content.querySelector('#btn-open-telegram-web').onclick = () => {
      if (window.launchAppWithParams) window.launchAppWithParams('telegram', {});
    };

    const newChatBtn = this.content.querySelector('#btn-new-chat');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => {
        this.renderNewChatModal();
      });
    }

    const closeNewChat = this.content.querySelector('#btn-close-new-chat');
    if (closeNewChat) {
      closeNewChat.addEventListener('click', () => {
        this.content.querySelector('#new-chat-modal').style.display = 'none';
      });
    }
  }

  renderNewChatModal() {
    const modal = this.content.querySelector('#new-chat-modal');
    const container = this.content.querySelector('#new-chat-contacts');
    modal.style.display = 'flex';
    const contacts = window.fileSystem.getContacts();

    if (contacts.length === 0) {
      container.innerHTML = '<p style="color:#aaa; text-align:center; margin-top:20px;">No hay contactos guardados.</p>';
      return;
    }

    let html = '';
    contacts.forEach(c => {
      html += `
        <div class="contact-item" data-id="${c.id}" data-name="${c.name}" data-number="${c.number}">
          <div class="contact-avatar">${c.name.charAt(0).toUpperCase()}</div>
          <div class="contact-name">${c.name}</div>
        </div>
      `;
    });
    container.innerHTML = html;

    container.querySelectorAll('.contact-item').forEach(item => {
      item.addEventListener('click', () => {
        const name = item.getAttribute('data-name');
        const number = item.getAttribute('data-number');
        modal.style.display = 'none';
        this.initiateTelegramChat(number, name);
      });
    });
  }

  initiateTelegramChat(number, name) {
    window.showToast(`Abriendo chat con ${name || number} en Telegram ✈️`);
    if (window.launchAppWithParams) {
      window.launchAppWithParams('telegram', { action: 'chat', number, name });
    }
  }
}

class ContactsApp extends App {
  constructor() {
    super('contacts', 'Contacts');
  }
  onLaunch() {
    this.renderList();
  }
  onResume() {
    super.onResume();
    this.renderList();
  }
  
  renderList() {
    const contacts = window.fileSystem.getContacts();
    let html = `
      <div class="contacts-container">
        <div id="contacts-list" style="flex:1; overflow-y:auto;">
    `;
    
    if (contacts.length === 0) {
      html += '<p style="color:#aaa; text-align:center; margin-top:20px;">No contacts saved.</p>';
    } else {
      contacts.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
        html += `
          <div class="contact-item" data-id="${c.id}">
            <div class="contact-avatar">${c.name.charAt(0).toUpperCase()}</div>
            <div class="contact-name">${c.name}</div>
          </div>
        `;
      });
    }
    
    html += `
        </div>
        <div class="fab" id="btn-add-contact">+</div>
      </div>
      <div id="contact-form-view" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:var(--app-bg); z-index:20; flex-direction:column;">
        <div style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1); font-weight:bold; display:flex; align-items:center;">
          <span style="margin-right:10px; cursor:pointer;" id="btn-close-form">⟵</span>
          New Contact
        </div>
        <div class="contact-form">
          <input type="text" id="contact-name" class="contact-input" placeholder="Name">
          <input type="tel" id="contact-number" class="contact-input" placeholder="Phone Number">
          <button class="btn" id="btn-save-contact" style="margin-top:10px;">Save Contact</button>
        </div>
      </div>
      <div id="contact-detail-view" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:var(--app-bg); z-index:20; flex-direction:column;">
        <div style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1); font-weight:bold; display:flex; align-items:center;">
          <span style="margin-right:10px; cursor:pointer;" id="btn-close-detail">⟵</span>
          Contact Info
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; padding:30px;">
          <div class="contact-avatar" style="width:80px; height:80px; font-size:40px; margin-right:0; margin-bottom:15px;" id="detail-avatar"></div>
          <div class="contact-name" style="font-size:24px; margin-bottom:5px;" id="detail-name"></div>
          <div style="color:#aaa;" id="detail-number"></div>
          
          <div class="contact-actions">
            <button class="action-btn" id="btn-call-contact">
              📞<span>Call</span>
            </button>
            <button class="action-btn" id="btn-msg-contact">
              💬<span>Message</span>
            </button>
            <button class="action-btn" id="btn-tg-contact" style="background:#0088cc;">
              ✈️<span>Telegram</span>
            </button>
            <button class="action-btn" id="btn-delete-contact" style="background:#e74c3c;">
              🗑️<span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
    this.content.innerHTML = html;
    
    this.content.querySelector('#btn-add-contact').addEventListener('click', () => {
      this.content.querySelector('#contact-form-view').style.display = 'flex';
    });
    this.content.querySelector('#btn-close-form').addEventListener('click', () => {
      this.content.querySelector('#contact-form-view').style.display = 'none';
    });
    this.content.querySelector('#btn-save-contact').addEventListener('click', () => {
      const name = this.content.querySelector('#contact-name').value.trim();
      const number = this.content.querySelector('#contact-number').value.trim();
      if (name && number) {
        window.fileSystem.addContact(name, number);
        this.content.querySelector('#contact-form-view').style.display = 'none';
        this.renderList();
      } else {
        window.showToast('Please fill all fields');
      }
    });

    // Contact item clicks
    this.content.querySelectorAll('.contact-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const contact = window.fileSystem.getContacts().find(c => c.id === id);
        if (contact) {
          const detail = this.content.querySelector('#contact-detail-view');
          detail.querySelector('#detail-avatar').innerText = contact.name.charAt(0).toUpperCase();
          detail.querySelector('#detail-name').innerText = contact.name;
          detail.querySelector('#detail-number').innerText = contact.number;
          
          detail.querySelector('#btn-call-contact').onclick = () => {
            if (window.launchAppWithParams) window.launchAppWithParams('phone', { action: 'call', number: contact.number });
          };
          detail.querySelector('#btn-msg-contact').onclick = () => {
            if (window.launchAppWithParams) window.launchAppWithParams('messages', { action: 'chat', number: contact.number, name: contact.name });
          };
          detail.querySelector('#btn-tg-contact').onclick = () => {
            if (window.launchAppWithParams) window.launchAppWithParams('telegram', { action: 'chat', number: contact.number, name: contact.name });
          };
          detail.querySelector('#btn-delete-contact').onclick = () => {
            window.fileSystem.deleteContact(id);
            detail.style.display = 'none';
            this.renderList();
          };
          
          detail.style.display = 'flex';
        }
      });
    });

    this.content.querySelector('#btn-close-detail').addEventListener('click', () => {
      this.content.querySelector('#contact-detail-view').style.display = 'none';
    });
  }
}

class MusicApp extends App {
  constructor() {
    super('music', 'Music Player');
    this.isPlaying = false;
    this.songs = [
      { title: 'Cyber City', artist: 'Synthwave Boy' },
      { title: 'Midnight Drive', artist: 'The Midnight' },
      { title: 'Neon Lights', artist: 'Kavinsky' }
    ];
    this.currentIndex = 0;
    this.audioCtx = null;
    this.osc = null;
  }
  onLaunch() {
    this.renderPlayer();
  }
  onPause() {
    super.onPause();
    if (this.isPlaying) this.togglePlay();
  }
  onTerminate() {
    super.onTerminate();
    if (this.isPlaying) this.togglePlay();
  }
  togglePlay() {
    this.isPlaying = !this.isPlaying;
    
    if (this.isPlaying) {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      
      this.osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      this.osc.type = ['square', 'sawtooth', 'triangle'][this.currentIndex % 3];
      this.osc.frequency.setValueAtTime(220 + (this.currentIndex * 55), this.audioCtx.currentTime);
      
      let freqBase = 220 + (this.currentIndex * 55);
      this.arpInterval = setInterval(() => {
        if (!this.osc) return;
        freqBase = freqBase === 220 + (this.currentIndex * 55) ? freqBase * 1.5 : 220 + (this.currentIndex * 55);
        this.osc.frequency.setValueAtTime(freqBase, this.audioCtx.currentTime);
      }, 500);

      this.osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      
      gainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      this.osc.start();
    } else {
      if (this.osc) {
        this.osc.stop();
        this.osc.disconnect();
        this.osc = null;
      }
      if (this.arpInterval) clearInterval(this.arpInterval);
    }
    this.renderPlayer();
  }

  renderPlayer() {
    const song = this.songs[this.currentIndex];
    this.content.innerHTML = `
      <div class="music-container">
        <div class="music-cover">🎵</div>
        <div class="music-info">
          <div class="music-title" id="music-title">${song.title}</div>
          <div class="music-artist" id="music-artist">${song.artist}</div>
        </div>
        <div class="music-controls">
          <button class="music-btn" id="btn-prev">⏮</button>
          <button class="music-btn play-btn" id="btn-play">${this.isPlaying ? '⏸' : '▶'}</button>
          <button class="music-btn" id="btn-next">⏭</button>
        </div>
        <div class="music-progress">
          <div class="progress-bar">
            <div class="progress-fill" id="music-progress-fill" style="width: ${this.isPlaying ? '50%' : '0%'};"></div>
          </div>
        </div>
      </div>
    `;

    this.content.querySelector('#btn-play').onclick = () => {
      this.togglePlay();
    };

    this.content.querySelector('#btn-prev').onclick = () => {
      if (this.isPlaying) this.togglePlay();
      this.currentIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
      this.togglePlay();
    };

    this.content.querySelector('#btn-next').onclick = () => {
      if (this.isPlaying) this.togglePlay();
      this.currentIndex = (this.currentIndex + 1) % this.songs.length;
      this.togglePlay();
    };
  }
}

class ClockApp extends App {
  constructor() {
    super('clock', 'Clock');
    this.swInterval = null;
    this.swTime = 0;
    this.swStartTimestamp = 0;
    this.timerTime = 0;
    this.timerDurationMs = 0;
    this.timerStartTimestamp = 0;
    this.currentTab = 'alarm';
    this.alarms = window.fileSystem ? window.fileSystem.getAlarms() : [];
  }
  onLaunch() {
    this.alarms = window.fileSystem.getAlarms();
    this.renderApp();
  }
  onResume() {
    super.onResume();
    this.alarms = window.fileSystem.getAlarms();
    this.renderApp();
  }
  onTerminate() {
    super.onTerminate();
    // Do not clear intervals here so stopwatch and timer keep running in background
  }
  renderApp() {
    this.content.innerHTML = `
      <div class="clock-tabs">
        <div class="clock-tab ${this.currentTab === 'alarm' ? 'active' : ''}" data-tab="alarm">Alarm</div>
        <div class="clock-tab ${this.currentTab === 'stopwatch' ? 'active' : ''}" data-tab="stopwatch">Stopwatch</div>
        <div class="clock-tab ${this.currentTab === 'timer' ? 'active' : ''}" data-tab="timer">Timer</div>
      </div>
      
      <div id="view-alarm" class="clock-view ${this.currentTab === 'alarm' ? 'active' : ''}">
        <h3>Alarms</h3>
        ${this.alarms.length === 0 ? '<p style="color:#aaa; margin-top:20px;">No alarms set.</p>' : 
          this.alarms.map((a, i) => `
            <div style="display:flex; justify-content:space-between; width:100%; padding:10px; background:rgba(255,255,255,0.05); margin-top:10px; border-radius:5px;">
              <span style="font-size:20px;">${a}</span>
              <button class="btn btn-del-alarm" style="background:#e74c3c; padding:5px 10px;" data-idx="${i}">Del</button>
            </div>
          `).join('')
        }
        <button class="btn" id="btn-add-alarm" style="margin-top:20px;">+ Add Alarm</button>
        <input type="time" id="alarm-time-input" style="display:none; margin-top:10px; padding:10px; border-radius:5px; border:none; background:rgba(255,255,255,0.1); color:white;">
      </div>

      <div id="view-stopwatch" class="clock-view ${this.currentTab === 'stopwatch' ? 'active' : ''}">
        <div class="clock-large-display" id="sw-display">${this.formatTime(this.swTime)}</div>
        <div class="clock-controls">
          <button class="clock-btn start" id="sw-start">Start</button>
          <button class="clock-btn stop" id="sw-stop">Stop</button>
          <button class="clock-btn" id="sw-reset">Reset</button>
        </div>
      </div>

      <div id="view-timer" class="clock-view ${this.currentTab === 'timer' ? 'active' : ''}">
        <div class="timer-inputs" id="timer-inputs" style="${this.timerInterval ? 'display:none;' : ''}">
          <input type="number" id="tm-h" class="timer-input" min="0" max="99" value="00"> :
          <input type="number" id="tm-m" class="timer-input" min="0" max="59" value="05"> :
          <input type="number" id="tm-s" class="timer-input" min="0" max="59" value="00">
        </div>
        <div class="clock-large-display" id="tm-display" style="${!this.timerInterval ? 'display:none;' : ''}">
          ${this.formatTime(this.timerTime)}
        </div>
        <div class="clock-controls">
          <button class="clock-btn start" id="tm-start" style="${this.timerInterval ? 'display:none;' : ''}">Start</button>
          <button class="clock-btn stop" id="tm-stop" style="${!this.timerInterval ? 'display:none;' : ''}">Stop</button>
        </div>
      </div>
    `;

    this.content.querySelectorAll('.clock-tab').forEach(tab => {
      tab.onclick = () => {
        this.currentTab = tab.getAttribute('data-tab');
        this.renderApp();
      };
    });

    if (this.currentTab === 'stopwatch') {
      this.content.querySelector('#sw-start').onclick = () => {
        if (!this.swInterval) {
          this.swStartTimestamp = performance.now() - this.swTime;
          this.swInterval = setInterval(() => {
            this.swTime = performance.now() - this.swStartTimestamp;
            const d = this.content.querySelector('#sw-display');
            if (d) d.innerText = this.formatTime(this.swTime);
          }, 10);
        }
      };

      this.content.querySelector('#sw-stop').onclick = () => {
        clearInterval(this.swInterval);
        this.swInterval = null;
      };

      this.content.querySelector('#sw-reset').onclick = () => {
        clearInterval(this.swInterval);
        this.swInterval = null;
        this.swTime = 0;
        this.swStartTimestamp = 0;
        const d = this.content.querySelector('#sw-display');
        if (d) d.innerText = this.formatTime(0);
      };
    }

    if (this.currentTab === 'timer') {
      this.content.querySelector('#tm-start').onclick = () => {
        if (!this.timerInterval) {
          const h = parseInt(this.content.querySelector('#tm-h').value) || 0;
          const m = parseInt(this.content.querySelector('#tm-m').value) || 0;
          const s = parseInt(this.content.querySelector('#tm-s').value) || 0;

          this.timerDurationMs = ((h * 3600) + (m * 60) + s) * 1000;
          this.timerTime = this.timerDurationMs;

          if (this.timerTime <= 0) return;

          this.timerStartTimestamp = performance.now();
          this.timerInterval = setInterval(() => {
            const elapsedMs = performance.now() - this.timerStartTimestamp;
            this.timerTime = Math.max(0, this.timerDurationMs - elapsedMs);

            const d = this.content.querySelector('#tm-display');
            if (d) d.innerText = this.formatTime(this.timerTime);

            if (this.timerTime <= 0) {
              clearInterval(this.timerInterval);
              this.timerInterval = null;
              window.showToast("⏳ Timer finished!");

              if (document.getElementById('lock-screen') && document.getElementById('lock-screen').classList.contains('active')) {
                const notif = document.getElementById('lock-notif-msg');
                if (notif) {
                  notif.innerText = "⏳ Timer finished!";
                  notif.style.display = 'flex';
                }
              }

              this.renderApp();
            }
          }, 10);

          this.renderApp();
        }
      };

      const btnStop = this.content.querySelector('#tm-stop');
      if (btnStop) {
        btnStop.onclick = () => {
          if (this.timerInterval) {
            const elapsedMs = performance.now() - this.timerStartTimestamp;
            this.timerTime = Math.max(0, this.timerDurationMs - elapsedMs);
            this.timerDurationMs = this.timerTime;
            clearInterval(this.timerInterval);
            this.timerInterval = null;
          }
          this.renderApp();
        };
      }
    }

    if (this.currentTab === 'alarm') {
      const addBtn = this.content.querySelector('#btn-add-alarm');
      const timeInput = this.content.querySelector('#alarm-time-input');
      if (addBtn && timeInput) {
        addBtn.onclick = () => {
          if (timeInput.style.display === 'none') {
            timeInput.style.display = 'block';
            addBtn.innerText = 'Save Alarm';
          } else {
            const t = timeInput.value;
            if (t) {
              if (!this.alarms.includes(t)) {
                this.alarms.push(t);
                this.alarms.sort();
                window.fileSystem.saveAlarms(this.alarms);
                window.showToast("Alarm saved!");
              } else {
                window.showToast("Alarm already exists!");
              }
            }
            this.renderApp();
          }
        };
      }

      this.content.querySelectorAll('.btn-del-alarm').forEach(btn => {
        btn.onclick = () => {
          this.alarms.splice(btn.getAttribute('data-idx'), 1);
          window.fileSystem.saveAlarms(this.alarms);
          this.renderApp();
        };
      });
    }
  }

  formatTime(totalMs) {
    const total = Math.max(0, Math.round(totalMs));
    const h = String(Math.floor(total / 3600000)).padStart(2, '0');
    const m = String(Math.floor((total % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((total % 60000) / 1000)).padStart(2, '0');
    const ms = String(total % 1000).padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  }
}

class CalculatorApp extends App {
  constructor() {
    super('calculator', 'Calculator');
    this.currentExpr = '';
    this.historyExpr = '';
  }
  onLaunch() {
    this.renderCalc();
  }
  renderCalc() {
    this.content.innerHTML = `
      <div class="calc-container">
        <div class="calc-display">
          <div class="calc-history">${this.historyExpr}</div>
          <div id="calc-current">${this.currentExpr || '0'}</div>
        </div>
        <div class="calc-grid">
          <button class="calc-btn clear" data-val="C">C</button>
          <button class="calc-btn op" data-val="(">(</button>
          <button class="calc-btn op" data-val=")">)</button>
          <button class="calc-btn op" data-val="/">÷</button>
          
          <button class="calc-btn" data-val="7">7</button>
          <button class="calc-btn" data-val="8">8</button>
          <button class="calc-btn" data-val="9">9</button>
          <button class="calc-btn op" data-val="*">×</button>
          
          <button class="calc-btn" data-val="4">4</button>
          <button class="calc-btn" data-val="5">5</button>
          <button class="calc-btn" data-val="6">6</button>
          <button class="calc-btn op" data-val="-">-</button>
          
          <button class="calc-btn" data-val="1">1</button>
          <button class="calc-btn" data-val="2">2</button>
          <button class="calc-btn" data-val="3">3</button>
          <button class="calc-btn op" data-val="+">+</button>
          
          <button class="calc-btn" data-val="0" style="grid-column: span 2;">0</button>
          <button class="calc-btn" data-val=".">.</button>
          <button class="calc-btn eq" data-val="=">=</button>
        </div>
      </div>
    `;

    this.content.querySelectorAll('.calc-btn').forEach(btn => {
      btn.onclick = () => {
        const val = btn.getAttribute('data-val');
        if (val === 'C') {
          this.currentExpr = '';
          this.historyExpr = '';
        } else if (val === '=') {
          try {
            this.historyExpr = this.currentExpr;
            // Safe eval alternative for simple math
            this.currentExpr = String(Function('"use strict";return (' + this.currentExpr + ')')());
          } catch(e) {
            this.currentExpr = 'Error';
          }
        } else {
          if(this.currentExpr === 'Error') this.currentExpr = '';
          this.currentExpr += val;
        }
        this.renderCalc();
      };
    });
  }
}

class CalendarApp extends App {
  constructor() {
    super('calendar', 'Calendar');
    this.events = window.fileSystem.getEvents();
    this.selectedDate = null;
  }
  onLaunch() {
    this.renderCal();
  }
  onResume() {
    super.onResume();
    this.events = window.fileSystem.getEvents();
    this.renderCal();
  }
  renderCal() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0-6, Sun-Sat
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    let html = `
      <div style="display:flex; flex-direction:column; height:100%;">
        <div class="calendar-header">
          <span>${monthNames[month]} ${year}</span>
        </div>
        <div class="calendar-grid" style="margin-bottom:20px;">
          <div class="calendar-day-name">Sun</div>
          <div class="calendar-day-name">Mon</div>
          <div class="calendar-day-name">Tue</div>
          <div class="calendar-day-name">Wed</div>
          <div class="calendar-day-name">Thu</div>
          <div class="calendar-day-name">Fri</div>
          <div class="calendar-day-name">Sat</div>
    `;

    for (let i = 0; i < firstDay; i++) {
      html += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = (day === today.getDate());
      const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const hasEvents = this.events[dateKey] && this.events[dateKey].length > 0;
      
      html += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateKey}" style="cursor:pointer; position:relative;">
        ${day}
        ${hasEvents ? '<div style="position:absolute; bottom:2px; width:4px; height:4px; border-radius:50%; background:var(--accent-color);"></div>' : ''}
      </div>`;
    }

    html += `
        </div>
        <div style="flex:1; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px; overflow-y:auto;" id="calendar-events-container">
          <p style="color:#aaa; text-align:center;">Select a day to view events.</p>
        </div>
      </div>
      
      <!-- Event Modal -->
      <div id="event-modal" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:var(--app-bg); z-index:20; flex-direction:column;">
        <div style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1); font-weight:bold; display:flex; align-items:center;">
          <span style="margin-right:10px; cursor:pointer;" id="btn-close-event">⟵</span>
          New Event (<span id="event-modal-date"></span>)
        </div>
        <div style="padding:20px; display:flex; flex-direction:column; gap:15px;">
          <input type="time" id="event-time" style="padding:10px; border-radius:5px; border:none; background:rgba(255,255,255,0.1); color:white;">
          <input type="text" id="event-title" placeholder="Event Title" style="padding:10px; border-radius:5px; border:none; background:rgba(255,255,255,0.1); color:white;">
          <button class="btn" id="btn-save-event">Save Event</button>
        </div>
      </div>
    `;
    this.content.innerHTML = html;

    this.content.querySelectorAll('.calendar-day:not(.empty)').forEach(dayEl => {
      dayEl.onclick = () => {
        this.selectedDate = dayEl.getAttribute('data-date');
        this.renderEvents();
      };
    });

    this.content.querySelector('#btn-close-event').onclick = () => {
      this.content.querySelector('#event-modal').style.display = 'none';
    };

    this.content.querySelector('#btn-save-event').onclick = () => {
      const time = this.content.querySelector('#event-time').value;
      const title = this.content.querySelector('#event-title').value.trim();
      if(time && title && this.selectedDate) {
        if(!this.events[this.selectedDate]) this.events[this.selectedDate] = [];
        this.events[this.selectedDate].push({ time, title });
        this.events[this.selectedDate].sort((a,b) => a.time.localeCompare(b.time));
        window.fileSystem.saveEvents(this.events);
        this.content.querySelector('#event-modal').style.display = 'none';
        this.renderCal();
        this.renderEvents();
      } else {
        window.showToast("Please enter time and title");
      }
    };
  }
  
  renderEvents() {
    if(!this.selectedDate) return;
    const container = this.content.querySelector('#calendar-events-container');
    let html = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <strong>Events for ${this.selectedDate}</strong>
      <button class="btn" id="btn-add-event" style="padding:5px 10px; font-size:12px;">+ Add</button>
    </div>`;
    
    const dayEvents = this.events[this.selectedDate] || [];
    if(dayEvents.length === 0) {
      html += `<p style="color:#aaa; font-size:14px;">No events.</p>`;
    } else {
      dayEvents.forEach((ev, idx) => {
        html += `<div style="padding:10px; background:rgba(255,255,255,0.05); margin-bottom:5px; border-radius:5px; display:flex; justify-content:space-between;">
          <div><strong style="color:var(--accent-color);">${ev.time}</strong> - ${ev.title}</div>
          <span style="color:#e74c3c; cursor:pointer;" class="btn-del-event" data-idx="${idx}">🗑️</span>
        </div>`;
      });
    }
    container.innerHTML = html;
    
    container.querySelector('#btn-add-event').onclick = () => {
      this.content.querySelector('#event-modal-date').innerText = this.selectedDate;
      this.content.querySelector('#event-time').value = '12:00';
      this.content.querySelector('#event-title').value = '';
      this.content.querySelector('#event-modal').style.display = 'flex';
    };

    container.querySelectorAll('.btn-del-event').forEach(btn => {
      btn.onclick = () => {
        const idx = btn.getAttribute('data-idx');
        this.events[this.selectedDate].splice(idx, 1);
        if(this.events[this.selectedDate].length === 0) delete this.events[this.selectedDate];
        window.fileSystem.saveEvents(this.events);
        this.renderCal();
        this.renderEvents();
      };
    });
  }
}

class TelegramApp extends App {
  constructor() {
    super('telegram', 'Telegram');
    this.currentUrl = 'https://web.telegram.org/';
  }

  onLaunch() {
    this.renderWebview();
  }

  renderWebview() {
    // Hide default header to maximize space
    const header = this.container.querySelector('.app-header');
    if (header) header.style.display = 'none';

    this.content.style.display = 'flex';
    this.content.style.flexDirection = 'column';
    this.content.style.height = '100%';
    this.content.style.padding = '0';
    this.content.style.overflow = 'hidden';

    this.content.innerHTML = `
      <div class="telegram-app-container">
        <div class="telegram-toolbar">
          <button class="telegram-toolbar-btn" id="tg-btn-home" title="Inicio FlowerOS">🌸 Home</button>
          <button class="telegram-toolbar-btn" id="tg-btn-reload" title="Recargar Telegram">🔄 Recargar</button>
          <div style="flex:1;"></div>
          <span style="font-size:11px; color:#5288c1; font-weight:bold;">✈️ Telegram</span>
        </div>
        <div style="position:relative; flex:1; width:100%; height:100%;">
          <webview 
            id="telegram-view" 
            src="${this.currentUrl}" 
            useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" 
            allowpopups="true" 
            partition="persist:telegram"
            style="width:100%; height:100%; background:#17212b; border:none;"
          ></webview>
        </div>
      </div>
    `;

    this.content.querySelector('#tg-btn-home').onclick = () => {
      window.goHome();
    };

    this.content.querySelector('#tg-btn-reload').onclick = () => {
      const view = this.content.querySelector('#telegram-view');
      if (view) view.reload();
    };
  }

  openContact(number, name) {
    const cleanNum = (number || '').replace(/[^0-9+]/g, '');
    const view = this.content.querySelector('#telegram-view');
    if (cleanNum) {
      const tgUrl = cleanNum.startsWith('+') 
        ? `https://t.me/${cleanNum}` 
        : `https://web.telegram.org/k/#?phone=${cleanNum}`;
      if (view) view.src = tgUrl;
      window.showToast(`Conectando con ${name || cleanNum} en Telegram...`);
    }
  }
}

class GPSApp extends App {
  constructor() {
    super('gps', 'GPS Venezuela');
  }

  onLaunch() {
    this.renderGPSMain();
  }

  renderGPSMain() {
    const gps = window.hardwareSensors.getGPS();
    const cities = window.hardwareSensors.getVenezuelaCities();

    let cityOpts = '';
    for (let cName in cities) {
      const selected = (cName === gps.city) ? 'selected' : '';
      cityOpts += `<option value="${cName}" ${selected}>📍 ${cName} (${cities[cName].state})</option>`;
    }

    this.content.innerHTML = `
      <div class="gps-container">
        <div class="gps-header">
          <div class="gps-title">📍 GPS & Mapas Venezuela</div>
          <div class="gps-subtitle">Navegación & Telemetría Satelital</div>
        </div>

        <div class="gps-city-picker">
          <label style="font-size:12px; font-weight:bold;">Seleccionar Ciudad Vzla:</label>
          <select id="gps-city-select" class="gps-select">
            ${cityOpts}
          </select>
        </div>

        <!-- Interactive Map Canvas / SVG -->
        <div class="gps-map-card">
          <div class="gps-map-canvas-wrapper" id="gps-map-box">
            <svg class="gps-map-svg" viewBox="0 0 400 240">
              <!-- Venezuela Border Sketch -->
              <path d="M 40,90 Q 70,30 140,25 Q 220,20 310,40 Q 360,90 350,160 Q 300,210 210,215 Q 120,210 60,160 Z" fill="rgba(0,136,204,0.15)" stroke="#0088cc" stroke-width="2" />
              <!-- Lake Maracaibo -->
              <ellipse cx="90" cy="75" rx="18" ry="25" fill="rgba(9,132,227,0.4)" stroke="#74b9ff" stroke-width="1" />
              <!-- Orinoco River Line -->
              <path d="M 120,150 Q 200,165 330,130" fill="none" stroke="#74b9ff" stroke-width="2" stroke-dasharray="4,2" />
              
              <!-- City Markers -->
              <g id="svg-city-markers">
                <circle cx="190" cy="55" r="5" fill="#e74c3c" /><text x="190" y="45" font-size="9" fill="white" text-anchor="middle">Caracas</text>
                <circle cx="160" cy="70" r="5" fill="#f1c40f" /><text x="160" y="62" font-size="9" fill="white" text-anchor="middle">Valencia</text>
                <circle cx="90" cy="65" r="5" fill="#e67e22" /><text x="90" y="55" font-size="9" fill="white" text-anchor="middle">Maracaibo</text>
                <circle cx="140" cy="85" r="5" fill="#2ecc71" /><text x="140" y="98" font-size="9" fill="white" text-anchor="middle">Barquisimeto</text>
                <circle cx="110" cy="115" r="5" fill="#9b59b6" /><text x="110" y="128" font-size="9" fill="white" text-anchor="middle">Mérida</text>
                <circle cx="260" cy="65" r="5" fill="#1abc9c" /><text x="260" y="55" font-size="9" fill="white" text-anchor="middle">Puerto La Cruz</text>
                <circle cx="280" cy="135" r="5" fill="#34495e" /><text x="280" y="148" font-size="9" fill="white" text-anchor="middle">Ciudad Guayana</text>
              </g>

              <!-- Target Pulsing Pin -->
              <circle id="map-target-pin" cx="190" cy="55" r="8" fill="var(--accent-color)" opacity="0.8">
                <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        </div>

        <!-- Telemetry Data Cards -->
        <div class="gps-telemetry-grid">
          <div class="gps-card">
            <div class="gps-card-title">Latitud</div>
            <div class="gps-card-val" id="gps-val-lat">${gps.lat}° N</div>
          </div>
          <div class="gps-card">
            <div class="gps-card-title">Longitud</div>
            <div class="gps-card-val" id="gps-val-lng">${gps.lng}° W</div>
          </div>
          <div class="gps-card">
            <div class="gps-card-title">Estado</div>
            <div class="gps-card-val" id="gps-val-state">${gps.state}</div>
          </div>
          <div class="gps-card">
            <div class="gps-card-title">Altitud</div>
            <div class="gps-card-val" id="gps-val-alt">${gps.alt || '450m'}</div>
          </div>
        </div>

        <div class="gps-status-bar">
          <span>🛰️ Satélites: 5/5</span>
          <span>Precisión: ${gps.accuracy}</span>
          <span>${gps.isReal ? 'GPS Sensor Real' : 'Aproximado Vzla'}</span>
        </div>

        <!-- Route Finder -->
        <div class="gps-route-box">
          <div style="font-weight:bold; margin-bottom:8px;">🚗 Calculador de Ruta en Venezuela</div>
          <div style="display:flex; gap:8px; align-items:center;">
            <select id="route-from" class="gps-select" style="flex:1;">
              <option value="Caracas">Caracas</option>
              <option value="Valencia">Valencia</option>
              <option value="Maracaibo">Maracaibo</option>
            </select>
            <span>➡️</span>
            <select id="route-to" class="gps-select" style="flex:1;">
              <option value="Mérida">Mérida</option>
              <option value="Puerto La Cruz">Puerto La Cruz</option>
              <option value="Barquisimeto">Barquisimeto</option>
            </select>
          </div>
          <button class="btn" id="btn-calc-route" style="width:100%; margin-top:8px;">Calcular Distancia & Tiempo</button>
          <div id="route-results" style="margin-top:8px; font-size:12px; color:#aaa; text-align:center;"></div>
        </div>
      </div>
    `;

    const cityCoordsSVG = {
      'Caracas': { cx: 190, cy: 55 },
      'Valencia': { cx: 160, cy: 70 },
      'Maracaibo': { cx: 90, cy: 65 },
      'Barquisimeto': { cx: 140, cy: 85 },
      'Mérida': { cx: 110, cy: 115 },
      'Puerto La Cruz': { cx: 260, cy: 65 },
      'Ciudad Guayana': { cx: 280, cy: 135 },
      'San Cristóbal': { cx: 80, cy: 130 }
    };

    const updatePin = (cityName) => {
      const pin = this.content.querySelector('#map-target-pin');
      if (pin && cityCoordsSVG[cityName]) {
        pin.setAttribute('cx', cityCoordsSVG[cityName].cx);
        pin.setAttribute('cy', cityCoordsSVG[cityName].cy);
      }
    };

    updatePin(gps.city);

    this.content.querySelector('#gps-city-select').onchange = (e) => {
      const selectedCity = e.target.value;
      window.hardwareSensors.setCity(selectedCity);
      const newGps = window.hardwareSensors.getGPS();
      this.content.querySelector('#gps-val-lat').innerText = `${newGps.lat}° N`;
      this.content.querySelector('#gps-val-lng').innerText = `${newGps.lng}° W`;
      this.content.querySelector('#gps-val-state').innerText = newGps.state;
      this.content.querySelector('#gps-val-alt').innerText = newGps.alt || '450m';
      updatePin(selectedCity);
      window.showToast(`GPS centrado en ${selectedCity}, Venezuela 📍`);
    };

    this.content.querySelector('#btn-calc-route').onclick = () => {
      const from = this.content.querySelector('#route-from').value;
      const to = this.content.querySelector('#route-to').value;
      
      const routesDist = {
        'Caracas-Mérida': { dist: 675, time: '9h 15m', road: 'Autopista ARC / Troncal 5' },
        'Caracas-Valencia': { dist: 160, time: '2h 10m', road: 'Autopista Regional del Centro' },
        'Caracas-Puerto La Cruz': { dist: 320, time: '4h 30m', road: 'Troncal 9' },
        'Valencia-Maracaibo': { dist: 510, time: '6h 45m', road: 'Lara-Zulia' },
        'Valencia-Barquisimeto': { dist: 220, time: '2h 50m', road: 'Autopista Cimarrón Andresote' }
      };

      const key1 = `${from}-${to}`;
      const key2 = `${to}-${from}`;
      const info = routesDist[key1] || routesDist[key2] || { dist: 450, time: '6h 00m', road: 'Carretera Nacional Venezuela' };

      this.content.querySelector('#route-results').innerHTML = `
        <strong style="color:var(--accent-color);">${from} ➡️ ${to}</strong><br>
        📏 Distancia: <strong>${info.dist} km</strong> | ⏱️ Tiempo: <strong>${info.time}</strong><br>
        🛣️ Vía: ${info.road}
      `;
    };
  }
}

window.Apps = {
  SettingsApp,
  DevOptionsApp,
  FileExplorerApp,
  CameraApp,
  GalleryApp,
  BrowserApp,
  PhoneApp,
  MessagesApp,
  ContactsApp,
  MusicApp,
  ClockApp,
  CalculatorApp,
  CalendarApp,
  TelegramApp,
  GPSApp
};
