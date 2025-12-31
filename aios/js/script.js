// ==========================================================
// AI Mobile OS - Full System Script (Restoration Fixed Version)
// ==========================================================

const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// --- 全局變量 (核心修正：優先讀取 localStorage 以支援還原自訂 App) ---
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

// 系統預設名單 (當完全無資料時使用)
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
    { id: "ai-math", name: "AI Math", icon: "square-root-alt", iconColor: "#e74c3c", type: "system" }
];

// 關鍵：從存儲讀取已安裝列表
let installedApps = JSON.parse(localStorage.getItem('installedApps')) || defaultApps;

// --- IndexedDB 初始化 (相簿功能) ---
const DB_NAME = 'userPhotosDB';
const STORE_NAME = 'photos';
let db;
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = e => e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
        request.onsuccess = e => { db = e.target.result; resolve(); };
        request.onerror = e => reject(e.target.error);
    });
}

// --- 渲染桌面 (動態支援所有自訂 App) ---
function renderApps() {
    const appsGrid = document.getElementById('appsGrid');
    if (!appsGrid) return;
    appsGrid.innerHTML = ''; 

    installedApps.forEach(app => {
        const appDiv = document.createElement('div');
        appDiv.className = 'app-icon';
        const isUrl = app.icon && (app.icon.startsWith('http') || app.icon.includes('.'));
        const iconContent = isUrl 
            ? `<img src="${app.icon}" style="width:100%; height:100%; border-radius:12px; object-fit:cover;">`
            : `<i class="fas fa-${app.icon}"></i>`;

        appDiv.innerHTML = `
            <div class="icon-box" style="background-color: ${app.iconColor || '#333'}">${iconContent}</div>
            <span class="app-name">${app.name}</span>
        `;
        appDiv.onclick = () => openApp(app.id);
        appsGrid.appendChild(appDiv);
    });
}

// --- 開啟 App (萬能適配器) ---
function openApp(appId) {
    // 檢查是否被 App Lock 鎖住 (稍後會有 Patch)
    if (window._isLocked && window._isLocked(appId)) return;

    const targetApp = installedApps.find(a => a.id === appId);
    
    // 如果是第三方網站 (還原來的)
    if (targetApp && targetApp.type === 'website') {
        const webIframe = document.getElementById('webIframe');
        const iframeTitle = document.querySelector('.iframe-title');
        if (webIframe) {
            webIframe.src = targetApp.url;
            if (iframeTitle) iframeTitle.textContent = targetApp.name;
            showAppWindow('web-browser'); 
            return;
        }
    }

    // 原生系統功能
    switch(appId) {
        case 'calculator': showAppWindow('calculator'); break;
        case 'settings': showAppWindow('settings'); break;
        case 'camera': showAppWindow('camera'); startCamera(); break;
        case 'photos': showAppWindow('photos'); renderPhotos(); break;
        case 'phone': showAppWindow('phone'); break;
        case 'app-store': showAppWindow('app-store'); break;
        case 'ai-assistant': showAppWindow('ai-assistant'); break;
        case 'ai-math': showAppWindow('ai-math'); break;
        case 'ai-to-ui': showAppWindow('ai-to-ui'); break;
    }
}

// --- 介面控制核心 ---
function showAppWindow(appId) {
    const windows = document.querySelectorAll('.app-window');
    windows.forEach(win => win.classList.remove('active'));
    const target = document.getElementById(appId + '-window') || document.getElementById(appId);
    if (target) target.classList.add('active');
    document.getElementById('homeScreen').style.display = 'none';
}

function closeApp() {
    const windows = document.querySelectorAll('.app-window');
    windows.forEach(win => win.classList.remove('active'));
    document.getElementById('homeScreen').style.display = 'block';
    if (cameraStream) stopCamera();
}

// --- 修正備份還原邏輯 (支援自訂名單) ---
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            Object.keys(data).forEach(key => {
                localStorage.setItem(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
            });
            alert("You finally believe me.😭");
            location.reload(); 
        } catch (err) { alert("Invalid Backup File"); }
    };
    reader.readAsText(file);
}

// --- 初始化加載 ---
window.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    renderApps();
    updateClock();
    setInterval(updateClock, 1000);
    
    // 綁定還原按鈕 (假設 ID 係 importBackupBtn)
    const fileInput = document.getElementById('backupFileInput');
    if (fileInput) fileInput.onchange = handleFileSelect;
});

function updateClock() {
    const now = new Date();
    if (document.getElementById('current-time'))
        document.getElementById('current-time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (document.getElementById('current-date'))
        document.getElementById('current-date').textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

// ==========================================================
// 此處請保留你原本代碼中關於：
// 1. 計算機按鈕點擊邏輯 (calcBtnClick)
// 2. AI Assistant API Fetch 邏輯
// 3. Camera Start/Stop 邏輯
// 4. App Lock (Passcode) 的 Patch 邏輯
// ==========================================================
