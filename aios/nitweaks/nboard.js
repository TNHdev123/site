(function() {
    console.log("[NaturalBoard] Integrating System Apps...");

    // 1. 樣式定義：完全跟隨原版 HTML 的視覺規範
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

        .nb-app-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transition: transform 0.2s;
            animation: nbFadeIn 0.4s ease-out;
        }

        .nb-app-wrapper:active { transform: scale(0.9); }

        .nb-icon-main {
            width: 60px;
            height: 60px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            position: relative;
            background-size: cover;
            background-position: center;
        }

        .nb-icon-main img {
            width: 100%;
            height: 100%;
            border-radius: 14px;
            object-fit: cover;
        }

        .nb-app-name {
            margin-top: 8px;
            font-size: 11px;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            text-align: center;
            width: 72px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        @keyframes nbFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);

    // 2. 定義系統 App 數據庫 (從 HTML/JS 提取)
    const systemApps = [
        { id: 'camera', name: 'Camera', fallbackIcon: '📷', iconColor: 'linear-gradient(135deg, #8e8e93, #48484a)' },
        { id: 'calculator', name: 'Calculator', fallbackIcon: '➗', iconColor: '#ff9500' },
        { id: 'ai-to-ui', name: 'AI to UI', fallbackIcon: '✨', iconColor: 'linear-gradient(135deg, #5856d6, #af52de)' },
        { id: 'app-store', name: 'App Store', fallbackIcon: '🛍️', iconColor: '#007aff' },
        { id: 'settings', name: 'Settings', fallbackIcon: '⚙️', iconColor: '#8e8e93' },
        { id: 'phone', name: 'Phone', fallbackIcon: '📞', iconColor: '#34c759' },
        { id: 'photos', name: 'Photos', fallbackIcon: '🖼️', iconColor: 'linear-gradient(135deg, #fff, #f2f2f7)' },
        { id: 'maths-ai', name: 'Maths AI', fallbackIcon: '🧠', iconColor: '#5856d6' },
        { id: 'ai-messages', name: 'Messages', fallbackIcon: '💬', iconColor: '#34c759' },
        { id: 'ai-assistant', name: 'Assistant', fallbackIcon: '🤖', iconColor: '#000' },
        { id: 'terminal', name: 'Terminal', fallbackIcon: '💻', iconColor: '#2c3e50' },
        { id: 'cydia2', name: 'Cydia 2', fallbackIcon: '📦', iconColor: '#6d4c41' },
        { id: 'aos-switcher', name: 'Switcher', fallbackIcon: '🔄', iconColor: '#546e7a' }
    ];

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

        // 合併已安裝的第三方 Apps
        const installedApps = JSON.parse(localStorage.getItem('installedApps') || '[]');
        
        // 建立一個完整的清單：系統 App 優先，之後跟隨已安裝 App (排除核心 ID)
        const allApps = [...systemApps];
        installedApps.forEach(app => {
            if (app.id !== 'ni-core-system' && !systemApps.find(s => s.id === app.id)) {
                allApps.push(app);
            }
        });

        allApps.forEach(app => {
            const appWrapper = document.createElement('div');
            appWrapper.className = 'nb-app-wrapper';

            // 判斷圖示顯示方式
            let iconStyle = `background: ${app.iconColor || '#333'};`;
            let iconContent = '';

            if (app.icon && (app.icon.startsWith('http') || app.icon.startsWith('data:'))) {
                iconContent = `<img src="${app.icon}">`;
            } else {
                iconContent = `<span>${app.fallbackIcon || '📱'}</span>`;
            }

            appWrapper.innerHTML = `
                <div class="nb-icon-main" style="${iconStyle}">
                    ${iconContent}
                </div>
                <div class="nb-app-name">${app.name}</div>
            `;

            appWrapper.onclick = () => {
                if (typeof window.openApp === 'function') {
                    window.openApp(app.id);
                } else if (app.url) {
                    window.location.href = app.url;
                }
            };

            naturalGrid.appendChild(appWrapper);
        });
    };

    const init = () => {
        const check = setInterval(() => {
            if (document.getElementById('appsGrid')) {
                renderNaturalBoard();
                clearInterval(check);
            }
        }, 200);
    };

    init();
    window.refreshNaturalBoard = renderNaturalBoard;
})();
