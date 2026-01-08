(function() {
    console.log("[NaturalBoard] Booting (Standalone Storage)...");

    // --- Configuration & Data ---
    const STORAGE_KEY = 'NBoardStorage';
    
    // 系統原生 App 定義 (用於初次初始化及圖標修復)
    const SYSTEM_DEFAULTS = {
        'ni-core-system': { name: 'NI Manager', icon: '📂', color: '#2c3e50', type: 'system' },
        'settings': { name: 'Settings', icon: '⚙️', color: '#8E8E93', type: 'system' },
        'camera': { name: 'Camera', icon: '📷', color: '#4A4A4A', type: 'system' },
        'photos': { name: 'Photos', icon: '🖼️', color: '#FF2D55', type: 'system' },
        'app-store': { name: 'App Store', icon: '🛍️', color: '#007AFF', type: 'system' },
        'phone': { name: 'Phone', icon: '📞', color: '#4CD964', type: 'system' },
        'ai-messages': { name: 'Messages', icon: '💬', color: '#4CD964', type: 'system' },
        'calculator': { name: 'Calculator', icon: '🔢', color: '#FF9500', type: 'system' },
        'ai-assistant': { name: 'Assistant', icon: '🤖', color: '#000', type: 'system' },
        'terminal': { name: 'Terminal', icon: '💻', color: '#2C3E50', type: 'system' },
        'cydia2': { name: 'Cydia', icon: '📦', color: '#9B59B6', type: 'system' },
        'safari': { name: 'Safari', icon: '🧭', color: '#007AFF', type: 'system' },
        'mail': { name: 'Mail', icon: '✉️', color: '#5ac8fa', type: 'system' }
    };

    // 主要城市清單 (用於天氣搜尋)
    const CITIES = [
        "New York, USA", "London, UK", "Tokyo, Japan", "Hong Kong", "Taipei, Taiwan",
        "Paris, France", "Berlin, Germany", "Sydney, Australia", "Toronto, Canada",
        "Beijing, China", "Shanghai, China", "Singapore", "Seoul, South Korea",
        "Bangkok, Thailand", "Dubai, UAE", "Moscow, Russia", "Los Angeles, USA",
        "San Francisco, USA", "Chicago, USA", "Vancouver, Canada", "Rome, Italy",
        "Madrid, Spain", "Amsterdam, Netherlands", "Zurich, Switzerland"
    ];

    // --- 1. CSS Injection ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* 隱藏原生 Grid */
        #appsGrid > .app-icon { display: none !important; }
        
        /* Natural Grid 容器 */
        #natural-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 20px;
            width: 100%;
            box-sizing: border-box;
            padding-bottom: 100px; /* 預留底部空間 */
        }

        /* App Item */
        .nb-app-item {
            display: flex; flex-direction: column; align-items: center; cursor: pointer;
            position: relative;
        }
        .nb-app-item:active { transform: scale(0.95); transition: 0.1s; }

        .nb-icon-box {
            width: 60px; height: 60px; border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            background-color: #333; font-size: 28px;
            position: relative;
        }
        .nb-icon-box img { width: 100%; height: 100%; object-fit: cover; }
        
        .nb-app-label {
            margin-top: 8px; font-size: 11px; color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            width: 70px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* Settings Modal */
        #nb-settings-modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 99999;
            backdrop-filter: blur(10px); display: none;
            flex-direction: column; animation: slideUp 0.3s ease;
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .nb-modal-header {
            padding: 20px; display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .nb-modal-title { color: white; font-size: 18px; font-weight: bold; }
        .nb-close-btn { color: #007AFF; font-size: 16px; cursor: pointer; }

        .nb-modal-body { flex: 1; overflow-y: auto; padding: 20px; }
        
        .nb-section-title { color: #8E8E93; font-size: 13px; margin: 15px 0 10px; text-transform: uppercase; }
        
        /* App List in Settings */
        .nb-sort-item {
            display: flex; align-items: center; padding: 10px;
            background: rgba(255,255,255,0.1); margin-bottom: 8px; border-radius: 10px;
        }
        .nb-sort-name { flex: 1; color: white; margin-left: 10px; }
        .nb-sort-actions button {
            background: none; border: none; color: white; font-size: 16px; cursor: pointer; padding: 5px;
        }
        
        /* Weather Search */
        .nb-search-input {
            width: 100%; padding: 12px; border-radius: 10px; border: none;
            background: rgba(255,255,255,0.2); color: white; font-size: 16px;
            box-sizing: border-box; margin-bottom: 10px;
        }
        .nb-city-list { max-height: 150px; overflow-y: auto; }
        .nb-city-item {
            padding: 10px; color: white; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;
        }
        .nb-city-item:hover { background: rgba(255,255,255,0.1); }
        .nb-selected-city { color: #007AFF; font-weight: bold; margin-top: 5px; }

        .clock-display { cursor: pointer; }
    `;
    document.head.appendChild(style);

    // --- 2. Storage Management ---
    function getStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        
        // 初次初始化：合併系統預設 + 已安裝 App
        const installed = JSON.parse(localStorage.getItem('installedApps') || '[]');
        let initialApps = [];

        // 1. 加入系統 App
        Object.keys(SYSTEM_DEFAULTS).forEach(id => {
            initialApps.push({
                id: id,
                ...SYSTEM_DEFAULTS[id]
            });
        });

        // 2. 加入已安裝的第三方 App (避免重複)
        installed.forEach(app => {
            if (!initialApps.find(a => a.id === app.id)) {
                initialApps.push(app);
            }
        });

        const defaultData = {
            apps: initialApps,
            weather: { location: "Hong Kong", temp: "24°C" } // Default
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return defaultData;
    }

    function saveStorage(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        renderNaturalBoard(); // 儲存後立即刷新介面
    }

    // 同步：檢查是否有新安裝的 App 未在 Storage 中
    function syncApps() {
        let data = getStorage();
        const installed = JSON.parse(localStorage.getItem('installedApps') || '[]');
        let changed = false;

        installed.forEach(app => {
            if (!data.apps.find(a => a.id === app.id)) {
                console.log("[NBoard] New app detected:", app.name);
                // 嘗試修復第三方 App 的圖標顏色
                if (!app.iconColor) app.iconColor = '#333';
                data.apps.push(app);
                changed = true;
            }
        });

        // (可選) 移除已卸載的 App，這裡暫時保留以防誤刪
        
        if (changed) saveStorage(data);
    }

    // --- 3. Rendering Logic ---
    function renderNaturalBoard() {
        const appsGrid = document.getElementById('appsGrid');
        if (!appsGrid) return;

        let naturalGrid = document.getElementById('natural-grid');
        if (!naturalGrid) {
            naturalGrid = document.createElement('div');
            naturalGrid.id = 'natural-grid';
            appsGrid.parentNode.insertBefore(naturalGrid, appsGrid);
        }
        naturalGrid.innerHTML = '';

        const data = getStorage();
        
        // 渲染 Storage 內的 App
        data.apps.forEach(app => {
            if (app.hidden) return; // 支援隱藏功能

            const item = document.createElement('div');
            item.className = 'nb-app-item';
            
            // 圖標處理邏輯
            let iconHtml = '';
            let isUrlIcon = app.icon && (app.icon.startsWith('http') || app.icon.startsWith('data:'));
            
            // 特殊處理 NI Manager 顯示
            if (app.id === 'ni-core-system') {
                iconHtml = `<span>📂</span>`;
            } else if (isUrlIcon) {
                // 圖片 + Fallback 機制
                iconHtml = `<img src="${app.icon}" onerror="this.style.display='none'; this.nextSibling.style.display='flex';">`;
                iconHtml += `<span style="display:none">${app.fallbackIcon || app.name[0] || '📱'}</span>`;
            } else {
                // 純文字/Emoji
                iconHtml = `<span>${app.fallbackIcon || app.icon || '📱'}</span>`;
            }

            const bg = app.iconColor || (SYSTEM_DEFAULTS[app.id] ? SYSTEM_DEFAULTS[app.id].color : '#333');

            item.innerHTML = `
                <div class="nb-icon-box" style="background-color: ${bg}">
                    ${iconHtml}
                </div>
                <div class="nb-app-label">${app.name}</div>
            `;

            item.onclick = () => {
                if (app.id === 'ni-core-system') {
                    if (window.openNiManager) window.openNiManager();
                    else if (typeof openApp === 'function') openApp('ni-core-system');
                } else if (app.type === 'website' && app.url) {
                    window.location.href = app.url;
                } else if (typeof openApp === 'function') {
                    openApp(app.id);
                }
            };

            naturalGrid.appendChild(item);
        });

        // 最後加入 "NBoard Settings" 圖標
        const settingsItem = document.createElement('div');
        settingsItem.className = 'nb-app-item';
        settingsItem.innerHTML = `
            <div class="nb-icon-box" style="background: linear-gradient(135deg, #FF2D55, #FF9500);">
                <span>🛠️</span>
            </div>
            <div class="nb-app-label">NBoard</div>
        `;
        settingsItem.onclick = openSettingsModal;
        naturalGrid.appendChild(settingsItem);

        // 更新天氣 Header
        updateWeatherWidget(data.weather);
    }

    // --- 4. Weather Logic ---
    function updateWeatherWidget(weatherData) {
        const timeEl = document.getElementById('current-time');
        const dateEl = document.getElementById('current-date');
        const clockDisplay = document.querySelector('.clock-display');

        if (!clockDisplay) return;

        // 解除舊事件綁定
        const newClock = clockDisplay.cloneNode(true);
        clockDisplay.parentNode.replaceChild(newClock, clockDisplay);

        let showWeather = false;

        newClock.onclick = () => {
            showWeather = !showWeather;
            const tEl = document.getElementById('current-time');
            const dEl = document.getElementById('current-date');
            
            if (showWeather) {
                // 模擬天氣數據
                // 在真實情況下，這裡可以用 fetch 到天氣 API
                // 為了演示，我們隨機生成一個與城市相關的溫度
                let temp = Math.floor(Math.random() * 15) + 15; // 15-30度
                tEl.innerText = `${temp}°C`;
                dEl.innerText = weatherData.location;
            } else {
                 if (window.updateClock) window.updateClock(); // 回復系統時間
            }
        };
    }

    // --- 5. Settings Modal Logic ---
    function openSettingsModal() {
        let modal = document.getElementById('nb-settings-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'nb-settings-modal';
            document.body.appendChild(modal);
        }

        const data = getStorage();

        modal.innerHTML = `
            <div class="nb-modal-header">
                <div class="nb-modal-title">NBoard Settings</div>
                <div class="nb-close-btn" id="nb-close-settings">Done</div>
            </div>
            <div class="nb-modal-body">
                <div class="nb-section-title">Weather Location</div>
                <input type="text" class="nb-search-input" id="nb-city-search" placeholder="Search City (e.g. London)...">
                <div class="nb-selected-city">Current: ${data.weather.location}</div>
                <div class="nb-city-list" id="nb-city-results"></div>

                <div class="nb-section-title">Icon Layout</div>
                <div id="nb-sort-list"></div>
            </div>
        `;

        modal.style.display = 'flex';

        // Bind Close
        document.getElementById('nb-close-settings').onclick = () => {
            modal.style.display = 'none';
            renderNaturalBoard();
        };

        // Render Sort List
        const listContainer = document.getElementById('nb-sort-list');
        renderSortList(listContainer, data);

        // Bind Search
        const searchInput = document.getElementById('nb-city-search');
        searchInput.oninput = (e) => filterCities(e.target.value);
    }

    function renderSortList(container, data) {
        container.innerHTML = '';
        data.apps.forEach((app, index) => {
            const row = document.createElement('div');
            row.className = 'nb-sort-item';
            row.innerHTML = `
                <span style="font-size:20px">${app.fallbackIcon || app.icon || '📱'}</span>
                <span class="nb-sort-name">${app.name}</span>
                <div class="nb-sort-actions">
                    <button class="up-btn">⬆️</button>
                    <button class="down-btn">⬇️</button>
                </div>
            `;
            
            // Event Listeners for Sorting
            row.querySelector('.up-btn').onclick = () => {
                if (index > 0) {
                    [data.apps[index], data.apps[index-1]] = [data.apps[index-1], data.apps[index]];
                    saveStorage(data);
                    renderSortList(container, data);
                }
            };
            
            row.querySelector('.down-btn').onclick = () => {
                if (index < data.apps.length - 1) {
                    [data.apps[index], data.apps[index+1]] = [data.apps[index+1], data.apps[index]];
                    saveStorage(data);
                    renderSortList(container, data);
                }
            };

            container.appendChild(row);
        });
    }

    function filterCities(query) {
        const resultsContainer = document.getElementById('nb-city-results');
        resultsContainer.innerHTML = '';
        
        if (!query) return;

        const filtered = CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()));
        
        filtered.forEach(city => {
            const div = document.createElement('div');
            div.className = 'nb-city-item';
            div.innerText = city;
            div.onclick = () => {
                let data = getStorage();
                data.weather.location = city;
                saveStorage(data);
                document.querySelector('.nb-selected-city').innerText = `Current: ${city}`;
                resultsContainer.innerHTML = ''; // Clear results
            };
            resultsContainer.appendChild(div);
        });
    }

    // --- 6. Initialization ---
    const init = () => {
        syncApps(); // 首次執行同步

        const observer = new MutationObserver(() => {
            if (document.getElementById('appsGrid') && !document.getElementById('natural-grid')) {
                renderNaturalBoard();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        if (document.getElementById('appsGrid')) renderNaturalBoard();
    };

    init();
})();
