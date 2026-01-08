(function() {
    console.log("[NaturalBoard] Fine-tuning System Integration...");

    // 1. 樣式調整：確保小工具與 Board 佈局
    const style = document.createElement('style');
    style.innerHTML = `
        #appsGrid > .app-icon { display: none !important; }
        #natural-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 20px;
            width: 100%;
            box-sizing: border-box;
        }
        .nb-app-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
        }
        .nb-icon-container {
            width: 60px; height: 60px; border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            background-color: #333; font-size: 30px;
        }
        .nb-app-label {
            margin-top: 8px; font-size: 11px; color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            width: 72px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .clock-display { cursor: pointer; }
    `;
    document.head.appendChild(style);

    // 定義精確的系統 App 對照表
    const SYSTEM_MAP = {
        'camera': { name: 'Camera', icon: '📷', color: '#4A4A4A' },
        'calculator': { name: 'Calculator', icon: '🔢', color: '#FF9500' },
        'ai-to-ui': { name: 'AI to UI', icon: '🎨', color: '#5856D6' },
        'app-store': { name: 'App Store', icon: '🛍️', color: '#007AFF' },
        'settings': { name: 'Settings', icon: '⚙️', color: '#8E8E93' },
        'phone': { name: 'Phone', icon: '📞', color: '#4CD964' },
        'photos': { name: 'Photos', icon: '🖼️', color: '#FF2D55' },
        'maths-ai': { name: 'Math AI', icon: '🧠', color: '#FF3B30' },
        'ai-messages': { name: 'Messages', icon: '💬', color: '#4CD964' },
        'ai-assistant': { name: 'Assistant', icon: '🤖', color: '#000' },
        'terminal': { name: 'Terminal', icon: '💻', color: '#2C3E50' },
        'cydia2': { name: 'Cydia', icon: '📦', color: '#9B59B6' },
        'aos-switcher': { name: 'Switcher', icon: '🔄', color: '#34495E' }
    };

    // 2. 核心渲染邏輯
    const renderNaturalBoard = () => {
        const appsGrid = document.getElementById('appsGrid');
        if (!appsGrid) return;

        let naturalGrid = document.getElementById('natural-grid');
        if (!naturalGrid) {
            naturalGrid = document.createElement('div');
            naturalGrid.id = 'natural-grid';
            appsGrid.parentNode.insertBefore(naturalGrid, appsGrid);
        }
        naturalGrid.innerHTML = '';

        // 讀取已安裝列表 (NI 管理器看到的)
        let installed = JSON.parse(localStorage.getItem('installedApps') || '[]');
        
        // 建立一個渲染序列，確保系統 App 如果不在 installed 裡也會被補上
        let renderList = [...installed];
        Object.keys(SYSTEM_MAP).forEach(sysId => {
            if (!renderList.find(a => a.id === sysId || a.id === sysId + "-nboard")) {
                renderList.push({
                    id: sysId + "-nboard",
                    name: SYSTEM_MAP[sysId].name,
                    fallbackIcon: SYSTEM_MAP[sysId].icon,
                    iconColor: SYSTEM_MAP[sysId].color,
                    isSystemGenerated: true
                });
            }
        });

        renderList.forEach(app => {
            const item = document.createElement('div');
            item.className = 'nb-app-item';
            
            let iconHtml = '';
            let isNi = (app.id === 'ni-core-system');
            
            // 處理圖標
            if (isNi) {
                iconHtml = `<span>📂</span>`;
            } else if (app.icon && app.icon.startsWith('http')) {
                iconHtml = `<img src="${app.icon}" onerror="this.style.display='none'; this.nextSibling.style.display='flex';">`;
                iconHtml += `<span>${app.fallbackIcon || '📱'}</span>`;
            } else {
                // 如果是系統補完或沒圖標，從 MAP 搵資料
                const sysData = SYSTEM_MAP[app.id.replace("-nboard", "")];
                iconHtml = `<span>${sysData ? sysData.icon : (app.fallbackIcon || '📱')}</span>`;
            }

            const finalColor = isNi ? '#2c3e50' : (app.iconColor || (SYSTEM_MAP[app.id.replace("-nboard", "")] || {}).color || '#333');

            item.innerHTML = `
                <div class="nb-icon-container" style="background-color: ${finalColor}">
                    ${iconHtml}
                </div>
                <div class="nb-app-label">${app.name}</div>
            `;

            item.onclick = () => {
                const cleanId = app.id.replace("-nboard", "");
                if (isNi) {
                    if (window.openNiManager) window.openNiManager();
                    else if (typeof openApp === 'function') openApp('ni-core-system');
                } else if (typeof openApp === 'function') {
                    openApp(cleanId);
                }
            };
            naturalGrid.appendChild(item);
        });
    };

    // 3. 時鐘小工具：位置與天氣請求
    let isWeatherMode = false;
    const initWeatherWidget = () => {
        const clock = document.querySelector('.clock-display');
        if (!clock) return;

        clock.onclick = () => {
            const timeEl = document.getElementById('current-time');
            const dateEl = document.getElementById('current-date');

            if (!isWeatherMode) {
                if (navigator.geolocation) {
                    timeEl.innerText = "Loading...";
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            isWeatherMode = true;
                            timeEl.innerText = "22°C"; // 這裡之後可以接 API，暫時模擬
                            dateEl.innerText = `Lat: ${pos.coords.latitude.toFixed(2)}, Lon: ${pos.coords.longitude.toFixed(2)}`;
                        },
                        (err) => {
                            timeEl.innerText = "Error";
                            dateEl.innerText = "Location Denied";
                            setTimeout(() => { isWeatherMode = false; }, 2000);
                        }
                    );
                }
            } else {
                isWeatherMode = false;
                // 系統會自動跑原本的 updateClock
            }
        };
    };

    // 4. 啟動與監控
    const init = () => {
        const observer = new MutationObserver(() => {
            if (document.getElementById('appsGrid') && !document.getElementById('natural-grid')) {
                renderNaturalBoard();
                initWeatherWidget();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        if (document.getElementById('appsGrid')) {
            renderNaturalBoard();
            initWeatherWidget();
        }
    };

    init();
})();
