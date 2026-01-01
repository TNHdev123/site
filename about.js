document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('coverFlow');
    const items = Array.from(container.querySelectorAll('.cover-item'));
    let currentIndex = 1; // 預設中間嗰張

    function updateCoverFlow() {
        items.forEach((item, index) => {
            item.classList.remove('active', 'prev', 'next', 'hidden');

            if (index === currentIndex) {
                item.classList.add('active');
            } else if (index === currentIndex - 1) {
                item.classList.add('prev');
            } else if (index === currentIndex + 1) {
                item.classList.add('next');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    // 點擊卡片切換
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentIndex = index;
            updateCoverFlow();
        });
    });

    // 支援左右滑動 (簡單實作)
    let startX = 0;
    container.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);
    container.addEventListener('touchend', (e) => {
        let endX = e.changedTouches[0].clientX;
        if (startX - endX > 50 && currentIndex < items.length - 1) {
            currentIndex++;
        } else if (endX - startX > 50 && currentIndex > 0) {
            currentIndex--;
        }
        updateCoverFlow();
    });

    // 初始化
    updateCoverFlow();
});
