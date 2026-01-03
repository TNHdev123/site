function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// --- Front Row 雙向加速軌道邏輯 ---
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
let currentFrIdx = 0;
let isAnimating = false;

function selFRItem(targetIdx) {
    if (isAnimating || targetIdx === currentFrIdx) return;
    
    // 規則：藍色高亮即時跳到目標作品
    const listItems = document.querySelectorAll('#frList li');
    listItems.forEach((li, i) => li.classList.toggle('active', i === targetIdx));

    executeAnimation(targetIdx);
}

function executeAnimation(targetIdx) {
    if (currentFrIdx === targetIdx) {
        isAnimating = false;
        return;
    }
    
    isAnimating = true;
    const isForward = targetIdx > currentFrIdx;
    const nextStepIdx = isForward ? currentFrIdx + 1 : currentFrIdx - 1;
    
    // 判斷是否需要加速（跨數切換）
    const isFast = Math.abs(targetIdx - currentFrIdx) > 1;
    const aniDuration = isFast ? 300 : 600;

    const mainCard = document.getElementById('frMain');
    const backCard = document.getElementById('frBack');
    const nextNextCard = document.getElementById('frNextNext');

    // 應用加速 Class
    if (isFast) {
        [mainCard, backCard, nextNextCard].forEach(c => c.classList.add('fr-fast-ani'));
    }

    if (isForward) {
        // --- 正向動畫 (1 -> 2) ---
        mainCard.classList.add('fr-exit-forward');
        backCard.className = 'fr-card fr-main-pos' + (isFast ? ' fr-fast-ani' : '');
        nextNextCard.className = 'fr-card fr-back-pos' + (isFast ? ' fr-fast-ani' : '');
    } else {
        // --- 反向動畫 (2 -> 1) ---
        // 主角縮回右後方
        mainCard.classList.add('fr-exit-backward');
        // 本來在右後方的卡片「反彈」回左後方
        nextNextCard.className = 'fr-card fr-back-pos' + (isFast ? ' fr-fast-ani' : '');
        // 本來在左後方的卡片由「背景」劃弧線衝回「主角位置」
        backCard.className = 'fr-card fr-main-pos' + (isFast ? ' fr-fast-ani' : '');
    }

    setTimeout(() => {
        currentFrIdx = nextStepIdx;

        // 重置並準備下一幀
        [mainCard, backCard, nextNextCard].forEach(c => {
            c.style.transition = 'none';
            c.classList.remove('fr-fast-ani', 'fr-exit-forward', 'fr-exit-backward');
        });

        // 更新文字內容
        mainCard.innerText = frDataArr[currentFrIdx];
        let bIdx = (currentFrIdx + 1) % frDataArr.length;
        backCard.innerText = frDataArr[bIdx];
        let nIdx = (bIdx + 1) % frDataArr.length;
        nextNextCard.innerText = frDataArr[nIdx];

        // 歸位
        mainCard.className = 'fr-card fr-main-pos';
        backCard.className = 'fr-card fr-back-pos';
        nextNextCard.className = 'fr-card fr-hidden-right';

        mainCard.offsetHeight; // Trigger reflow
        [mainCard, backCard, nextNextCard].forEach(c => c.style.transition = '');

        // 繼續下一步直到 targetIdx
        executeAnimation(targetIdx);
    }, aniDuration);
}

// --- 直向 Cover Flow (保持不變) ---
document.addEventListener('DOMContentLoaded', () => {
    const pItems = document.querySelectorAll('.p-item');
    const pEngine = document.getElementById('pEngine');
    let pIdx = 0;
    function updateP() {
        pItems.forEach((item, i) => {
            item.className = 'p-item';
            if (i === pIdx) item.classList.add('active');
            else if (i === pIdx - 1) item.classList.add('prev');
            else if (i === pIdx + 1) item.classList.add('next');
        });
    }
    pItems.forEach((item, i) => item.addEventListener('click', () => { pIdx = i; updateP(); }));
    let startX = 0;
    pEngine.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    pEngine.addEventListener('touchend', e => {
        let diff = startX - e.changedTouches[0].clientX;
        if (diff > 50 && pIdx < pItems.length - 1) pIdx++;
        else if (diff < -50 && pIdx > 0) pIdx--;
        updateP();
    });
    updateP();
});
