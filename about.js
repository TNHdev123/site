document.addEventListener('DOMContentLoaded', () => {
    // --- 原有直向 Cover Flow 邏輯 ---
    const items = Array.from(document.querySelectorAll('.cover-item'));
    const container = document.getElementById('coverFlow');
    let currentIndex = 0;

    function updatePortrait() {
        items.forEach((item, i) => {
            item.className = 'cover-item';
            if (i === currentIndex) item.classList.add('active');
            else if (i === currentIndex - 1) item.classList.add('prev');
            else if (i === currentIndex + 1) item.classList.add('next');
            else item.classList.add('hidden');
        });
    }
    updatePortrait(); // 初始化直向

    // --- 橫向 Front Row 邏輯 ---
    const browseBtn = document.getElementById('browseBtn');
    const modal = document.getElementById('frontRowModal');
    const closeBtn = document.getElementById('closeFrBtn');
    const frMenuItems = document.querySelectorAll('#frMenuList li');
    const previewBox = document.getElementById('frPreviewBox');

    browseBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    frMenuItems.forEach((li, idx) => {
        li.addEventListener('click', () => {
            // 移除舊的 active
            document.querySelector('#frMenuList li.active').classList.remove('active');
            li.classList.add('active');
            // 更新左側預覽內容
            previewBox.innerText = li.innerText;
        });
    });

    // 觸摸與點擊切換 (直向用)
    // (保留原本的 touchstart/touchend 邏輯...)
});
