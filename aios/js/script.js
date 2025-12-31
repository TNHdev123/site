// OpenRouter API Configuration
const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// --- 全局變量修改：優先讀取本地存儲 (包含備份還原的資料) ---
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

// 【關鍵修改】定義預設 App，但如果 localStorage 有資料則以它為主 (還原備份的靈魂)
const defaultApps = [
    { id: "cydia2", name: "Cydia 😭", icon: "cydia2", iconColor: "#f39c12", type: "website", url: "https://tnhdev123.github.io/site/webkitjelbrek/jailbreakme/xd.html" },
    { id: "youtube", name: "YouTube", icon: "https://www.youtube.com/apple-touch-icon.png", iconColor: "#ff0000", type: "website", url: "https://www.youtube.com" },
    { id: "calculator", name: "Calculator", icon: "calculator", iconColor: "#27ae60", type: "system" },
    { id: "settings", name: "Settings", icon: "cog", iconColor: "#7f8c8d", type: "system" },
    { id: "app-store", name: "App Store", icon: "shopping-basket", iconColor: "#3498db", type: "system" }
];

let installedApps = JSON.parse(localStorage.getItem('installedApps')) || defaultApps;

// --- 修正後的渲染函數：動態讀取所有 App ---
function renderApps() {
    const appsGrid = document.getElementById('appsGrid');
    if (!appsGrid) return;
    appsGrid.innerHTML = ''; 

    installedApps.forEach(app => {
        const appDiv = document.createElement('div');
        appDiv.className = 'app-icon';
        
        // 識別圖標類型
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

// --- 修正後的開啟函數：支持第三方 URL ---
function openApp(appId) {
    // 優先檢查是否為第三方自訂 App
    const targetApp = installedApps.find(a => a.id === appId);
    
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

    // 原有系統功能開關
    switch(appId) {
        case 'calculator': showAppWindow('calculator'); break;
        case 'settings': showAppWindow('settings'); break;
        case 'app-store': showAppWindow('app-store'); break;
        case 'camera': showAppWindow('camera'); startCamera(); break;
        case 'phone': showAppWindow('phone'); break;
        case 'photos': showAppWindow('photos'); renderPhotos(); break;
        case 'ai-to-ui': showAppWindow('ai-to-ui'); break;
        case 'ai-math': showAppWindow('ai-math'); break;
        case 'ai-assistant': showAppWindow('ai-assistant'); break;
        case 'ai-messages': showAppWindow('ai-messages'); break;
    }
}

// --- 還原功能的關鍵補充 ---
function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            // 將所有備份數據寫入存儲
            Object.keys(data).forEach(key => {
                localStorage.setItem(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
            });
            
            // 強制更新當前運行的 App 列表
            if (data.installedApps) {
                installedApps = typeof data.installedApps === 'string' ? JSON.parse(data.installedApps) : data.installedApps;
            }

            alert("You finally believe me.😭 - Respringing...");
            location.reload(); // 觸發 Respring
        } catch (err) {
            alert("Backup file is corrupted.");
        }
    };
    reader.readAsText(file);
}

// 初始化調用
document.addEventListener('DOMContentLoaded', () => {
    renderApps();
    // 保持你原本的其他初始化邏輯...
});

/* [其餘原本 script.js 的計算機、API 調用等邏輯請保留在下方] */
