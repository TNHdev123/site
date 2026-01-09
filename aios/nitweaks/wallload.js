(function() {
    console.log("[WallLoad] Core Injection: Direct Object Definition Mode.");

    // 1. 建立 WallLoad 調試面板
    const wallLoadUI = document.createElement('div');
    wallLoadUI.id = 'wallload-debug-panel';
    wallLoadUI.innerHTML = `
        <div id="wl-label" style="font-family: monospace; font-weight: bold; margin-bottom: 8px;">WallLoad</div>
        <div>
            <input type="text" id="wl-input" placeholder="Image URL / Base64" 
                   style="width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 5px; font-size: 12px; box-sizing: border-box;">
            <div style="display: flex; gap: 5px; margin-top: 8px;">
                <button id="wl-inject-btn" style="flex: 1; padding: 6px; cursor: pointer;">Force Inject</button>
                <button id="wl-clear-btn" style="flex: 0.5; padding: 6px; cursor: pointer;">Reset</button>
            </div>
        </div>
        <div id="wl-status" style="font-size: 10px; margin-top: 8px; font-family: monospace;">System Idle</div>
    `;
    
    Object.assign(wallLoadUI.style, {
        position: 'fixed', top: '160px', right: '15px', width: '220px', padding: '15px',
        backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', webkitBackdropFilter: 'blur(10px)',
        border: '1px solid #999', borderRadius: '8px', zIndex: '20000', pointerEvents: 'auto', color: '#000'
    });

    // 2. 核心漏洞邏輯：強制製作並鎖定 homeWallpaper
    function performWallLoad(url) {
        const status = document.getElementById('wl-status');
        status.innerText = "Executing Exploit...";

        // --- 策略 A: 寫入 Persistent Storage ---
        localStorage.setItem('homeWallpaper', url);

        // --- 策略 B: 強制建立/替換全域變數 (如果系統依賴全域變數讀取) ---
        window.homeWallpaper = url;

        // --- 策略 C: 強制製作一個擁有最高優先權嘅背景層 ---
        let wlLayer = document.getElementById('wallload-layer');
        if (!wlLayer) {
            wlLayer = document.createElement('div');
            wlLayer.id = 'wallload-layer';
            // 使用 !important 級別嘅 CSS 注入
            wlLayer.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: -9999 !important;
                background-size: cover !important;
                background-position: center !important;
                display: block !important;
                pointer-events: none !important;
            `;
            document.body.appendChild(wlLayer);
        }

        // 執行圖片加載與注入
        const img = new Image();
        img.crossOrigin = "Anonymous"; // 嘗試避開 CORS
        img.onload = function() {
            wlLayer.style.backgroundImage = `url('${url}')`;
            status.innerText = "DONE: homeWallpaper Active";
            console.log("[WallLoad] Success: Key injected and Layer rendered.");
        };
        img.onerror = function() {
            status.innerText = "ERROR: Failed to load asset.";
        };
        img.src = url;
    }

    // 3. 處理事件
    document.body.appendChild(wallLoadUI);
    
    document.getElementById('wl-inject-btn').onclick = () => {
        const url = document.getElementById('wl-input').value;
        if (url) performWallLoad(url);
    };

    document.getElementById('wl-clear-btn').onclick = () => {
        localStorage.removeItem('homeWallpaper');
        delete window.homeWallpaper;
        const layer = document.getElementById('wallload-layer');
        if (layer) layer.remove();
        document.getElementById('wl-status').innerText = "System Reset.";
    };

    // 自動加載 (持久化測試)
    const saved = localStorage.getItem('homeWallpaper');
    if (saved) {
        setTimeout(() => performWallLoad(saved), 500);
    }

})();
