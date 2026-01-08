(function() {
    console.log("[NaturalBoard] Booting...");

    // 1. 注入樣式：隱藏原生圖標，定義新 Grid
    const style = document.createElement('style');
    style.innerHTML = `
        /* 隱藏原生圖標但保留容器結構 */
        #appsGrid > .app-icon:not([data-app="ni-manager"]) {
            display: none !important;
        }

        /* 定義 NaturalBoard 容器 */
        #natural-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 20px;
            width: 100%;
            box-sizing: border-box;
        }

        .nb-icon {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            animation: fadeIn 0.5s ease;
        }

        .nb-icon img, .nb-icon-placeholder {
            width: 60px;
            height: 60px;
            border-radius: 14px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        .nb-text {
            font-size: 11px;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            text-align: center;
            width: 70px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    `;
    document.head.appendChild(style);

    // 2. 渲染函數
    const renderNaturalBoard = () => {
        const appsGrid = document.getElementById('appsGrid');
        if (!appsGrid) return;

        // 移除舊的 nb-grid
        const oldGrid = document.getElementById('natural-grid');
        if (oldGrid) oldGrid.remove();

        const naturalGrid = document.createElement('div');
        naturalGrid.id = 'natural-grid';

        // 獲取已安裝 App
        const apps = JSON.parse(localStorage.getItem('installedApps') || '[]');

        apps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'nb-icon';
            
            // 處理圖標 (支持 Base64 或 URL)
            let iconHtml = `<img src="${app.icon}">`;
            if (app.id === 'ni-core-system') {
                iconHtml = `<div class="nb-icon-placeholder" style="background:linear-gradient(135deg, #2c3e50, #000); display:flex; align-items:center; justify-content:center; font-size:24px;">⚙️</div>`;
            }

            item.innerHTML = `
                ${iconHtml}
                <div class="nb-text">${app.name}</div>
            `;

            // 點擊事件：模擬系統打開 App 邏輯
            item.onclick = () => {
                if (app.url) {
                    window.location.href = app.url;
                } else if (app.id === 'ni-core-system') {
                    if (window.openNiManager) window.openNiManager();
                } else {
                    alert("App Launched: " + app.name);
                }
            };

            naturalGrid.appendChild(item);
        });

        // 插入到原生 Grid 之前
        appsGrid.parentNode.insertBefore(naturalGrid, appsGrid);
    };

    // 3. 啟動監測
    const init = () => {
        const check = setInterval(() => {
            if (document.getElementById('appsGrid')) {
                renderNaturalBoard();
                clearInterval(check);
            }
        }, 200);
    };

    init();
})();
