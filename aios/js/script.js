// =========================================================================
// AI Mobile OS - Full System Script (FIXED FOR RESTORE & PWA)
// =========================================================================

const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// --- 全局變量 (核心修正：確保與 localStorage 同步) ---
let currentCalculation = '';
let calculatorDisplay = '';
let phoneNumber = '';
let userPasscode = localStorage.getItem('userPasscode') || '';
let currentPasscodeEntry = '';
let currentTheme = localStorage.getItem('currentTheme') || 'theme-light';
let userPhotos = JSON.parse(localStorage.getItem('userPhotos')) || [];
let currentHomeWallpaper = localStorage.getItem('homeWallpaper') || '';
let currentLockWallpaper = localStorage.getItem('lockWallpaper') || '';
let cameraStream = null;
let currentCameraFacingMode = 'user';

// --- 預設系統 App 名單 (當完全無備份資料時使用) ---
const defaultApps = [
    { id: "cydia2", name: "Cydia 😭", icon: "cydia2", iconColor: "#f39c12", type: "website", url: "https://tnhdev123.github.io/site/webkitjelbrek/jailbreakme/xd.html" },
    { id: "youtube", name: "YouTube", icon: "https://www.youtube.com/apple-touch-icon.png", iconColor: "#ff0000", type: "website", url: "https://www.youtube.com" },
    { id: "calculator", name: "Calculator", icon: "calculator", iconColor: "#27ae60", type: "system" },
    { id: "settings", name: "Settings", icon: "cog", iconColor: "#7f8c8d", type: "system" },
    { id: "camera", name: "Camera", icon: "camera", iconColor: "#34495e", type: "system" },
    { id: "photos", name: "Photos", icon: "images", iconColor: "#9b59b6", type: "system" },
    { id: "phone", name: "Phone", icon: "phone", iconColor: "#2ecc71", type: "system" },
    { id: "app-store", name: "App Store", icon: "shopping-basket", iconColor: "#3498db", type: "system" },
    { id: "ai-assistant", name: "AI Assistant", icon: "robot", iconColor: "#e67e22", type: "system" },
    { id: "ai-math", name: "AI Math", icon: "square-root-alt", iconColor: "#e74c3c", type: "system" },
    { id: "ai-messages", name: "AI Messages", icon: "comment-dots", iconColor: "#3498db", type: "system" },
    { id: "ai-to-ui", name: "AI to UI", icon: "paint-brush", iconColor: "#9b59b6", type: "system" }
];

// 初始化已安裝列表：優先從備份讀取
let installedApps = JSON.parse(localStorage.getItem('installedApps')) || defaultApps;

// --- 渲染桌面 (自動繪製備份檔中的所有 App) ---
function renderApps() {
    const appsGrid = document.getElementById('appsGrid');
    if (!appsGrid) return;
    appsGrid.innerHTML = ''; 

    installedApps.forEach(app => {
        const appDiv = document.createElement('div');
        appDiv.className = 'app-icon';
        
        // 智能識別圖標：網址或 FontAwesome 名稱
        const isUrl = app.icon && (app.icon.startsWith('http') || app.icon.includes('.'));
        const iconContent = isUrl 
            ? `<img src="${app.icon}" style="width:100%; height:100%; border-radius:12px; object-fit:cover;">`
            : `<i class="fas fa-${app.icon}"></i>`;

        appDiv.innerHTML = `
            <div class="icon-box" style="background-color: ${app.iconColor || '#333'}">
                ${iconContent}
            </div>
            <span class="app-name">${app.name}</span>
        `;
        appDiv.onclick = () => openApp(app.id);
        appsGrid.appendChild(appDiv);
    });
}

// --- 開啟 App (修正版：支援系統 App + 第三方備份 App) ---
function openApp(appId) {
    // 檢查 App Lock (如果你有定義 _isLocked)
    if (window._isLocked && window._isLocked(appId)) return;

    const targetApp = installedApps.find(a => a.id === appId);
    
    // 如果是第三方網站 (還原備份來的)
    if (targetApp && targetApp.type === 'website') {
        const webBrowser = document.getElementById('web-browser-window') || document.getElementById('web-browser');
        const webIframe = document.getElementById('webIframe');
        const iframeTitle = document.querySelector('.iframe-title');
        
        if (webIframe) {
            webIframe.src = targetApp.url;
            if (iframeTitle) iframeTitle.textContent = targetApp.name;
            showAppWindow('web-browser'); 
            return;
        }
    }

    // 原生系統功能對接
    switch(appId) {
        case 'calculator': showAppWindow('calculator'); break;
        case 'settings': showAppWindow('settings'); break;
        case 'camera': showAppWindow('camera'); startCamera(); break;
        case 'photos': showAppWindow('photos'); renderPhotos(); break;
        case 'phone': showAppWindow('phone'); break;
        case 'app-store': showAppWindow('app-store'); break;
        case 'ai-assistant': showAppWindow('ai-assistant'); break;
        case 'ai-math': showAppWindow('ai-math'); break;
        case 'ai-messages': showAppWindow('ai-messages'); break;
        case 'ai-to-ui': showAppWindow('ai-to-ui'); break;
    }
}

// --- 核心備份還原處理 (修正 PWA 刷新問題) ---
function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // 寫入所有備份資料到 localStorage
            Object.keys(data).forEach(key => {
                const value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
                localStorage.setItem(key, value);
            });
            
            alert("You finally believe me.😭 - Respringing...");
            location.reload(); 
        } catch (err) {
            alert("Backup corrupted or invalid.");
        }
    };
    reader.readAsText(file);
}

// --- 視窗管理 ---
function showAppWindow(appId) {
    const windows = document.querySelectorAll('.app-window');
    windows.forEach(win => win.classList.remove('active'));
    
    const target = document.getElementById(appId + '-window') || document.getElementById(appId);
    if (target) {
        target.classList.add('active');
        document.getElementById('homeScreen').style.display = 'none';
    }
}

function closeApp() {
    const windows = document.querySelectorAll('.app-window');
    windows.forEach(win => win.classList.remove('active'));
    document.getElementById('homeScreen').style.display = 'block';
    if (cameraStream) stopCamera();
}

// --- 初始化 (確保 DOM 加載完畢後執行) ---
document.addEventListener('DOMContentLoaded', () => {
    // 渲染桌面
    renderApps();
    
    // 初始化時鐘
    updateClock();
    setInterval(updateClock, 1000);
    
    // 綁定備份按鈕 (請確保你的 HTML 中備份 input ID 是 backupFileInput)
    const backupInput = document.getElementById('backupFileInput');
    if (backupInput) backupInput.onchange = importBackup;

    // 保留你原本的 IndexedDB 初始化與 Passcode 檢查邏輯
    if (typeof initDB === 'function') initDB();
});

function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('current-time');
    const dateEl = document.getElementById('current-date');
    if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (dateEl) dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

// =========================================================================
// [請將你原本 script.js 中關於 Calculator, Camera, AI API 的具體實作接在下方]
// =========================================================================
