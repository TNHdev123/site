(function() {
    console.log("[NaturalBoard] Perfecting Layout & Glassmorphism...");

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

    // 1. 注入 CSS (優化間距與毛玻璃)
    const style = document.createElement('style');
    style.innerHTML = `
        /* 隱藏原生組件 */
        .clock-display { display: none !important; }
        #appsGrid > .app-icon { display: none !important; }

        /* 新小工具區域：毛玻璃效果 */
        #nb-widget-area {
            width: calc(100% - 32px);
            margin: calc(env(safe-area-inset-top) + 20px) 16px 10px 16px;
            padding: 20px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            border-radius: 24px;
            /* 毛玻璃效果核心 */
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            z-index: 100;
        }
        #nb-widget-time { 
            font-size: 44px; 
            font-weight: 200; 
            line-height: 1;
            margin-bottom: 8px;
            letter-spacing: -1px;
        }
        #nb-widget-date { 
            font-size: 15px; 
            font-weight: 400; 
            opacity: 0.8;
            text-align: center;
            padding: 0 10px;
        }

        /* 主網格：確保在小工具下方，不重疊 */
        #natural-grid {
            display: grid; 
            grid-template-columns: repeat(4, 1fr);
            gap: 20px; 
            padding: 10px 20px 40px 20px; 
            width: 100%; 
            box-sizing: border-box;
            /* 避開導覽列底部 */
            margin-bottom: env(safe-area-inset-bottom, 20px);
        }
        
        .nb-app-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.1s; }
        .nb-app-item:active { transform: scale(0.9); }
        .nb-icon-box {
            width: 60px; height: 60px; border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            background-color: #333; font-size: 30px; color: white;
        }
        .nb-icon-box img { width: 100%; height: 100%; object-fit: cover; }
        .nb-app-label {
            margin-top: 8px; font-size: 11px; color: white; text-align: center;
            width: 72px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        }

        /* 設定介面 */
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

    // 2. 數據同步 (保持原有優點)
    function getStore() {
        let store = localStorage.getItem(STORAGE_KEY);
        let data = store ? JSON.parse(store) : { apps: [], weather: { location: "New York" } };
        const installed = JSON.parse(localStorage.getItem('installedApps') || '[]');
        let currentApps = data.apps;
        let changed = false;

        Object.keys(SYSTEM_DEFAULTS).forEach(id => {
            let existing = currentApps.find(a => a.id === id);
            if (!existing) { currentApps.push({ id, ...SYSTEM_DEFAULTS[id], isSystem: true }); changed = true; }
            else if (existing.name !== SYSTEM_DEFAULTS[id].name) { existing.name = SYSTEM_DEFAULTS[id].name; changed = true; }
        });

        installed.forEach(instApp => {
            if (!currentApps.find(a => a.id === instApp.id)) { currentApps.push(instApp); changed = true; }
        });

        data.apps = currentApps.filter(app => {
            if (SYSTEM_DEFAULTS[app.id]) return true;
            return installed.find(i => i.id === app.id);
        });

        if (changed || !store) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
    }

    // 3. 自定義小工具邏輯
    let isWeatherMode = false;
    let widgetTimer = null;

    function startWidget() {
        if (widgetTimer) clearInterval(widgetTimer);
        widgetTimer = setInterval(updateWidgetDisplay, 1000);
        updateWidgetDisplay();
    }

    function updateWidgetDisplay() {
        if (isWeatherMode) return;
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        
        const timeEl = document.getElementById('nb-widget-time');
        const dateEl = document.getElementById('nb-widget-date');
        if (timeEl) timeEl.innerText = timeStr;
        if (dateEl) dateEl.innerText = dateStr;
    }

    async function toggleWidget() {
        const data = getStore();
        const timeEl = document.getElementById('nb-widget-time');
        const dateEl = document.getElementById('nb-widget-date');

        if (!isWeatherMode) {
            isWeatherMode = true;
            timeEl.innerText = "Loading...";
            try {
                const response = await fetch(`https://wttr.in/${encodeURIComponent(data.weather.location)}?format=%t|%l`);
                const text = await response.text();
                if (text.includes('|') && isWeatherMode) {
                    const [temp, location] = text.split('|');
                    timeEl.innerText = temp.trim();
                    dateEl.innerText = location.trim();
                }
            } catch (e) { timeEl.innerText = "Offline"; }
        } else {
            isWeatherMode = false;
            updateWidgetDisplay();
        }
    }

    // 4. 渲染
    function render() {
        const os = document.getElementById('mobile-os');
        const grid = document.getElementById('appsGrid');
        if (!os || !grid) return;

        // 插入小工具
        let widgetArea = document.getElementById('nb-widget-area');
        if (!widgetArea) {
            widgetArea = document.createElement('div');
            widgetArea.id = 'nb-widget-area';
            widgetArea.innerHTML = `<div id="nb-widget-time"></div><div id="nb-widget-date"></div>`;
            widgetArea.onclick = toggleWidget;
            os.insertBefore(widgetArea, os.firstChild);
            startWidget();
        }

        // 插入網格
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
            
            const isNi = app.id === 'ni-core-system';
            const sys = SYSTEM_DEFAULTS[app.id];

            let iconContent = '';
            if (isNi) iconContent = `<span>📂</span>`;
            else if (app.icon && app.icon.startsWith('http')) {
                iconContent = `<img src="${app.icon}" onerror="this.style.display='none'; this.nextSibling.style.display='flex';">`;
                iconContent += `<span style="display:none; font-weight:900;">${app.name[0].toUpperCase()}</span>`;
            } else {
                iconContent = `<span style="font-weight:900;">${sys ? sys.icon : app.name[0].toUpperCase()}</span>`;
            }

            const bgColor = isNi ? '#2c3e50' : (app.iconColor || (sys ? sys.color : '#333'));

            item.innerHTML = `<div class="nb-icon-box" style="background-color: ${bgColor}">${iconContent}</div>
                              <div class="nb-app-label">${app.name}</div>`;
            
            item.onclick = () => {
                if (isNi) {
                    if (typeof window.openNiManager === 'function') window.openNiManager();
                    else if (typeof openApp === 'function') openApp('ni-core-system');
                } else if (app.type === 'website' && app.url) window.location.href = app.url;
                else if (typeof openApp === 'function') openApp(app.id);
            };
            nGrid.appendChild(item);
        });

        const nbBtn = document.createElement('div');
        nbBtn.className = 'nb-app-item';
        nbBtn.innerHTML = `<div class="nb-icon-box" style="background:linear-gradient(135deg, #FF5E62, #FF9966)">🛠️</div>
                          <div class="nb-app-label">NBoard</div>`;
        nbBtn.onclick = openSettings;
        nGrid.appendChild(nbBtn);
    }

    // 5. 設定介面 (略，同上一版)
    function openSettings() {
        let ui = document.getElementById('nb-settings-ui');
        if (!ui) { ui = document.createElement('div'); ui.id = 'nb-settings-ui'; document.body.appendChild(ui); }
        ui.style.display = 'flex';
        const data = getStore();

        ui.innerHTML = `
            <div class="nb-ui-header">
                <span style="font-size:22px; font-weight:800;">NaturalBoard</span>
                <span onclick="document.getElementById('nb-settings-ui').style.display='none'" style="color:#007AFF; font-weight:600; cursor:pointer;">Done</span>
            </div>
            <div class="nb-ui-body">
                <h3 style="margin-bottom:10px;">Weather Location</h3>
                <input type="text" class="nb-search-bar" placeholder="Search Global City..." id="nbCitySearch">
                <div id="cityResults" style="margin-bottom:20px;"></div>
                <h3 style="margin-bottom:10px;">App Order</h3>
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
                             <span style="flex:1; font-weight:500;">${app.name}</span>
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
                const div = document.createElement('div'); div.className = 'nb-city-item'; div.innerText = c;
                div.onclick = () => { data.weather.location = c; localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); isWeatherMode = false; openSettings(); };
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
