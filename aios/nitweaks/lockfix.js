// NI Tweak: True Device Passcode Lock
(function() {
    // 1. 備份原生的解鎖函數
    const originalHideLockScreen = window.hideLockScreen;
    
    if (!originalHideLockScreen) {
        console.error("[NI Tweak] Cannot find hideLockScreen function. System structure might have changed.");
        return;
    }

    // 2. 劫持解鎖邏輯
    window.hideLockScreen = function() {
        const correctPass = localStorage.getItem('devicePasscode');
        
        // 如果系統根本未設定密碼，直接放行（符合原廠邏輯）
        if (!correctPass) {
            originalHideLockScreen.apply(this, arguments);
            return;
        }

        // 彈出密碼輸入框
        const userInput = prompt("Enter Device Passcode:");

        if (userInput === correctPass) {
            // 密碼正確，執行原本的解鎖動畫
            originalHideLockScreen.apply(this, arguments);
        } else {
            // 密碼錯誤
            alert("❌ Incorrect Passcode. Access Denied.");
            // 唔做任何嘢，用戶會留喺鎖定畫面
        }
    };
    // --- [新增：啟動強制上鎖邏輯] ---
    const forceLockOnStart = () => {
        // 1. 搵返鎖定畫面同主畫面嘅 HTML 元素
        // 根據你提供嘅 index.html，主畫面 ID 係 homeScreen
        const ls = document.getElementById('lockScreen') || document.getElementById('lock-screen');
        const hs = document.getElementById('homeScreen');

        if (ls && hs) {
            // 2. 強制切換顯示狀態
            ls.style.display = 'flex';  // 顯示鎖定畫面
            hs.style.display = 'none';  // 隱藏主畫面
            console.log("[LockFix] 裝置啟動，已強制返回鎖定狀態");
        }
    };

    // 3. 立即執行一次上鎖動作
    forceLockOnStart();

    console.log("%c[NI Tweak] TruePasscode Applied (Target: devicePasscode)", "color: #ff9500;");
})();
