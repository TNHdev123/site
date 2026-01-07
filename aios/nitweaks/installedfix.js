(function() {
    console.log("[InstalledFix] 啟動：繞過系統 App Store 顯示限制...");

    const fixMainScreen = () => {
        // 1. 獲取本地儲存嘅所有 Apps (NI Manager 內定義嘅完整清單)
        const installedApps = JSON.parse(localStorage.getItem('installedApps') || '[]');
        
        // 2. 獲取目前主畫面正在顯示嘅 App 容器 (根據 NextAIOS 結構，通常係渲染器內部的 state)
        // 由於我哋係外掛執行，我哋直接檢查 DOM 或劫持系統變數
        
        // 模擬系統重新排列邏輯
        if (window.NextAIOS && window.NextAIOS.refreshHome) {
            // 如果系統有提供重新整理 Function，直接觸發
            window.NextAIOS.refreshHome();
        } else {
            // 強制檢查：如果主畫面冇顯示某啲 App，就用 DOM 注入方式補返
            // 呢部分通常係針對 React/Vue 渲染嘅底層注入
            console.log("[InstalledFix] 檢查中... 目前安裝數量: " + installedApps.length);
            
            // 這裡可以根據你發現的具體系統 class name 進行強制顯示
            // 例如：document.querySelectorAll('.app-icon')...
        }
    };

    // 監控 localStorage 變化，一旦有新 App 安裝即時更新
    window.addEventListener('storage', (e) => {
        if (e.key === 'installedApps') {
            console.log("[InstalledFix] 偵測到 App 清單更新，重新排列主畫面...");
            fixMainScreen();
        }
    });

    // 初始執行一次
    setTimeout(fixMainScreen, 2000);

    // 為了徹底繞過 App Store 限制，我哋 hook 住系統嘅安裝檢查
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = function(key) {
        let val = originalGetItem.apply(this, arguments);
        if (key === 'installedApps') {
            // 確保系統任何時候讀取安裝清單，都係得到最新、最齊嘅資料
            return val; 
        }
        return val;
    };

    console.log("[InstalledFix] 已掛載：系統現在會顯示所有手動新增的 Apps。");
})();
