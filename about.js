document.addEventListener('DOMContentLoaded', () => {
    const items = Array.from(document.querySelectorAll('.cover-item'));
    const container = document.getElementById('coverFlow');
    let currentIndex = 2; // 預設中間

    let startX = 0;
    let isMoving = false;

    function update() {
        items.forEach((item, i) => {
            item.className = 'cover-item';
            if (i === currentIndex) item.classList.add('active');
            else if (i === currentIndex - 1) item.classList.add('prev');
            else if (i === currentIndex + 1) item.classList.add('next');
            else item.classList.add('hidden');
        });
    }

    // 點擊切換
    items.forEach((item, i) => {
        item.addEventListener('click', () => {
            currentIndex = i;
            update();
        });
    });

    // 滑動切換邏輯
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isMoving = true;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        if (!isMoving) return;
        let endX = e.changedTouches[0].clientX;
        let diff = startX - endX;

        if (Math.abs(diff) > 40) { // 滑動門檻
            if (diff > 0 && currentIndex < items.length - 1) {
                currentIndex++;
            } else if (diff < 0 && currentIndex > 0) {
                currentIndex--;
            }
            update();
        }
        isMoving = false;
    });

    update();
});
