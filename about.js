// 橫向板面切換
function navTo(id) {
    document.querySelectorAll('.l-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Front Row 切換
const works = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
function selFR(idx) {
    const list = document.querySelectorAll('.l-menu-list li');
    const curCard = document.getElementById('frCurrent');
    const nextCard = document.getElementById('frNext');

    list.forEach((li, i) => li.classList.toggle('active', i === idx));

    // 動畫切換
    curCard.style.opacity = "0";
    curCard.style.transform = "translateY(-50%) scale(0.9)";
    
    setTimeout(() => {
        curCard.innerText = works[idx];
        nextCard.innerText = works[(idx + 1) % works.length];
        curCard.style.opacity = "1";
        curCard.style.transform = "translateY(-50%)";
    }, 300);
}

// 直向 Cover Flow 邏輯強化
document.addEventListener('DOMContentLoaded', () => {
    const pCards = document.querySelectorAll('.p-card');
    let pIdx = 0;

    function updatePFlow() {
        pCards.forEach((card, i) => {
            card.classList.remove('active', 'prev', 'next');
            if (i === pIdx) {
                card.classList.add('active');
            } else if (i === pIdx - 1) {
                card.classList.add('prev');
            } else if (i === pIdx + 1) {
                card.classList.add('next');
            }
        });
    }

    // 點擊卡片切換 (直向)
    pCards.forEach((card, i) => {
        card.addEventListener('click', () => {
            pIdx = i;
            updatePFlow();
        });
    });

    // 滑動支援 (直向)
    let startX = 0;
    const flowContainer = document.getElementById('pFlow');
    flowContainer.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    flowContainer.addEventListener('touchend', e => {
        let diff = startX - e.changedTouches[0].clientX;
        if (diff > 50 && pIdx < pCards.length - 1) pIdx++;
        else if (diff < -50 && pIdx > 0) pIdx--;
        updatePFlow();
    });

    updatePFlow();
});
