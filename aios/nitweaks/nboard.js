(function() {
    console.log("[NaturalBoard] Initializing Dual-Widget System...");

    const STORAGE_KEY = 'NBoardStorage';
    
    const SYSTEM_DEFAULTS = {
        'ni-core-system': { name: 'NI Manager', icon: '📂', color: '#2c3e50' },
        'camera': { name: 'Camera', icon: '📷', color: '#4A4A4A' },
        'calculator': { name: 'Calculator', icon: '🔢', color: '#FF9500' },
        'ai-to-ui': { name: 'AI to UI', icon: '🎨', color: '#5856D6' },
        'app-store': { name: 'App Store', icon: '🛍️', color: '#007AFF' },
        'settings': { name: 'Settings', icon: '⚙️', color: '#8E8E93' },
        'phone': { name: 'Phone', icon: '📞', color: '#4CD964' },
        'photos': { name: 'Photos', icon: '🖼️', color: '#FF2D55' },
        'maths-ai': { name: 'Maths AI', icon: '🧠', color: '#FF3B30' },
        'ai-messages': { name: 'AI Messages', icon: '💬', color: '#4CD964' },
        'ai-assistant': { name: 'AI Assistant', icon: '🤖', color: '#000' },
        'terminal': { name: 'Terminal', icon: '💻', color: '#2C3E50' },
        'cydia2': { name: 'Cydia2', icon: '📦', color: '#9B59B6' },
        'aos-switcher': { name: 'AIOS Swither', icon: '🔄', color: '#34495E' }
    };

    const WORLD_CITIES = ["New York", "London", "Tokyo", "Hong Kong", "Taipei", "Paris", "Berlin", "Sydney", "Singapore", "Seoul", "Bangkok", "Dubai", "Toronto"];

    // 1. 注入 CSS (優化小工具切換動畫)
    const style = document.createElement('style');
    style.innerHTML = `
        #appsGrid > .app-icon { display: none !important; }
        #natural-grid {
            display: grid; grid-template-columns: repeat(4, 1fr);
            gap: 20px; padding: 20px; width: 100%; box-sizing: border-box;
        }
        .nb-app-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
        .nb-icon-box {
            width: 60px; height: 60px; border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            background-color: #333; font-size: 30px; color: white;
        }
        .nb-icon-box img { width: 100%; height: 100%; object-fit: cover; }
        .nb-app-label {
            margin-top: 8px; font-size: 11px; color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            width: 72px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* 天氣小工具專屬樣式 */
        #nb-weather-widget {
            display: none; flex-direction: column; align-items: center;
            justify-content: center; width: 100%; cursor: pointer;
            animation: fadeIn 0.3s ease;
        }
        .weather-temp { font-size: 48px; font-weight: 200; color: white; }
        .weather-loc { font-size: 16px; color: rgba(255,255,255,0.8); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        #nb-settings-ui {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 10000;
            display: none; flex-direction: column;
            padding-top: env(safe-area-inset-top, 44px); color: white;
        }
        .nb-ui-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; }
        .nb-ui-body { flex: 1; overflow-y: auto; padding: 20px; }
        .nb-sort-row { display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); margin-bottom: 8px; border-radius: 12px; }
        .nb-row-icon { width: 32px; height: 32px; border-radius: 7px; margin-right: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; overflow: hidden; }
        .nb-search-bar { width: 100%; padding: 12px; border-radius: 10px; border: none; background: #222; color: white; margin-bottom: 15px; }
        .nb-city-item { padding: 12px; border-bottom: 1px solid #222; cursor: pointer; }
    `;
    document.head.appendChild(style);

    // 2. 數據同步檢查
    function getStore() {
        let store = localStorage.getItem(STORAGE_KEY);
        let data = store ? JSON.parse(store) : { apps: [], weather: { location: "New York" } };
        const installed = JSON.parse(localStorage.getItem('installedApps') || '[]');
        let currentApps = data.apps;
        let changed = false;

        Object.keys(SYSTEM_DEFAULTS).forEach(id => {
            let existing = currentApps.find(a => a.id === id);
            if (!existing) {
                currentApps.push({ id, ...SYSTEM_DEFAULTS[id], isSystem: true });
                changed = true;
            } else if (existing.name !== SYSTEM_DEFAULTS[id].name) {
                existing.name = SYSTEM_DEFAULTS[id].name;
                changed = true;
            }
        });

        installed.forEach(instApp => {
            if (!currentApps.find(a => a.id === instApp.id)) {
                currentApps.push(instApp);
                changed = true;
            }
        });

        data.apps = currentApps.filter(app => {
            if (SYSTEM_DEFAULTS[app.id]) return true;
            return installed.find(i => i.id === app.id);
        });

        if (changed || !store) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
    }

    // 3. 實時天氣切換邏輯
    async function updateWeatherData(city) {
        const tempEl = document.querySelector('.weather-temp');
        const locEl = document.querySelector('.weather-loc');
        tempEl.innerText = "--°";
        locEl.innerText = "Loading...";
        try {
            const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%t|%l`);
            const text = await response.text();
            if (text.includes('|')) {
                const [temp, location] = text.split('|');
                tempEl.innerText = temp.trim();
                locEl.innerText = location.trim();
            }
        } catch (e) { locEl.innerText = "Offline"; }
    }

    function initDualWidget(city) {
        const clockWidget = document.querySelector('.clock-display');
        if (!clockWidget) return;

        // 如果天氣小工具未建立，就建立佢
        let weatherWidget = document.getElementById('nb-weather-widget');
        if (!weatherWidget) {
            weatherWidget = document.createElement('div');
            weatherWidget.id = 'nb-weather-widget';
            weatherWidget.innerHTML = `<div class="weather-temp">--°</div><div class="weather-loc">Loading...</div>`;
            clockWidget.parentNode.insertBefore(weatherWidget, clockWidget.nextSibling);
        }

        // 點擊時鐘切換到天氣
        clockWidget.onclick = () => {
            clockWidget.style.display = 'none';
            weatherWidget.style.display = 'flex';
            updateWeatherData(city);
        };

        // 點擊天氣切換返時鐘
        weatherWidget.onclick = () => {
            weatherWidget.style.display = 'none';
            clockWidget.style.display = 'flex';
        };
    }

    // 4. 渲染 Board
    function render() {
        const grid = document.getElementById('appsGrid');
        if (!grid) return;

        let nGrid = document.getElementById('natural-grid');
        if (!nGrid) {
            nGrid = document.createElement('div');
            nGrid.id = 'natural-grid';
            grid.parentNode.insertBefore(nGrid, grid);
        }
        nGrid.innerHTML = '';

        const data = getStore();
        data.apps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'nb-app-item';
            let iconContent = '';
            const sys = SYSTEM_DEFAULTS[app.id];

            if (app.id === 'ni-core-system') iconContent = `<span>📂</span>`;
            else if (app.icon && app.icon.startsWith('http')) {
                iconContent = `<img src="${app.icon}" onerror="this.style.display='none'; this.nextSibling.style.display='flex';">`;
                iconContent += `<span style="display:none; font-weight:900;">${app.name[0].toUpperCase()}</span>`;
            } else {
                iconContent = `<span style="font-weight:900;">${sys ? sys.icon : app.name[0].toUpperCase()}</span>`;
            }

            const bgColor = app.id === 'ni-core-system' ? '#2c3e50' : (app.iconColor || (sys ? sys.color : '#333'));

            item.innerHTML = `<div class="nb-icon-box" style="background-color: ${bgColor}">${iconContent}</div>
                              <div class="nb-app-label">${app.name}</div>`;
            item.onclick = () => (typeof openApp === 'function' ? openApp(app.id) : null);
            nGrid.appendChild(item);
        });

        // Settings Button
        const nbBtn = document.createElement('div');
        nbBtn.className = 'nb-app-item';
        nbBtn.innerHTML = `<div class="nb-icon-box" style="background:linear-gradient(135deg, #FF5E62, #FF9966)">🛠️</div>
                          <div class="nb-app-label">NBoard</div>`;
        nbBtn.onclick = openSettings;
        nGrid.appendChild(nbBtn);

        initDualWidget(data.weather.location);
    }

    // 5. Settings UI
    function openSettings() {
        let ui = document.getElementById('nb-settings-ui');
        if (!ui) {
            ui = document.createElement('div');
            ui.id = 'nb-settings-ui';
            document.body.appendChild(ui);
        }
        ui.style.display = 'flex';
        const data = getStore();

        ui.innerHTML = `
            <div class="nb-ui-header">
                <span style="font-size:22px; font-weight:800;">NaturalBoard</span>
                <span onclick="document.getElementById('nb-settings-ui').style.display='none'" style="color:#007AFF; cursor:pointer;">Done</span>
            </div>
            <div class="nb-ui-body">
                <h3>Weather Location</h3>
                <input type="text" class="nb-search-bar" placeholder="Search Global City..." id="nbCitySearch">
                <div id="cityResults" style="margin-bottom:20px;"></div>
                <h3>App Order</h3>
                <div id="nbSortList"></div>
            </div>
        `;

        const list = document.getElementById('nbSortList');
        data.apps.forEach((app, i) => {
            const row = document.createElement('div');
            row.className = 'nb-sort-row';
            const sys = SYSTEM_DEFAULTS[app.id];
            const bg = app.iconColor || (sys ? sys.color : '#333');
            const iconHtml = (app.icon && app.icon.startsWith('http')) ? `<img src="${app.icon}">` : `<span>${sys ? sys.icon : app.name[0]}</span>`;
            row.innerHTML = `<div class="nb-row-icon" style="background-color:${bg}">${iconHtml}</div>
                             <span style="flex:1">${app.name}</span>
                             <div style="display:flex; gap:12px;">
                                <button onclick="nbMove(${i},-1)" style="background:none; border:none; color:white; font-size:20px;">▲</button>
                                <button onclick="nbMove(${i},1)" style="background:none; border:none; color:white; font-size:20px;">▼</button>
                             </div>`;
            list.appendChild(row);
        });

        document.getElementById('nbCitySearch').oninput = (e) => {
            const res = document.getElementById('cityResults');
            res.innerHTML = '';
            if (!e.target.value) return;
            WORLD_CITIES.filter(c => c.toLowerCase().includes(e.target.value.toLowerCase())).forEach(c => {
                const div = document.createElement('div');
                div.className = 'nb-city-item'; div.innerText = c;
                div.onclick = () => { data.weather.location = c; localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); openSettings(); render(); };
                res.appendChild(div);
            });
        };

        window.nbMove = (i, dir) => {
            if (i+dir >= 0 && i+dir < data.apps.length) {
                [data.apps[i], data.apps[i+dir]] = [data.apps[i+dir], data.apps[i]];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                openSettings(); render();
            }
        };
    }

    const init = () => {
        const obs = new MutationObserver(() => { if (document.getElementById('appsGrid') && !document.getElementById('natural-grid')) render(); });
        obs.observe(document.body, { childList: true, subtree: true });
        render();
    };
    init();
})();
