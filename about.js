// 板面導覽
function navTo(id) {
    document.querySelectorAll('.l-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Front Row 作品選取邏輯
function selFR(idx) {
    const list = document.querySelectorAll('.l-menu-list li');
    const items = document.querySelectorAll('.fr-item');

    // 更新右側選單
    list.forEach((li, i) => li.classList.toggle('active', i === idx));

    // 更新左側 Front Row 動態
    items.forEach((item, i) => {
        item.className = 'fr-item';
        if (i === idx) {
            item.classList.add('active');
        } else if (i === idx + 1) {
            item.classList.add('next');
        } else {
            item.classList.add('hidden');
        }
    });
}

// 初始啟動
document.addEventListener('DOMContentLoaded', () => {
    // 預設選取第一個橫向作品
    selFR(0);
    
    // 直向 Cover Flow 簡易邏輯
    const pCards = document.querySelectorAll('.p-card');
    let pIdx = 0;
    const updateP = () => {
        pCards.forEach((c, i) => {
            c.className = 'p-card';
            if(i === pIdx) c.classList.add('active');
            else if(i === pIdx + 1) c.classList.add('next');
            else c.classList.add('hidden');
        });
    };
    updateP();
});
