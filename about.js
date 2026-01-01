document.addEventListener('DOMContentLoaded', () => {
    const items = Array.from(document.querySelectorAll('.cover-item'));
    const listItems = document.querySelectorAll('#workList li');
    const worksSection = document.getElementById('worksSection');
    let currentIndex = 0;

    function updateUI() {
        // 更新 Cover Flow
        items.forEach((item, i) => {
            item.className = 'cover-item';
            if (i === currentIndex) item.classList.add('active');
            else if (i === currentIndex - 1) item.classList.add('prev');
            else if (i === currentIndex + 1) item.classList.add('next');
            else item.classList.add('hidden');
        });

        // 更新橫向選單列表
        listItems.forEach((li, i) => {
            li.className = (i === currentIndex) ? 'active' : '';
        });
    }

    // 點擊作品列表切換
    listItems.forEach((li, i) => {
        li.addEventListener('click', () => {
            currentIndex = i;
            updateUI();
        });
    });

    // 橫向按鈕控制
    document.getElementById('openWorksBtn').addEventListener('click', () => {
        worksSection.classList.add('active');
    });
    document.getElementById('closeWorksBtn').addEventListener('click', () => {
        worksSection.classList.remove('active');
    });

    // 滑動支援
    let startX = 0;
    const container = document.getElementById('coverFlow');
    container.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);
    container.addEventListener('touchend', (e) => {
        let diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0 && currentIndex < items.length - 1) currentIndex++;
            else if (diff < 0 && currentIndex > 0) currentIndex--;
            updateUI();
        }
    });

    updateUI(); // 初始載入顯示作品一
});
