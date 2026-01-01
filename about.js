document.addEventListener('DOMContentLoaded', () => {
    const pItems = Array.from(document.querySelectorAll('.cover-item'));
    const lItems = Array.from(document.querySelectorAll('.cover-item-l'));
    const listItems = Array.from(document.querySelectorAll('.works-list li'));
    
    let currentIndex = 0;

    function updateUI() {
        // 直向更新
        pItems.forEach((item, i) => {
            item.className = 'cover-item';
            if (i === currentIndex) item.classList.add('active');
            else if (i === currentIndex - 1) item.classList.add('prev');
            else if (i === currentIndex + 1) item.classList.add('next');
            else item.classList.add('hidden');
        });

        // 橫向更新
        lItems.forEach((item, i) => {
            item.className = 'cover-item-l';
            if (i === currentIndex) item.classList.add('active');
            else if (i === currentIndex - 1) item.classList.add('prev-l');
            else item.classList.add('hidden');
        });

        listItems.forEach((item, i) => {
            item.className = (i === currentIndex) ? 'active' : '';
        });
    }

    // 事件綁定
    [...pItems, ...lItems, ...listItems].forEach((el, i) => {
        el.addEventListener('click', () => {
            currentIndex = (i % pItems.length);
            updateUI();
        });
    });

    // 滑動支援 (直向)
    let startX = 0;
    document.getElementById('coverFlowPortrait').addEventListener('touchstart', e => startX = e.touches[0].clientX);
    document.getElementById('coverFlowPortrait').addEventListener('touchend', e => {
        let diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0 && currentIndex < pItems.length - 1) currentIndex++;
            else if (diff < 0 && currentIndex > 0) currentIndex--;
            updateUI();
        }
    });

    updateUI();
});
