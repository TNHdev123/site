(function() {
    console.log("[NaturalBoard] Initializing Secure Implementation...");

    const STORAGE_KEY = 'NBoardStorage';
    
    // 精確對接系統圖示及原名
    const SYSTEM_DEFAULTS = {
        'ni-core-system': { name: 'NI Manager', icon: '📂', color: '#2c3e50' },
        'settings': { name: 'Settings', icon: '⚙️', color: '#8E8E93' },
        'camera': { name: 'Camera', icon: '📷', color: '#4A4A4A' },
        'photos': { name: 'Photos', icon: '🖼️', color: '#FF2D55' },
        'app-store': { name: 'App Store', icon: '🛍️', color: '#007AFF' },
        'phone': { name: 'Phone', icon: '📞', color: '#4CD964' },
        'ai-messages': { name: 'Messages', icon: '💬', color: '#4CD964' },
        'calculator': { name: 'Calculator', icon: '🔢', color: '#FF9500' },
        'ai-assistant': { name: 'Assistant', icon: '🤖', color: '#000' },
        'terminal': { name: 'Terminal', icon: '💻', color: '#2C3E50' },
        'cydia2': { name: 'Cydia2', icon: '📦', color: '#9B59B6' },
        'maths-ai': { name: 'Math AI', icon: '🧠', color: '#FF3B30' },
        'ai-to-ui': { name: 'AI to UI', icon: '🎨', color: '#5856D6' },
        'aos-switcher': { name: 'Switcher', icon: '🔄', color: '#34495E' }
    };

    const WORLD_CITIES = ["New York", "London", "Tokyo", "Hong Kong", "Taipei", "Paris", "Berlin", "Sydney", "Singapore", "Seoul", "Bangkok", "Dubai", "Zurich", "Toronto"];

    // 1. 注入 CSS
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
        #nb-settings-ui {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 10000;
            display: none; flex-direction: column;
            padding-top: env(safe-area-inset-top, 44px);
            color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .nb-ui-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; }
        .nb-ui-body { flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 40px; }
        .nb-sort-row { display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); margin-bottom: 8px; border-radius: 12px; }
        .nb-row-icon { width: 32px; height: 32px; border-radius: 7px; margin-right: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; overflow: hidden; }
        .nb-row-icon img { width: 100%; height: 100%; object-fit: cover; }
        .nb-search-bar { width: 100%; padding: 12px; border-radius: 10px; border: none; background: #222; color: white; margin-bottom: 15px; }
        .nb-city-item { padding: 12px; border-bottom: 1px solid #222; cursor: pointer; }
        .clock-display { cursor: pointer; transition: transform 0.1s; }
        .clock-display:active { transform: scale(0.95); }
    `;
    document.head.appendChild(style);

    // 2. 數據管理與同步檢查
    function getStore() {
        let store = localStorage.getItem(STORAGE_KEY);
        let data = store ? JSON.parse(store) : { apps: [], weather: { location: "New York" } };

        const installed = JSON.parse(localStorage.getItem('installedApps') || '[]');
        let currentApps = data.apps;
        let changed = false;

        // 初始化或補全系統 App
        Object.keys(SYSTEM_DEFAULTS).forEach(id => {
            if (!currentApps.find(a => a.id === id)) {
                currentApps.push({ id, ...SYSTEM_DEFAULTS[id], isSystem: true });
                changed = true;
            }
        });

        // 檢查新安裝的 App (同步更新)
        installed.forEach(instApp => {
            if (!currentApps.find(a => a.id === instApp.id)) {
                currentApps.push(instApp);
                changed = true;
            }
        });

        // 檢查已刪除的 App (同步刪除，但不影響系統 App)
        data.apps = currentApps.filter(app => {
            if (SYSTEM_DEFAULTS[app.id]) return true;
            const stillInstalled = installed.find(i => i.id === app.id);
            if (!stillInstalled) changed = true;
            return stillInstalled;
        });

        if (changed || !store) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
    }

    // 3. 實時天氣獲取 (wttr.in)
    async function fetchRealWeather(city) {
        try {
            const t = document.getElementById('current-time');
            const d = document.getElementById('current-date');
            t.innerText = "Loading...";
            // 使用 wttr.in 獲取純文字天氣數據 (溫度 + 地點)
            const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%t|%l`);
            const text = await response.text();
            if (text.includes('|')) {
                const [temp, location] = text.split('|');
                t.innerText = temp.trim();
                d.innerText = location.trim();
            }
        } catch (e) {
            document.getElementById('current-time').innerText = "Error";
        }
    }

    // 4. 渲染主畫面
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
            const isNi = app.id === 'ni-core-system';
            const sys = SYSTEM_DEFAULTS[app.id];

            if (isNi) iconContent = `<span>📂</span>`;
            else if (app.icon && app.icon.startsWith('http')) {
                iconContent = `<img src="${app.icon}" onerror="this.style.display='none'; this.nextSibling.style.display='flex';">`;
                iconContent += `<span style="display:none; font-weight:900; font-size:24px;">${app.name[0].toUpperCase()}</span>`;
            } else {
                iconContent = `<span style="font-weight:900; font-size:24px;">${sys ? sys.icon : app.name[0].toUpperCase()}</span>`;
            }

            const bgColor = isNi ? '#2c3e50' : (app.iconColor || (sys ? sys.color : '#333'));

            item.innerHTML = `
                <div class="nb-icon-box" style="background-color: ${bgColor}">
                    ${iconContent}
                </div>
                <div class="nb-app-label">${app.name}</div>
            `;
            item.onclick = () => {
                if (isNi) (window.openNiManager ? window.openNiManager() : openApp(app.id));
                else if (app.type === 'website' && app.url) window.location.href = app.url;
                else if (typeof openApp === 'function') openApp(app.id);
            };
            nGrid.appendChild(item);
        });

        // NBoard入口
        const nbBtn = document.createElement('div');
        nbBtn.className = 'nb-app-item';
        nbBtn.innerHTML = `<div class="nb-icon-box" style="background:linear-gradient(135deg, #FF5E62, #FF9966)">🛠️</div><div class="nb-app-label">NBoard</div>`;
        nbBtn.onclick = openSettings;
        nGrid.appendChild(nbBtn);

        // 初始化天氣點擊
        const clock = document.querySelector('.clock-display');
        if (clock) {
            clock.onclick = () => {
                const t = document.getElementById('current-time');
                if (t.innerText.includes(':')) fetchRealWeather(data.weather.location);
                else if (window.updateClock) window.updateClock();
            };
        }
    }

    // 5. NBoard 設定介面
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
                <span style="font-size:20px; font-weight:800;">NaturalBoard</span>
                <span onclick="document.getElementById('nb-settings-ui').style.display='none'" style="color:#007AFF; font-weight:600; cursor:pointer;">Done</span>
            </div>
            <div class="nb-ui-body">
                <h3 style="margin-bottom:10px;">Weather Location</h3>
                <input type="text" class="nb-search-bar" placeholder="Search Global City..." id="nbCitySearch">
                <div id="cityResults" style="margin-bottom:20px;"></div>
                <h3 style="margin-bottom:10px;">App Layout</h3>
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
            
            row.innerHTML = `
                <div class="nb-row-icon" style="background-color:${bg}">${iconHtml}</div>
                <span style="flex:1; font-weight:500;">${app.name}</span>
                <div style="display:flex; gap:10px;">
                    <button onclick="nbMove(${i},-1)" style="background:none; border:none; color:white; font-size:18px;">▲</button>
                    <button onclick="nbMove(${i},1)" style="background:none; border:none; color:white; font-size:18px;">▼</button>
                </div>
            `;
            list.appendChild(row);
        });

        document.getElementById('nbCitySearch').oninput = (e) => {
            const res = document.getElementById('cityResults');
            res.innerHTML = '';
            if (!e.target.value) return;
            WORLD_CITIES.filter(c => c.toLowerCase().includes(e.target.value.toLowerCase())).forEach(c => {
                const div = document.createElement('div');
                div.className = 'nb-city-item';
                div.innerText = c;
                div.onclick = () => { data.weather.location = c; localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); openSettings(); };
                res.appendChild(div);
            });
        };

        window.nbMove = (i, dir) => {
            if (i+dir >= 0 && i+dir < data.apps.length) {
                [data.apps[i], data.apps[i+dir]] = [data.apps[i+dir], data.apps[i]];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                openSettings();
                render();
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
