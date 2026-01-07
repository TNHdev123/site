// NI Tweak: Load Success Tester
(function() {
    console.log("%c[NI Tweak] Test Tweak Initializing...", "color: #30d158; font-weight: bold;");

    const notify = document.createElement('div');
    Object.assign(notify.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(48, 209, 88, 0.9)',
        color: 'black',
        padding: '10px 20px',
        borderRadius: '20px',
        zIndex: '1000001',
        fontFamily: '-apple-system, sans-serif',
        fontSize: '13px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'opacity 0.5s ease'
    });
    notify.innerText = "✅ NI TweakLoader Active";
    document.body.appendChild(notify);

    // 3秒後自動消失
    setTimeout(() => {
        notify.style.opacity = '0';
        setTimeout(() => notify.remove(), 500);
    }, 3000);
})();
