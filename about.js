document.addEventListener('DOMContentLoaded', () => {
    const items = Array.from(document.querySelectorAll('.cover-item'));
    const container = document.getElementById('coverFlow');
    
    // 預設由第一個作品開始
    let currentIndex = 0; 

    function update() {
        items.forEach((item, i) => {
            item.className = 'cover-item';
            if (i === currentIndex) {
                item.classList.add('active');
            } else if (i === currentIndex - 1) {
                item.classList.add('prev');
            } else if (i === currentIndex + 1) {
                item.classList.add('next');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    // 點擊切換
    items.forEach((item, i) => {
        item.addEventListener('click', () => {
            currentIndex = i;
            update();
        });
    });

    // 滑動偵測
    let startX = 0;
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        let endX = e.changedTouches[0].clientX;
        let diff = startX - endX;

        if (Math.abs(diff) > 40) {
            if (diff > 0 && currentIndex < items.length - 1) {
                currentIndex++;
            } else if (diff < 0 && currentIndex > 0) {
                currentIndex--;
            }
            update();
        }
    });

    // 初始載入顯示第一個
    update();
});
