document.addEventListener('DOMContentLoaded', () => {
    // 元素選取
    const items = Array.from(document.querySelectorAll('.cover-item')); // 直向卡片
    const container = document.getElementById('coverFlow');
    const frOverlay = document.getElementById('front-row-overlay');
    const btnBrowse = document.getElementById('btn-browse-works');
    const btnClose = document.getElementById('btn-close');
    const btnGo = document.getElementById('btn-go');
    const frList = document.getElementById('fr-list');
    const frPreview = document.getElementById('fr-current-preview');
    const frListItems = Array.from(frList.querySelectorAll('li'));

    let currentIndex = 0; // 全局索引，同步直向與橫向

    // ============ 核心同步函數 ============
    function updateState() {
        // 1. 更新直向 Cover Flow
        items.forEach((item, i) => {
            item.className = 'cover-item';
            if (i === currentIndex) item.classList.add('active');
            else if (i === currentIndex - 1) item.classList.add('prev');
            else if (i === currentIndex + 1) item.classList.add('next');
            else item.classList.add('hidden');
        });

        // 2. 更新橫向 Front Row 選單與預覽
        frListItems.forEach((li, i) => {
            if (i === currentIndex) {
                li.classList.add('active');
                // 更新預覽區文字 (實際專案可換成對應圖片)
                frPreview.textContent = items[i].textContent;
            } else {
                li.classList.remove('active');
            }
        });
    }

    // ============ 直向 Cover Flow 互動 ============
    items.forEach((item, i) => {
        item.addEventListener('click', () => {
            currentIndex = i;
            updateState();
        });
    });

    let startX = 0;
    container.addEventListener('touchstart', (e) => startX = e.touches[0].clientX, { passive: true });
    container.addEventListener('touchend', (e) => {
        let diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 30) {
            if (diff > 0 && currentIndex < items.length - 1) currentIndex++;
            else if (diff < 0 && currentIndex > 0) currentIndex--;
            updateState();
        }
    });

    // ============ 橫向 Front Row 互動 ============
    
    // 開啟作品集
    btnBrowse.addEventListener('click', () => {
        frOverlay.classList.add('show');
    });

    // 關閉作品集
    btnClose.addEventListener('click', () => {
        frOverlay.classList.remove('show');
    });

    // 點擊選單項目
    frListItems.forEach((li) => {
        li.addEventListener('click', function() {
            currentIndex = parseInt(this.getAttribute('data-index'));
            updateState();
        });
    });

    // "前往" 按鈕邏輯 (示範)
    btnGo.addEventListener('click', () => {
        alert(`正在前往：作品 ${currentIndex + 1}`);
        // 實際使用可改為 window.location.href = links[currentIndex];
    });

    // 初始化
    updateState();
});
