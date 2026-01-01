// --- 橫向切換邏輯 ---
function openWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}

function closeWorks() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

function selLWork(idx) {
    const list = document.querySelectorAll('.l-works-list li');
    const previews = document.querySelectorAll('.l-work-preview');
    
    list.forEach((li, i) => li.classList.toggle('active', i === idx));
    previews.forEach((p, i) => p.classList.toggle('active', i === idx));
}

// --- 直向 Cover Flow 邏輯 ---
document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.p-item');
    const container = document.getElementById('pFlowContainer');
    let currentIndex = 0;

    function updatePFlow() {
        items.forEach((item, i) => {
            item.className = 'p-item';
            if (i === currentIndex) item.classList.add('active');
            else if (i === currentIndex - 1) item.classList.add('prev');
            else if (i === currentIndex + 1) item.classList.add('next');
            else item.classList.add('hidden');
        });
    }

    // 觸控滑動
    let startX = 0;
    container.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    container.addEventListener('touchend', e => {
        let diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0 && currentIndex < items.length - 1) currentIndex++;
            else if (diff < 0 && currentIndex > 0) currentIndex--;
            updatePFlow();
        }
    });

    updatePFlow();
});
