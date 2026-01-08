(function() {
    console.log("[NaturalBoard] Booting Standalone Mode...");

    // 1. 初始化 NBoardStorage
    const initStorage = () => {
        if (!localStorage.getItem('NBoardStorage')) {
            const installed = JSON.parse(localStorage.getItem('installedApps') || '[]');
            const config = {
                order: installed.map(a => a.id),
                weatherCity: "London",
                weatherTemp: "15°C",
                weatherDesc: "Clear"
            };
            localStorage.setItem('NBoardStorage', JSON.stringify(config));
        }
    };
    initStorage();

    const SYSTEM_APPS = {
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
        'aos-switcher': { name: 'Switcher', icon: '🔄', color: '#34495E' },
        'nboard-config': { name: 'NBoard', icon: '🛠️', color: '#1ABC9C' }
    };

    // 2. 注入 CSS (含管理介面樣式)
    const style = document.createElement('style');
    style.innerHTML = `
        #appsGrid > .app-icon { display: none !important; }
        #natural-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 20px; width: 100%; box-sizing: border-box; }
        .nb-app-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
        .nb-icon-container { width: 60px; height: 60px; border-radius: 14px; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2); background-color: #333; font-size: 30px; }
        .nb-app-label { margin-top: 8px; font-size: 11px; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.8); width: 72px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        /* 管理介面 */
        #nboard-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #1a1a1a; z-index: 20000; display: none; flex-direction: column; color: white; font-family: sans-serif; }
        .nb-header { padding: 20px; font-size: 20px; font-weight: bold; border-bottom: 1px solid #333; display: flex; justify-content: space-between; }
        .nb-content { flex: 1; overflow-y: auto; padding: 10px; }
        .nb-list-item { display: flex; align-items: center; padding: 10px; background: #262626; margin-bottom: 5px; border-radius: 8px; }
        .nb-city-search { padding: 10px; background: #333; border: none; color: white; width: 90%; margin: 10px; border-radius: 5px; }
    `;
    document.head.appendChild(style);

    // 3. 渲染主畫面
    const renderBoard = () => {
        const grid = document.getElementById('appsGrid');
        if (!grid) return;
        let nGrid = document.getElementById('natural-grid');
        if (!nGrid) {
            nGrid = document.createElement('div');
            nGrid.id = 'natural-grid';
            grid.parentNode.insertBefore(nGrid, grid);
        }
        nGrid.innerHTML = '';

        const storage = JSON.parse(localStorage.getItem('NBoardStorage'));
        const installed = JSON.parse(localStorage.getItem('installedApps') || '[]');
        
        // 建立完整列表：優先跟隨 NBoardStorage.order，若有新裝 App 則補尾
        let finalIds = [...storage.order];
        installed.forEach(a => { if(!finalIds.includes(a.id)) finalIds.push(a.id); });
        Object.keys(SYSTEM_APPS).forEach(id => { if(!finalIds.includes(id)) finalIds.push(id); });

        finalIds.forEach(id => {
            const appData = installed.find(a => a.id === id) || SYSTEM_APPS[id];
            if (!appData) return;

            const item = document.createElement('div');
            item.className = 'nb-app-item';
            let isNi = (id === 'ni-core-system');
            
            let iconHtml = isNi ? '📂' : (SYSTEM_APPS[id]?.icon || appData.fallbackIcon || '📱');
            let color = isNi ? '#2c3e50' : (SYSTEM_APPS[id]?.color || appData.iconColor || '#444');

            item.innerHTML = `<div class="nb-icon-container" style="background-color: ${color}">${iconHtml}</div><div class="nb-app-label">${appData.name}</div>`;
            
            item.onclick = () => {
                if (id === 'nboard-config') openNBoardConfig();
                else if (isNi && window.openNiManager) window.openNiManager();
                else if (typeof openApp === 'function') openApp(id);
            };
            nGrid.appendChild(item);
        });
    };

    // 4. 管理介面邏輯 (部分展示)
    const openNBoardConfig = () => {
        const overlay = document.createElement('div');
        overlay.id = 'nboard-overlay';
        overlay.style.display = 'flex';
        overlay.innerHTML = `
            <div class="nb-header"><span>NBoard Config</span><span onclick="this.parentElement.parentElement.remove()">✕</span></div>
            <input type="text" class="nb-city-search" placeholder="Search City (e.g. Tokyo, New York)...">
            <div class="nb-content" id="nb-sort-list"></div>
        `;
        document.body.appendChild(overlay);
        // 此處可加入城市列表與排序拖拽邏輯...
    };

    // 5. 天氣切換 (點擊原系統時鐘)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.clock-display')) {
            const storage = JSON.parse(localStorage.getItem('NBoardStorage'));
            const timeEl = document.getElementById('current-time');
            if (timeEl.innerText.includes('°C')) {
                if (window.updateClock) window.updateClock();
            } else {
                timeEl.innerText = `${storage.weatherCity}: ${storage.weatherTemp}`;
            }
        }
    });

    const observer = new MutationObserver(() => {
        if (document.getElementById('appsGrid') && !document.getElementById('natural-grid')) renderBoard();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    renderBoard();
})();
