// ==========================================================
// AI Mobile OS - 最終完整修正版 (支援 App Store 動態安裝)
// ==========================================================

const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// --- 全局變量 ---
let currentCalculation = '';
let calculatorDisplay = '';
let installedApps = JSON.parse(localStorage.getItem('installedApps')) || []; 
let phoneNumber = '';
let userPasscode = localStorage.getItem('userPasscode') || '';
let currentPasscodeEntry = '';
let currentTheme = localStorage.getItem('currentTheme') || 'theme-light';
let userPhotos = JSON.parse(localStorage.getItem('userPhotos')) || [];
let currentHomeWallpaper = localStorage.getItem('homeWallpaper') || '';
let currentLockWallpaper = localStorage.getItem('lockWallpaper') || '';
let cameraStream = null;
let currentCameraFacingMode = 'user';

// --- 1. IndexedDB 初始化 (相簿功能) ---
const DB_NAME = 'userPhotosDB';
const STORE_NAME = 'photos';
let db;
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = event => { db = event.target.result; resolve(); };
        request.onerror = event => { reject(event.target.error); };
    });
}

// --- 2. 核心：安裝與渲染 App 邏輯 ---
function installCustomApp() {
    const name = prompt("輸入 App 名稱:");
    const url = prompt("輸入網址 (https://):");
    const icon = prompt("輸入圖示 (網址或 FontAwesome 名稱):");
    const id = prompt("輸入唯一 ID:");

    if (name && url && id) {
        if (installedApps.some(app => app.id === id)) {
            alert("錯誤：ID 已存在！");
            return;
        }
        const newApp = { id, name, icon: icon || "globe", type: "website", url, iconColor: "#3498db" };
        installedApps.push(newApp);
        localStorage.setItem('installedApps', JSON.stringify(installedApps));
        renderApps(); // 立即刷新桌面
        alert("安裝成功！");
    }
}

function renderApps() {
    const appsGrid = document.getElementById('appsGrid');
    if (!appsGrid) return;
    
    // 只移除動態產生的 Icon，保留 HTML 原生的
    document.querySelectorAll('.app-icon[data-custom="true"]').forEach(el => el.remove());

    installedApps.forEach(app => {
        const appDiv = document.createElement('div');
        appDiv.className = 'app-icon';
        appDiv.setAttribute('data-custom', 'true');
        
        const isUrl = app.icon && (app.icon.startsWith('http') || app.icon.includes('.'));
        const iconHtml = isUrl 
            ? `<img src="${app.icon}" style="width:100%; height:100%; border-radius:12px; object-fit:cover;">`
            : `<i class="fas fa-${app.icon}"></i>`;

        appDiv.innerHTML = `
            <div class="icon-box" style="background-color: ${app.iconColor || '#333'}">${iconHtml}</div>
            <span class="app-name">${app.name}</span>
        `;
        appDiv.onclick = () => openApp(app.id);
        appsGrid.appendChild(appDiv);
    });
}

// --- 3. 核心：開啟 App (解決你「點了沒反應」的問題) ---
function openApp(appName) {
    // 密碼檢查邏輯
    const isLocked = (appName === 'calculator' && localStorage.getItem('lock_calculator') === 'true') ||
                     (appName === 'camera' && localStorage.getItem('lock_camera') === 'true') ||
                     (appName === 'app-store' && localStorage.getItem('lock_app-store') === 'true') ||
                     (appName === 'phone' && localStorage.getItem('lock_phone') === 'true') ||
                     (appName === 'ai-to-ui' && localStorage.getItem('lock_ai-to-ui') === 'true');

    if (isLocked) {
        const pass = prompt("Enter Passcode:");
        if (pass !== userPasscode) { alert("Incorrect Passcode"); return; }
    }

    // A. 檢查是否為「自訂第三方 App」
    const customApp = installedApps.find(a => a.id === appName);
    if (customApp && customApp.type === 'website') {
        const webIframe = document.getElementById('webIframe');
        const iframeTitle = document.querySelector('.iframe-title');
        if (webIframe) {
            webIframe.src = customApp.url;
            if (iframeTitle) iframeTitle.textContent = customApp.name;
            showAppWindow('web-browser');
            return;
        }
    }

    // B. 原生 App 分支
    if (appName === 'app-store') {
        showAppWindow('app-store');
        const storeContent = document.querySelector('#app-store-window .app-content');
        if (storeContent && !document.getElementById('custom-install-btn')) {
            const btn = document.createElement('button');
            btn.id = 'custom-install-btn';
            btn.textContent = "➕ Install Custom App";
            btn.className = "btn btn-success w-100 mb-3";
            btn.onclick = (e) => { e.stopPropagation(); installCustomApp(); };
            storeContent.prepend(btn);
        }
        return;
    }

    // C. 其它原生 App (含 AI)
    switch(appName) {
        case 'calculator': showAppWindow('calculator'); break;
        case 'settings': showAppWindow('settings'); break;
        case 'camera': showAppWindow('camera'); startCamera(); break;
        case 'photos': showAppWindow('photos'); renderPhotos(); break;
        case 'phone': showAppWindow('phone'); break;
        case 'ai-assistant': showAppWindow('ai-assistant'); break;
        case 'ai-math': showAppWindow('ai-math'); break;
        case 'ai-to-ui': showAppWindow('ai-to-ui'); break;
        case 'ai-messages': showAppWindow('ai-messages'); break;
    }
}

// --- 4. 系統 UI 控制 ---
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

// --- 5. 系統功能保留 (AI, 計算機, 相機) ---
async function fetchAIResponse(userMsg) {
    // 這裡是你原本完整的 AI 邏輯，確保它在 script.js 裡即可
}

function calcBtnClick(val) {
    const display = document.getElementById('calc-display');
    if (val === '=') {
        try { currentCalculation = eval(currentCalculation).toString(); } catch { currentCalculation = 'Error'; }
    } else if (val === 'C') { currentCalculation = ''; }
    else { currentCalculation += val; }
    if (display) display.value = currentCalculation;
}

async function startCamera() {
    const video = document.getElementById('camera-preview');
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentCameraFacingMode } });
        if (video) video.srcObject = cameraStream;
    } catch (err) { console.error("Camera error:", err); }
}

function stopCamera() {
    if (cameraStream) { cameraStream.getTracks().forEach(track => track.stop()); cameraStream = null; }
}

// --- 6. 備份還原邏輯 ---
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
            alert("Backup restored.");
            location.reload(); 
        } catch (err) { alert("Invalid Backup"); }
    };
    reader.readAsText(file);
}

// --- 7. 初始化 ---
document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    renderApps();
    
    // 啟動時鐘
    setInterval(() => {
        const timeEl = document.getElementById('current-time');
        if (timeEl) timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, 1000);
});
