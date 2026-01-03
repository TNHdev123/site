// --- 跳轉控制 ---
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
    
    // 跨數切換：選單立即跳轉到目標
    const listItems = document.querySelectorAll('#frList li');
    listItems.forEach((li, i) => li.classList.toggle('active', i === targetIdx));

    executeFRAnimation(targetIdx);
}

function executeFRAnimation(targetIdx) {
    if (currentFrIdx === targetIdx) {
        isAnimating = false;
        return;
    }
    isAnimating = true;

    const mainCard = document.getElementById('frMain');
    const backCard = document.getElementById('frBack');
    const nextNextCard = document.getElementById('frNextNext');

    const isForward = targetIdx > currentFrIdx;
    const nextStepIdx = isForward ? currentFrIdx + 1 : currentFrIdx - 1;

    // 計算速度：如果要跨多個，加速播放 (300ms)，否則正常 (600ms)
    const distance = Math.abs(targetIdx - currentFrIdx);
    const animSpeed = distance > 1 ? 300 : 600;

    // 應用過渡時間
    const cards = [mainCard, backCard, nextNextCard];
    cards.forEach(c => c.style.transition = `transform ${animSpeed}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${animSpeed}ms`);

    // 1. 執行場景動畫
    if (isForward) {
        // 正向：1->2 (左前出，左後上)
        mainCard.classList.add('fr-exit-forward');
        backCard.className = 'fr-card fr-main-pos';
        nextNextCard.className = 'fr-card fr-back-pos';
    } else {
        // 反向：2->1 (右前出，主角回左後)
        mainCard.classList.add('fr-exit-backward');
        backCard.className = 'fr-card fr-main-pos'; // 這裡逻辑簡化為對稱切換
        nextNextCard.className = 'fr-card fr-back-pos';
    }

    setTimeout(() => {
        // 2. 更新數據
        currentFrIdx = nextStepIdx;
        
        // 3. 瞬間歸位並更新文字
        cards.forEach(c => c.style.transition = 'none');
        
        mainCard.innerText = frDataArr[currentFrIdx];
        
        // 更新後方與預備卡內容
        let backIdx = isForward ? (currentFrIdx + 1) : (currentFrIdx - 1);
        if (backIdx < 0) backIdx = frDataArr.length - 1;
        if (backIdx >= frDataArr.length) backIdx = 0;
        backCard.innerText = frDataArr[backIdx];

        mainCard.className = 'fr-card fr-main-pos';
        backCard.className = 'fr-card fr-back-pos';
        nextNextCard.className = 'fr-card fr-hidden-side';

        mainCard.offsetHeight; // 強制重繪

        // 4. 遞歸檢查：如果未到目標，繼續下一幀
        if (currentFrIdx !== targetIdx) {
            setTimeout(() => executeFRAnimation(targetIdx), 20);
        } else {
            isAnimating = false;
        }
    }, animSpeed);
}

// --- 直向 Cover Flow (維持隔離) ---
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
