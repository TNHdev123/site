document.addEventListener('DOMContentLoaded', () => {
    // 直向 Cover Flow 邏輯
    const cvItems = Array.from(document.querySelectorAll('.cover-item'));
    let cvIndex = 0;
    
    function updateCV() {
        cvItems.forEach((item, i) => {
            item.className = 'cover-item';
            if (i === cvIndex) item.classList.add('active');
            else if (i === cvIndex - 1) item.classList.add('prev');
            else if (i === cvIndex + 1) item.classList.add('next');
            else item.classList.add('hidden');
        });
    }

    // 橫向介面邏輯
    const openBtn = document.getElementById('openWorksBtn');
    const closeBtn = document.getElementById('closeWorksBtn');
    const mainView = document.getElementById('frontRowMain');
    const worksView = document.getElementById('frontRowWorks');
    const listItems = document.querySelectorAll('.fr-list-item');
    const previewBox = document.getElementById('fr-preview');

    openBtn.addEventListener('click', () => {
        mainView.classList.add('hidden');
        worksView.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        worksView.classList.add('hidden');
        mainView.classList.remove('hidden');
    });

    listItems.forEach(item => {
        item.addEventListener('click', () => {
            listItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            previewBox.innerText = `作品${item.dataset.id}`;
        });
    });

    // 初始化直向
    updateCV();
    
    // 直向滑動切換
    const cvContainer = document.getElementById('coverFlow');
    let startX = 0;
    cvContainer.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);
    cvContainer.addEventListener('touchend', (e) => {
        let diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0 && cvIndex < cvItems.length - 1) cvIndex++;
            else if (diff < 0 && cvIndex > 0) cvIndex--;
            updateCV();
        }
    });
});
