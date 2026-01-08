(function() {
    console.log("[TweakBooster] Optimization Engine Active");

    // 1. Force Immediate Tweak Execution 
    // This part ensures that tweaks in the queue don't wait for the window.onload event
    const boostTweaks = async () => {
        const active = JSON.parse(localStorage.getItem('ni_active_tweaks') || '[]');
        const installed = JSON.parse(localStorage.getItem('ni_installed_tweaks') || '[]');
        
        installed.forEach(async (tweak) => {
            // Avoid double-loading TweakBooster itself
            if (active.includes(tweak.id) && tweak.id !== 'tweak-booster-01') {
                try {
                    const r = await fetch(tweak.url + '?boost=' + Date.now());
                    const code = await r.text();
                    // Using a more efficient execution method than eval where possible
                    const script = document.createElement('script');
                    script.textContent = code;
                    document.head.appendChild(script);
                    console.log("[Booster] Instantly Launched: " + tweak.name);
                } catch(e) { 
                    console.error("[Booster] Failed to launch: " + tweak.name); 
                }
            }
        });
    };

    // 2. High-Frequency DOM Observer
    // Instead of waiting for a slow interval, we use MutationObserver to catch the system UI 
    // the moment it is added to the document.
    const observer = new MutationObserver((mutations) => {
        if (document.getElementById('appsGrid') || document.querySelector('.desktop')) {
            console.log("[Booster] System UI Detected. Initializing environment...");
            boostTweaks();
            observer.disconnect(); // Stop observing once loaded to save battery/CPU
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // 3. UI Status Indicator (Optional - visible in console)
    window.NI_BOOSTED = true;
})();
