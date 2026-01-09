(function() {
    console.log("[WallLoad] Exploit Module Initialized.");

    // 1. 建立 WallLoad 基礎調試面板 (移除版本號與特定風格)
    const wallLoadUI = document.createElement('div');
    wallLoadUI.id = 'wallload-debug-panel';
    wallLoadUI.innerHTML = `
        <div id="wl-label" style="font-family: monospace; font-weight: bold; margin-bottom: 8px;">WallLoad</div>
        <div>
            <input type="text" id="wl-input" placeholder="Image URL" 
                   style="width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 5px; font-size: 12px; box-sizing: border-box;">
            <div style="display: flex; gap: 5px; margin-top: 8px;">
                <button id="wl-inject-btn" style="flex: 1; padding: 6px; cursor: pointer;">Inject</button>
                <button id="wl-clear-btn" style="flex: 0.5; padding: 6px; cursor: pointer;">Clear</button>
            </div>
        </div>
        <div id="wl-status" style="font-size: 10px; margin-top: 8px; font-family: monospace;">Ready</div>
    `;
    
    // 基礎定位與毛玻璃背景 (維持能見度)
    Object.assign(wallLoadUI.style, {
        position: 'fixed', top: '160px', right: '15px', width: '200px', padding: '15px',
        backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', webkitBackdropFilter: 'blur(10px)',
        border: '1px solid #999', borderRadius: '8px', zIndex: '20000', pointerEvents: 'auto',
        color: '#000'
    });

    // 2. 漏洞注入邏輯：直接針對 homeWallpaper Key
    function forceInjectWallpaper(url) {
        const status = document.getElementById('wl-status');
        status.innerText = "Writing to Key...";

        // 核心：直接取代或製作 homeWallpaper 數據
        localStorage.setItem('homeWallpaper', url);

        // 視覺：製作獨立圖層確保注入成功
        let bgLayer = document.getElementById('wallload-injected-layer');
        if (!bgLayer) {
            bgLayer = document.createElement('div');
            bgLayer.id = 'wallload-injected-layer';
            Object.assign(bgLayer.style, {
                position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                zIndex: '-2', backgroundSize: 'cover', backgroundPosition: 'center',
                transition: 'opacity 0.8s'
            });
            document.body.appendChild(bgLayer);
        }

        const img = new Image();
        img.onload = function() {
            bgLayer.style.backgroundImage = `url('${url}')`;
            bgLayer.style.opacity = '1';
            status.innerText = "Key 'homeWallpaper' updated.";
        };
        img.onerror = function() {
            status.innerText = "Error: Invalid Payload.";
        };
        img.src = url;
    }

    // 3. 事件綁定
    document.body.appendChild(wallLoadUI);
    
    document.getElementById('wl-inject-btn').onclick = () => {
        const url = document.getElementById('wl-input').value;
        if (url) forceInjectWallpaper(url);
    };

    document.getElementById('wl-clear-btn').onclick = () => {
        localStorage.removeItem('homeWallpaper');
        const bgLayer = document.getElementById('wallload-injected-layer');
        if (bgLayer) bgLayer.remove();
        document.getElementById('wl-status').innerText = "Key cleared.";
    };

    // 初始化檢查
    const saved = localStorage.getItem('homeWallpaper');
    if (saved) {
        setTimeout(() => forceInjectWallpaper(saved), 500);
    }
})();
