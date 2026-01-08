(function() {
    console.log("[NaturalBoard] Initializing Smart Layout...");

    // 1. 注入 CSS：確保排佈與時鐘交互樣式
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
            text-align: center;
        }
        .nb-icon-container {
            width: 60px; height: 60px; border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            background-color: #333; font-size: 30px;
        }
        .nb-icon-container img { width: 100%; height: 100%; object-fit: cover; }
        .nb-app-label {
            margin-top: 8px; font-size: 11px; color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            width: 72px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        /* 時鐘小工具點擊效果 */
        .clock-display { cursor: pointer; transition: opacity 0.2s; }
        .clock-display:active { opacity: 0.7; }
    `;
    document.head.appendChild(style);

    // 2. 核心渲染與系統 App 補完邏輯
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

        // 讀取已安裝 App 並補完缺少的系統 App
        let apps = JSON.parse(localStorage.getItem('installedApps') || '[]');
        const systemApps = [
            { id: 'settings', name: 'Settings', fallback: '⚙️', color: '#8E8E93' },
            { id: 'camera', name: 'Camera', fallback: '📷', color: '#4A4A4A' },
            { id: 'calculator', name: 'Calculator', fallback: '🔢', color: '#FF9500' },
            { id: 'app-store', name: 'App Store', fallback: '🅰️', color: '#007AFF' }
        ];

        systemApps.forEach(sApp => {
            if (!apps.find(a => a.id === sApp.id)) {
                apps.push({
                    id: sApp.id + "-nboard",
                    name: sApp.name,
                    fallbackIcon: sApp.fallback,
                    iconColor: sApp.color,
                    isSystemGenerated: true
                });
            }
        });

        apps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'nb-app-item';
            
            let iconHtml = '';
            let isNi = (app.id === 'ni-core-system');
            
            if (isNi) {
                // 📂 Ni管理器核心顯示
                iconHtml = `<span>📂</span>`;
            } else if (app.icon && app.icon.startsWith('http')) {
                iconHtml = `<img src="${app.icon}" onerror="this.style.display='none'; this.nextSibling.style.display='flex';">`;
                iconHtml += `<span style="display:none;">${app.fallbackIcon || '📱'}</span>`;
            } else {
                iconHtml = `<span>${app.fallbackIcon || '📱'}</span>`;
            }

            item.innerHTML = `
                <div class="nb-icon-container" style="background-color: ${app.iconColor || '#333'}">
                    ${iconHtml}
                </div>
                <div class="nb-app-label">${app.name}</div>
            `;

            item.onclick = () => {
                const targetId = app.id.replace("-nboard", "");
                if (isNi) {
                    if (window.openNiManager) window.openNiManager();
                    else if (typeof openApp === 'function') openApp('ni-core-system');
                } else if (typeof openApp === 'function') {
                    openApp(targetId);
                }
            };
            naturalGrid.appendChild(item);
        });
    };

    // 3. 時鐘小工具切換天氣邏輯
    let showWeather = false;
    const initWidget = () => {
        const clockWidget = document.querySelector('.clock-display');
        if (!clockWidget) return;

        clockWidget.onclick = () => {
            showWeather = !showWeather;
            const timeEl = document.getElementById('current-time');
            const dateEl = document.getElementById('current-date');
            
            if (showWeather) {
                // 模擬獲取天氣資料
                timeEl.innerText = "24°C";
                dateEl.innerText = "Partly Cloudy - Taipei";
            } else {
                // 觸發系統更新時間（或重新讀取）
                if (window.updateClock) window.updateClock(); 
            }
        };
    };

    // 4. 啟動
    const init = () => {
        const observer = new MutationObserver(() => {
            if (document.getElementById('appsGrid') && !document.getElementById('natural-grid')) {
                renderNaturalBoard();
                initWidget();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        if (document.getElementById('appsGrid')) {
            renderNaturalBoard();
            initWidget();
        }
    };

    init();
})();
