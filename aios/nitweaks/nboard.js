(function() {
    console.log("[NaturalBoard] Initializing...");

    // 1. 注入樣式：直接使用原版 CSS 類名，確保排佈 100% 一致
    const style = document.createElement('style');
    style.innerHTML = `
        /* 隱藏原生 Grid 內容 */
        #appsGrid > .app-icon {
            display: none !important;
        }

        /* 讓 Natural Grid 繼承原版 .apps-grid 的所有屬性 */
        #natural-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 20px;
            width: 100%;
            box-sizing: border-box;
            /* 確保位置與原版重疊 */
        }

        /* 模仿 index.html 原生 .app-icon 結構 */
        .nb-app-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            cursor: pointer;
            text-align: center;
        }

        .nb-icon-container {
            width: 60px;
            height: 60px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            background-color: #333;
            position: relative;
        }

        .nb-icon-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .nb-fallback-icon {
            font-size: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .nb-app-label {
            margin-top: 8px;
            font-size: 11px;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            width: 72px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;
    document.head.appendChild(style);

    // 2. 渲染函數
    const renderNaturalBoard = () => {
        try {
            const appsGrid = document.getElementById('appsGrid');
            if (!appsGrid) return;

            let naturalGrid = document.getElementById('natural-grid');
            if (!naturalGrid) {
                naturalGrid = document.createElement('div');
                naturalGrid.id = 'natural-grid';
                appsGrid.parentNode.insertBefore(naturalGrid, appsGrid);
            }
            naturalGrid.innerHTML = '';

            const apps = JSON.parse(localStorage.getItem('installedApps') || '[]');

            apps.forEach(app => {
                const item = document.createElement('div');
                item.className = 'nb-app-item';
                
                let iconHtml = '';
                let bgColor = app.iconColor || '#333';
                let isNiManager = (app.id === 'ni-core-system');

                // 處理圖標內容
                if (isNiManager) {
                    // 如果係 Ni 管理器，顯示專屬齒輪圖標，但位置跟返 Array 順序
                    iconHtml = `<div class="nb-fallback-icon" style="background: linear-gradient(135deg, #2c3e50, #000); width:100%; height:100%;">⚙️</div>`;
                } else if (app.icon && (app.icon.startsWith('http') || app.icon.startsWith('data:'))) {
                    // 正常圖片
                    iconHtml = `<img src="${app.icon}" onerror="this.style.display='none'; this.nextSibling.style.display='flex';">`;
                    iconHtml += `<div class="nb-fallback-icon" style="display:none; width:100%; height:100%;">${app.fallbackIcon || '📱'}</div>`;
                } else {
                    // 無圖片連結，顯示 fallback
                    iconHtml = `<div class="nb-fallback-icon" style="width:100%; height:100%;">${app.fallbackIcon || '📱'}</div>`;
                }

                item.innerHTML = `
                    <div class="nb-icon-container" style="background-color: ${bgColor}">
                        ${iconHtml}
                    </div>
                    <div class="nb-app-label">${app.name}</div>
                `;

                // 點擊事件
                item.onclick = () => {
                    if (isNiManager) {
                        if (window.openNiManager) window.openNiManager();
                        else if (typeof openApp === 'function') openApp('ni-core-system');
                    } else if (app.url && app.type === 'website') {
                        window.location.href = app.url;
                    } else if (typeof openApp === 'function') {
                        openApp(app.id);
                    }
                };

                naturalGrid.appendChild(item);
            });
        } catch (e) {
            console.error("[NaturalBoard] Render Error:", e);
        }
    };

    // 3. 監測與啟動
    const init = () => {
        // 使用 MutationObserver 監測，比 setInterval 更穩定，防止 Board 消失
        const observer = new MutationObserver((mutations) => {
            if (document.getElementById('appsGrid') && !document.getElementById('natural-grid')) {
                renderNaturalBoard();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // 初始執行
        if (document.getElementById('appsGrid')) renderNaturalBoard();
    };

    init();
})();
