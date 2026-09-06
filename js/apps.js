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
    super('settings', 'Settings');
  }
  onLaunch() {
    const settings = window.fileSystem.getSettings();
    this.content.innerHTML = `
      <div class="setting-row">
        <span>Wi-Fi / Data</span>
        <input type="checkbox" id="setting-wifi" ${window.powerManager.networkActive ? 'checked' : ''}>
      </div>
      <div class="setting-row">
        <span>Battery Saver</span>
        <input type="checkbox" id="setting-saver" ${window.powerManager.batterySaver ? 'checked' : ''}>
      </div>
      <div class="setting-row">
        <span>Brightness</span>
        <input type="range" class="range-slider" id="setting-brightness" min="0.1" max="1" step="0.1" value="${window.powerManager.brightness}">
      </div>
      <div class="setting-row">
        <span>GPS Latitude</span>
        <input type="text" id="setting-lat" value="${window.hardwareSensors.getGPS().lat}" style="width:80px">
      </div>
      <div class="setting-row">
        <span>GPS Longitude</span>
        <input type="text" id="setting-lng" value="${window.hardwareSensors.getGPS().lng}" style="width:80px">
      </div>
      <div style="text-align:center; margin-top:15px; margin-bottom:15px;">
        <button class="btn" id="setting-save-gps">Update GPS</button>
      </div>
      <div class="setting-row">
        <span>Lock PIN (4 digits)</span>
        <input type="password" id="setting-pin" placeholder="None" value="${settings.lockPin}" style="width:60px" maxlength="4">
      </div>
      <div class="setting-row">
        <span>24-Hour Time</span>
        <input type="checkbox" id="setting-24h" ${settings.use24h ? 'checked' : ''}>
      </div>
      <div class="setting-row">
        <span>Accent Color</span>
        <input type="color" id="setting-color" value="${settings.accentColor}">
      </div>
      <div class="setting-row">
        <span>Theme</span>
        <select id="setting-theme">
          <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
          <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
        </select>
      </div>
      <div class="setting-row">
        <span>Wallpaper</span>
        <select id="setting-wallpaper">
          <option value="default" ${settings.wallpaper === 'default' ? 'selected' : ''}>Default Gradient</option>
          <option value="solid-black" ${settings.wallpaper === 'solid-black' ? 'selected' : ''}>Solid Black</option>
          <option value="nature" ${settings.wallpaper === 'nature' ? 'selected' : ''}>Nature (Placeholder)</option>
        </select>
      </div>
    `;

    this.content.querySelector('#setting-wifi').addEventListener('change', (e) => {
      window.powerManager.setNetwork(e.target.checked);
      document.getElementById('network-icon').style.opacity = e.target.checked ? '1' : '0.3';
    });
    this.content.querySelector('#setting-saver').addEventListener('change', (e) => {
      window.powerManager.setBatterySaver(e.target.checked);
    });
    this.content.querySelector('#setting-brightness').addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      window.powerManager.setBrightness(val);
      document.getElementById('screen').style.filter = `brightness(${val})`;
    });
    this.content.querySelector('#setting-save-gps').addEventListener('click', () => {
      const lat = parseFloat(this.content.querySelector('#setting-lat').value);
      const lng = parseFloat(this.content.querySelector('#setting-lng').value);
      window.hardwareSensors.setGPS(lat, lng);
      window.showToast('GPS Updated');
    });

    this.content.querySelector('#setting-pin').addEventListener('change', (e) => {
      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
      e.target.value = val;
      window.fileSystem.updateSettings({ lockPin: val });
    });
    this.content.querySelector('#setting-24h').addEventListener('change', (e) => {
      window.fileSystem.updateSettings({ use24h: e.target.checked });
      if (window.updateClock) window.updateClock(); // Force clock update if available
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
    });
  }
}

class DevOptionsApp extends App {
  constructor() {
    super('dev-options', 'Developer Options');
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
      <div class="stat-box">
        <h3>Memory (RAM)</h3>
        <p>Total: ${stats.totalRam} MB</p>
        <p>Used: ${stats.usedRam} MB (${((stats.usedRam/stats.totalRam)*100).toFixed(1)}%)</p>
      </div>
      <div class="stat-box">
        <h3>Power</h3>
        <p>Battery: ${window.powerManager.battery.toFixed(2)}%</p>
        <p>Saver Mode: ${window.powerManager.batterySaver ? 'ON' : 'OFF'}</p>
      </div>
      <div class="stat-box">
        <h3>App Processes</h3>
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

class WhatsAppWebApp extends App {
  constructor() {
    super('whatsapp-web', 'WhatsApp Web');
  }

  onLaunch() {
    // Hide header completely to maximize space
    const header = this.container.querySelector('.app-header');
    header.style.display = 'none';

    this.content.style.display = 'flex';
    this.content.style.flexDirection = 'column';
    this.content.style.height = '100%';
    this.content.style.padding = '0';
    this.content.style.overflow = 'hidden';

    this.content.innerHTML = `
      <div style="position:relative; flex:1; width:100%; height:100%;">
        <webview 
          id="whatsapp-view" 
          src="https://web.whatsapp.com/" 
          useragent="Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36" 
          allowpopups="true" 
          partition="persist:whatsapp"
          style="width:100%; height:100%; background:white; border:none; position:absolute; top:0; left:0;"
        ></webview>
        <button onclick="window.goHome()" style="position:absolute; top:10px; left:10px; z-index:1000; background:rgba(0,0,0,0.5); color:white; border:none; border-radius:50%; width:40px; height:40px; font-size:20px; cursor:pointer;">✕</button>
      </div>
    `;
  }
}

class PhoneApp extends App {
  constructor() {
    super('phone', 'Phone');
    this.timerInterval = null;
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
          <button class="dial-btn call-btn" id="btn-call">📞</button>
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
      const number = display.innerText;
      if (number.length > 0) {
        this.renderCallScreen(number);
      }
    });
  }
  
  renderCallScreen(number) {
    const contacts = window.fileSystem.getContacts();
    const contact = contacts.find(c => c.number === number);
    const displayName = contact ? contact.name : number;
    const displayNum = contact ? number : '';

    this.content.innerHTML = `
      <div class="call-screen">
        <div class="call-avatar">👤</div>
        <div class="call-number">${displayName}</div>
        <div style="font-size:14px; color:#aaa; margin-bottom:10px;">${displayNum}</div>
        <div class="call-status" id="call-status">Calling...</div>
        <div style="flex:1;"></div>
        <button class="end-call-btn" id="btn-end-call">☎️</button>
        <div style="height:40px;"></div>
      </div>
    `;
    
    let seconds = 0;
    setTimeout(() => {
      const status = this.content.querySelector('#call-status');
      if (status) {
        status.innerText = '00:00';
        this.timerInterval = setInterval(() => {
          seconds++;
          const m = String(Math.floor(seconds / 60)).padStart(2, '0');
          const s = String(seconds % 60).padStart(2, '0');
          if (this.content.querySelector('#call-status')) {
            this.content.querySelector('#call-status').innerText = `${m}:${s}`;
          }
        }, 1000);
      }
    }, 2000); // Simulate connect after 2s

    this.content.querySelector('#btn-end-call').addEventListener('click', () => {
      this.endCall();
    });
  }

  endCall() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.renderDialer();
  }

  onPause() {
    super.onPause();
  }
  onTerminate() {
    super.onTerminate();
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}

class MessagesApp extends App {
  constructor() {
    super('messages', 'Messages');
    this.conversations = window.fileSystem.getConversations();
  }
  onLaunch() {
    this.conversations = window.fileSystem.getConversations();
    this.renderList();
  }
  onResume() {
    super.onResume();
    this.conversations = window.fileSystem.getConversations();
    this.renderList();
  }
  renderList() {
    let html = `
      <div class="messages-container">
        <div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.1); text-align:center;">
          <button class="new-msg-btn" id="btn-new-chat">+ New Chat</button>
        </div>
        <div class="messages-list">
    `;
    if (this.conversations.length === 0) {
      html += '<p style="color:#aaa; text-align:center; margin-top:20px;">No messages yet.</p>';
    } else {
      this.conversations.forEach(conv => {
        const lastMsg = conv.messages[conv.messages.length - 1];
        const lastText = lastMsg ? (lastMsg.sender === 'me' ? 'You: ' : '') + lastMsg.text : '';
        html += `
          <div class="msg-thread" data-id="${conv.id}">
            <div class="msg-avatar">${conv.name.charAt(0).toUpperCase()}</div>
            <div class="msg-info">
              <div class="msg-name">${conv.name}</div>
              <div class="msg-preview">${lastText}</div>
            </div>
          </div>
        `;
      });
    }
    html += `
        </div>
      </div>
      <div id="new-chat-modal" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:var(--app-bg); z-index:20; flex-direction:column;">
        <div style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1); font-weight:bold; display:flex; align-items:center;">
          <span style="margin-right:10px; cursor:pointer;" id="btn-close-new-chat">⟵</span>
          Select Contact
        </div>
        <div id="new-chat-contacts" style="flex:1; overflow-y:auto;"></div>
      </div>
    `;
    this.content.innerHTML = html;

    this.content.querySelectorAll('.msg-thread').forEach(thread => {
      thread.addEventListener('click', () => {
        this.renderChat(thread.getAttribute('data-id'));
      });
    });

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
      container.innerHTML = '<p style="color:#aaa; text-align:center; margin-top:20px;">No contacts available.</p>';
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
        
        // Check if conversation already exists
        let conv = this.conversations.find(c => c.number === number);
        if (!conv) {
          conv = { id: Date.now().toString(), name, number, messages: [] };
          this.conversations.push(conv);
          window.fileSystem.saveConversations(this.conversations);
        }
        modal.style.display = 'none';
        this.renderChat(conv.id);
      });
    });
  }


  renderChat(id) {
    const conv = this.conversations.find(c => c.id === id);
    let html = `
      <div class="chat-view">
        <div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.1); font-weight:bold; display:flex; align-items:center;">
          <span style="margin-right:10px; cursor:pointer;" id="btn-back-msgs">⟵</span>
          ${conv.name}
        </div>
        <div class="chat-messages" id="chat-messages">
    `;
    conv.messages.forEach(msg => {
      html += `<div class="chat-bubble ${msg.sender === 'me' ? 'sent' : 'received'}">${msg.text}</div>`;
    });
    html += `
        </div>
        <div class="chat-input-area">
          <input type="text" id="chat-input" placeholder="Type message...">
          <button id="btn-send-msg">➤</button>
        </div>
      </div>
    `;
    this.content.innerHTML = html;

    const messagesContainer = this.content.querySelector('#chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    this.content.querySelector('#btn-back-msgs').addEventListener('click', () => {
      this.renderList();
    });

    const sendMsg = () => {
      const input = this.content.querySelector('#chat-input');
      const text = input.value.trim();
      if (text) {
        conv.messages.push({ sender: 'me', text });
        window.fileSystem.saveConversations(this.conversations);
        input.value = '';
        this.renderChat(id);
        
        // Bot reply logic
        setTimeout(() => {
          conv.messages.push({ sender: 'them', text: 'Ok sounds good!' });
          window.fileSystem.saveConversations(this.conversations);
          if (this.content.querySelector('#chat-messages')) {
            this.renderChat(id); // Re-render if still in chat
          }
          // Also show notification on lock screen if locked
          if (document.getElementById('lock-screen').classList.contains('active')) {
            const notif = document.getElementById('lock-notif-msg');
            if (notif) notif.style.display = 'flex';
          }
        }, 3000);
      }
    };

    this.content.querySelector('#btn-send-msg').addEventListener('click', sendMsg);
    this.content.querySelector('#chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMsg();
    });
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
            <button class="action-btn" id="btn-delete-contact" style="background:#e74c3c;">
              🗑️<span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
    this.content.innerHTML = html;

    this.content.querySelectorAll('.contact-item').forEach(item => {
      item.addEventListener('click', () => {
        this.renderDetail(item.getAttribute('data-id'));
      });
    });

    const addBtn = this.content.querySelector('#btn-add-contact');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.content.querySelector('#contact-form-view').style.display = 'flex';
        this.content.querySelector('#contact-name').value = '';
        this.content.querySelector('#contact-number').value = '';
      });
    }

    const closeFormBtn = this.content.querySelector('#btn-close-form');
    if (closeFormBtn) {
      closeFormBtn.addEventListener('click', () => {
        this.content.querySelector('#contact-form-view').style.display = 'none';
      });
    }

    const saveBtn = this.content.querySelector('#btn-save-contact');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const name = this.content.querySelector('#contact-name').value.trim();
        const number = this.content.querySelector('#contact-number').value.trim();
        if (name && number) {
          window.fileSystem.addContact(name, number);
          window.showToast('Contact saved');
          this.content.querySelector('#contact-form-view').style.display = 'none';
          this.renderList();
        } else {
          window.showToast('Please enter name and number');
        }
      });
    }
  }

  renderDetail(id) {
    const contact = window.fileSystem.getContacts().find(c => c.id === id);
    if (!contact) return;

    const detailView = this.content.querySelector('#contact-detail-view');
    detailView.style.display = 'flex';
    
    this.content.querySelector('#detail-avatar').innerText = contact.name.charAt(0).toUpperCase();
    this.content.querySelector('#detail-name').innerText = contact.name;
    this.content.querySelector('#detail-number').innerText = contact.number;

    this.content.querySelector('#btn-close-detail').onclick = () => {
      detailView.style.display = 'none';
    };

    this.content.querySelector('#btn-delete-contact').onclick = () => {
      window.fileSystem.deleteContact(id);
      window.showToast('Contact deleted');
      detailView.style.display = 'none';
      this.renderList();
    };
    
    this.content.querySelector('#btn-call-contact').onclick = () => {
      if (window.launchAppWithParams) {
        window.launchAppWithParams('phone', { action: 'call', number: contact.number });
      }
    };
    
    this.content.querySelector('#btn-msg-contact').onclick = () => {
      if (window.launchAppWithParams) {
        window.launchAppWithParams('messages', { action: 'chat', number: contact.number, name: contact.name });
      }
    };
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

window.Apps = {
  SettingsApp,
  DevOptionsApp,
  FileExplorerApp,
  CameraApp,
  GalleryApp,
  BrowserApp,
  WhatsAppWebApp,
  PhoneApp,
  MessagesApp,
  ContactsApp,
  MusicApp,
  ClockApp,
  CalculatorApp,
  CalendarApp
};
