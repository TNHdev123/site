// 橫向板面跳轉動畫
function navTo(id) {
    document.querySelectorAll('.l-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// 橫向作品選取
function selL(idx) {
    const list = document.querySelectorAll('.l-list li');
    const previews = document.querySelectorAll('.l-preview-box');
    list.forEach((li, i) => li.classList.toggle('active', i === idx));
    previews.forEach((box, i) => box.classList.toggle('active', i === idx));
}

// 直向 Cover Flow 邏輯
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.p-card');
    let cur = 0;

    function update() {
        cards.forEach((c, i) => {
            c.className = 'p-card';
            if (i === cur) c.classList.add('active');
            else if (i === cur - 1) c.classList.add('prev');
            else if (i === cur + 1) c.classList.add('next');
            else c.classList.add('hidden');
        });
    }

    // 滑動支援
    let startX = 0;
    const flow = document.getElementById('pFlow');
    flow.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    flow.addEventListener('touchend', e => {
        let diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && cur < cards.length - 1) cur++;
            else if (diff < 0 && cur > 0) cur--;
            update();
        }
    });

    update();
});
