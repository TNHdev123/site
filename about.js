// 橫向板面切換
function switchL(viewId) {
    document.querySelectorAll('.l-view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

// Front Row 選取邏輯
function selFR(idx) {
    // 更新選單狀態
    const menuItems = document.querySelectorAll('.l-fr-list li');
    menuItems.forEach((li, i) => li.classList.toggle('active', i === idx));

    // 更新 Front Row 階梯顯示
    const items = document.querySelectorAll('.fr-item');
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
