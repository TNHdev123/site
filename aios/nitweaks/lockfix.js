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

    console.log("%c[NI Tweak] TruePasscode Applied (Target: devicePasscode)", "color: #ff9500;");
})();
