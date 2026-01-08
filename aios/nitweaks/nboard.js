(function() {
    console.log("[NaturalBoard] Initializing...");

    const STORAGE_KEY = 'NBoardStorage';
    
    // 精確對接系統圖示
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
        'cydia2': { name: 'Cydia', icon: '📦', color: '#9B59B6' },
        'maths-ai': { name: 'Math AI', icon: '🧠', color: '#FF3B30' },
        'ai-to-ui': { name: 'AI to UI', icon: '🎨', color: '#5856D6' },
        'aos-switcher': { name: 'Switcher', icon: '🔄', color: '#34495E' }
    };

    const WORLD_CITIES = ["New York, USA", "London, UK", "Tokyo, Japan", "Hong Kong", "Taipei, Taiwan", "Paris, France", "Berlin, Germany", "Sydney, Australia", "Singapore", "Seoul, South Korea", "Bangkok, Thailand", "Dubai, UAE", "Zurich, Switzerland", "Toronto, Canada"];

    // 1. 注入 CSS (含防遮擋處理)
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
        /* 設定介面佈局 */
        #nb-settings-ui {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 10000;
            display: none; flex-direction: column;
            padding-top: env(safe-area-inset-top, 40px); /* 防狀態列遮擋 */
            color: white; font-family: sans-serif;
        }
        .nb-ui-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; }
        .nb-ui-body { flex: 1; overflow-y: auto; padding: 20px; }
        .nb-sort-row { display: flex; align-items: center; padding: 10px; background: #222; margin-bottom: 5px; border-radius: 8px; }
        .nb-search-bar { width: 100%; padding: 10px; border-radius: 8px; border: none; margin-bottom: 15px; }
        .nb-city-item { padding: 10px; border-bottom: 1px solid #333; }
        .clock-display { cursor: pointer; }
    `;
    document.head.appendChild(style);

    // 2. 數據管理
    function initStorage() {
        let store = localStorage.getItem(STORAGE_KEY);
        if (store) return JSON.parse(store);

        const installed = JSON.parse(localStorage.getItem('installedApps') || '[]');
        let apps = [];
        
        // 合併系統與三方
        Object.keys(SYSTEM_DEFAULTS).forEach(id => {
            apps.push({ id, ...SYSTEM_DEFAULTS[id], isSystem: true });
        });
        installed.forEach(a => {
            if (!apps.find(exist => exist.id === a.id)) apps.push(a);
        });

        const data = { apps, weather: { location: "New York, USA" } };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
    }

    function saveStore(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        render();
    }

    // 3. 渲染主介面
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

        const data = initStorage();
        data.apps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'nb-app-item';
            
            let iconContent = '';
            const isNi = app.id === 'ni-core-system';
            const sys = SYSTEM_DEFAULTS[app.id];

            if (isNi) {
                iconContent = `<span>📂</span>`;
            } else if (app.icon && app.icon.startsWith('http')) {
                // 三方圖標優化渲染
                iconContent = `<img src="${app.icon}" onerror="this.style.display='none'; this.nextSibling.style.display='flex';">`;
                iconContent += `<span style="display:none; font-weight:bold;">${app.name[0].toUpperCase()}</span>`;
            } else {
                // 如果無圖標，用首字母替代 Emoji
                iconContent = `<span style="font-weight:bold;">${sys ? sys.icon : app.name[0].toUpperCase()}</span>`;
            }

            const bgColor = isNi ? '#2c3e50' : (app.iconColor || (sys ? sys.color : '#333'));

            item.innerHTML = `
                <div class="nb-icon-box" style="background-color: ${bgColor}">
                    ${iconContent}
                </div>
                <div class="nb-app-label">${app.name}</div>
            `;
            item.onclick = () => (isNi ? (window.openNiManager ? window.openNiManager() : openApp(app.id)) : openApp(app.id));
            nGrid.appendChild(item);
        });

        // NBoard 圖標
        const nbBtn = document.createElement('div');
        nbBtn.className = 'nb-app-item';
        nbBtn.innerHTML = `<div class="nb-icon-box" style="background:linear-gradient(135deg, #FF5E62, #FF9966)">🛠️</div><div class="nb-app-label">NBoard</div>`;
        nbBtn.onclick = openSettings;
        nGrid.appendChild(nbBtn);

        setupWeather(data.weather.location);
    }

    // 4. 天氣功能
    function setupWeather(loc) {
        const clock = document.querySelector('.clock-display');
        if (!clock) return;
        clock.onclick = () => {
            const t = document.getElementById('current-time');
            const d = document.getElementById('current-date');
            if (t.innerText.includes(':')) {
                t.innerText = "22°C";
                d.innerText = loc;
            } else {
                if (window.updateClock) window.updateClock();
            }
        };
    }

    // 5. 設定介面
    function openSettings() {
        let ui = document.getElementById('nb-settings-ui');
        if (!ui) {
            ui = document.createElement('div');
            ui.id = 'nb-settings-ui';
            document.body.appendChild(ui);
        }
        ui.style.display = 'flex';
        const data = initStorage();

        ui.innerHTML = `
            <div class="nb-ui-header"><b>NBoard Settings</b> <span onclick="document.getElementById('nb-settings-ui').style.display='none'" style="color:#007AFF">Done</span></div>
            <div class="nb-ui-body">
                <p>Weather Location</p>
                <input type="text" class="nb-search-bar" placeholder="Search City..." id="nbCitySearch">
                <div id="cityResults"></div>
                <p>Order Icons</p>
                <div id="nbSortList"></div>
            </div>
        `;

        const list = document.getElementById('nbSortList');
        data.apps.forEach((app, i) => {
            const row = document.createElement('div');
            row.className = 'nb-sort-row';
            row.innerHTML = `<span style="flex:1">${app.name}</span><button onclick="move(${i},-1)">▲</button><button onclick="move(${i},1)">▼</button>`;
            list.appendChild(row);
        });

        document.getElementById('nbCitySearch').oninput = (e) => {
            const res = document.getElementById('cityResults');
            res.innerHTML = '';
            WORLD_CITIES.filter(c => c.toLowerCase().includes(e.target.value.toLowerCase())).forEach(c => {
                const div = document.createElement('div');
                div.className = 'nb-city-item';
                div.innerText = c;
                div.onclick = () => { data.weather.location = c; saveStore(data); openSettings(); };
                res.appendChild(div);
            });
        };

        window.move = (i, dir) => {
            if (i+dir >= 0 && i+dir < data.apps.length) {
                [data.apps[i], data.apps[i+dir]] = [data.apps[i+dir], data.apps[i]];
                saveStore(data); openSettings();
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
