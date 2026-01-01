function switchPanel(panelId) {
    document.querySelectorAll('.landscape-view').forEach(p => p.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');
}

function selWork(idx) {
    // 更新列表狀態
    const list = document.querySelectorAll('.l-list li');
    list.forEach((li, i) => li.className = (i === idx ? 'active' : ''));
    
    // 更新預覽圖 (簡化邏輯)
    const previews = document.querySelectorAll('.l-preview-box');
    previews.forEach((box, i) => box.classList.toggle('active', i === idx % previews.length));
}

// 處理直向 Cover Flow
document.addEventListener('DOMContentLoaded', () => {
    const pItems = document.querySelectorAll('.cover-item');
    let pIdx = 0;
    function updateP() {
        pItems.forEach((item, i) => {
            item.className = 'cover-item';
            if (i === pIdx) item.classList.add('active');
            else if (i === pIdx-1) item.classList.add('prev');
            else if (i === pIdx+1) item.classList.add('next');
            else item.classList.add('hidden');
        });
    }
    updateP();
    // (可在此加入 Touch 滑動邏輯...)
});
