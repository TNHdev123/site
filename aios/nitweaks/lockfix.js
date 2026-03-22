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
        // 檢查系統有沒有設定密碼
        const correctPass = localStorage.getItem('devicePasscode');
        if (correctPass) {
            // 檢查系統原生的 lockScreen 函數是否存在
            if (typeof window.lockScreen === 'function') {
                // 直接呼叫系統的函數來生成並顯示鎖定畫面
                window.lockScreen();
                console.log("[LockFix] Device passcode detected, system locked on startup.");
            } else {
                console.error("[LockFix] window.lockScreen function not found.");
            }
        }
    };

    // 延遲一點點執行，確保系統的主邏輯已經準備好
    setTimeout(forceLockOnStart, 100);
    // ---------------------------------

    console.log("%c[NI Tweak] TruePasscode Applied (Target: devicePasscode)", "color: #ff9500;");
})();
