// NI Tweak: App Lock Passcode Sync
(function() {
    // 覆寫全局嘅 checkAppLockPasscode 函數
    window.checkAppLockPasscode = function(appName) {
        const inputEl = document.getElementById('appLockPasscodeInput');
        const errorEl = document.getElementById('appLockError');
        
        if (!inputEl || !errorEl) return;
        
        const inputPass = inputEl.value;
        // 核心：強制讀取裝置密碼，完全無視原本嘅 userPasscode
        const devicePass = localStorage.getItem('devicePasscode') || '';

        if (inputPass === devicePass) {
            // 密碼正確，移除彈窗
            const popup = document.getElementById('appLockPasscodePopup');
            if (popup) popup.remove();
            
            // Tweak Trick: 暫時熄咗個鎖，正常開 App，然後瞬間鎖返
            const lockKey = 'appLock_' + appName;
            const originalLockState = localStorage.getItem(lockKey);
            
            localStorage.setItem(lockKey, 'false'); // 臨時解鎖
            window.openApp(appName);                // 觸發原生開啟邏輯
            
            // 瞬間還原鎖定狀態
            if (originalLockState) {
                localStorage.setItem(lockKey, originalLockState);
            } else {
                localStorage.removeItem(lockKey);
            }
        } else {
            // 密碼錯
            errorEl.textContent = 'Incorrect Passcode';
            inputEl.style.border = '1px solid red';
            setTimeout(() => {
                const passcodeInput = document.getElementById('appLockPasscodeInput');
                if (passcodeInput) {
                    errorEl.textContent = '';
                    passcodeInput.style.border = '1px solid #ccc';
                }
            }, 2000);
        }
    };

    console.log("%c[NI Tweak] App Lock logic hijacked & synced to Device Passcode", "color: #30d158;");
})();
