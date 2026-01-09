(function() {
    console.log("[WallLoad] Exploit Module Initialized.");

    // 1. 建立 WallLoad 專屬測試面板
    const wallLoadUI = document.createElement('div');
    wallLoadUI.id = 'wallload-debug-panel';
    wallLoadUI.innerHTML = `
        <div style="font-family: 'SF Mono', monospace; font-size: 11px; color: #ff3b30; font-weight: bold;">
            [WallLoad] VULN_INJECTOR ACTIVE
        </div>
        <div style="margin-top: 5px;">
            <input type="text" id="wl-input" placeholder="Image URL / Asset Path" 
                   style="width: 140px; background: #1a1a1a; color: #fff; border: 1px solid #444; border-radius: 4px; padding: 4px; font-size: 10px;">
            <button id="wl-inject-btn" style="background: #ff3b30; color: #fff; border: none; border-radius: 4px; padding: 4px 8px; margin-left: 4px; cursor: pointer; font-size: 10px; font-weight: bold;">LOAD</button>
        </div>
        <div id="wl-status" style="font-size: 9px; color: #888; margin-top: 4px;">Waiting for payload...</div>
    `;
    
    // 面板樣式：固定喺畫面邊緣，方便調試
    Object.assign(wallLoadUI.style, {
        position: 'fixed',
        top: '150px',
        right: '10px',
        width: '210px',
        padding: '12px',
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        webkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        zIndex: '20000',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        pointerEvents: 'auto'
    });

    // 2. 漏洞注入邏輯
    function triggerWallLoad(url) {
        const status = document.getElementById('wl-status');
        status.innerText = "[...] Attempting Buffer Injection...";
        status.style.color = "#ff9500";

        // 模擬繞過系統限制，強制修改 mobile-os 背景
        const target = document.getElementById('mobile-os');
        if (target) {
            setTimeout(() => {
                target.style.backgroundImage = `url('${url}')`;
                target.style.backgroundSize = 'cover';
                target.style.backgroundPosition = 'center';
                
                // 模擬持久化寫入漏洞緩存
                localStorage.setItem('wallload_exploit_data', url);
                
                status.innerText = "[OK] Wallpaper Overridden via WallLoad";
                status.style.color = "#4cd964";
                
                // 注入成功後嘅視覺反饋
                target.style.transition = "opacity 0.5s";
                target.style.opacity = "0.8";
                setTimeout(() => target.style.opacity = "1", 500);
            }, 800);
        } else {
            status.innerText = "[ERR] System UI (mobile-os) not found";
            status.style.color = "#ff3b30";
        }
    }

    // 3. 事件綁定
    document.body.appendChild(wallLoadUI);
    
    document.getElementById('wl-inject-btn').onclick = () => {
        const url = document.getElementById('wl-input').value;
        if (url) triggerWallLoad(url);
    };

    // 檢查是否有先前透過 WallLoad 注入嘅設定
    const savedPayload = localStorage.getItem('wallload_exploit_data');
    if (savedPayload) {
        console.log("[WallLoad] Persistent payload detected. Executing...");
        setTimeout(() => triggerWallLoad(savedPayload), 1000);
    }

})();
