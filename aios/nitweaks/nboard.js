(function() {
    console.log("[NaturalBoard] Initializing...");

    // 1. 注入樣式：隱藏原生圖示，優化新 Grid 樣式以貼近原版
    const style = document.createElement('style');
    style.innerHTML = `
        /* 隱藏原生 Grid 內的圖示，但保留容器 */
        #appsGrid > .app-icon {
            display: none !important;
        }

        /* 定義 NaturalBoard 容器，繼承原版 apps-grid 的行為 */
        #natural-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 20px;
            width: 100%;
            box-sizing: border-box;
        }

        /* 模仿原版 .app-icon 的佈局 */
        .nb-app-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transition: transform 0.2s;
            animation: nbFadeIn 0.5s ease;
        }

        .nb-app-wrapper:active {
            transform: scale(0.9);
        }

        /* 圖示主體 */
        .nb-icon-main {
            width: 60px;
            height: 60px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            overflow: hidden;
            background-size: cover;
            background-position: center;
        }

        .nb-icon-main img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* 模仿原版 .app-name */
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

        @keyframes nbFadeIn { 
            from { opacity: 0; transform: scale(0.8); } 
            to { opacity: 1; transform: scale(1); } 
        }
    `;
    document.head.appendChild(style);

    // 2. 渲染函數
    const renderNaturalBoard = () => {
        const appsGrid = document.getElementById('appsGrid');
        if (!appsGrid) return;

        // 清理舊容器
        let naturalGrid = document.getElementById('natural-grid');
        if (naturalGrid) naturalGrid.innerHTML = '';
        else {
            naturalGrid = document.createElement('div');
            naturalGrid.id = 'natural-grid';
            // 插入到原 grid 之前，確保視覺順序
            appsGrid.parentNode.insertBefore(naturalGrid, appsGrid);
        }

        // 獲取已安裝 App
        const apps = JSON.parse(localStorage.getItem('installedApps') || '[]');

        apps.forEach(app => {
            // 過濾掉 Ni管理器核心程式 (ni-core-system)，不顯示其圖標
            if (app.id === 'ni-core-system') return;

            const appWrapper = document.createElement('div');
            appWrapper.className = 'nb-app-wrapper';
            
            // 處理圖標顯示邏輯
            let iconContent = '';
            const hasImage = app.icon && (app.icon.startsWith('http') || app.icon.startsWith('data:'));

            if (hasImage) {
                // 如果有圖片連結，直接顯示圖片
                iconContent = `<img src="${app.icon}" onerror="this.style.display='none'; this.nextSibling.style.display='flex';">`;
            }
            
            // 準備 Fallback Icon (當圖片載入失敗或根本沒有圖片時顯示)
            const bgColor = app.iconColor || '#333';
            const fallback = app.fallbackIcon || '📱';
            const fallbackHtml = `<div class="nb-fallback-content" style="display: ${hasImage ? 'none' : 'flex'};">${fallback}</div>`;

            appWrapper.innerHTML = `
                <div class="nb-icon-main" style="background-color: ${bgColor}">
                    ${iconContent}
                    ${fallbackHtml}
                </div>
                <div class="nb-app-name">${app.name}</div>
            `;

            // 點擊事件
            appWrapper.onclick = () => {
                // 優先檢查是否有自定義 URL，否則嘗試調用原生的 openApp
                if (app.url && app.type === 'website') {
                    window.location.href = app.url;
                } else if (typeof window.openApp === 'function') {
                    window.openApp(app.id);
                } else {
                    console.log("Launching:", app.name);
                }
            };

            naturalGrid.appendChild(appWrapper);
        });
    };

    // 3. 啟動與監測
    const init = () => {
        const check = setInterval(() => {
            if (document.getElementById('appsGrid')) {
                renderNaturalBoard();
                clearInterval(check);
            }
        }, 200);
    };

    init();

    // 暴露刷新接口，方便後續連動
    window.refreshNaturalBoard = renderNaturalBoard;
})();
