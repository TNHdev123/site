// --- 跳轉控制 (保持不變) ---
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// --- Front Row 輸送帶軌道邏輯 ---
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
let currentFrIdx = 0;
let isAnimating = false;

function selFRItem(targetIdx) {
    if (isAnimating || targetIdx === currentFrIdx) return;
    
    // 選單即時反應：直接將目標設為 active，唔等動畫
    const listItems = document.querySelectorAll('#frList li');
    listItems.forEach((li, i) => li.classList.toggle('active', i === targetIdx));
    
    // 開始執行（或加速執行）動畫
    runFRAnimation(targetIdx);
}

function runFRAnimation(targetIdx) {
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

    // 動畫加速機制：如果跨度大，縮短 transition 時間
    const distance = Math.abs(targetIdx - currentFrIdx);
    const animSpeed = distance > 1 ? 250 : 450; // 跨多個時加速到 250ms
    mainCard.style.transition = `transform ${animSpeed}ms, opacity ${animSpeed}ms`;
    backCard.style.transition = `transform ${animSpeed}ms, opacity ${animSpeed}ms`;
    nextNextCard.style.transition = `transform ${animSpeed}ms, opacity ${animSpeed}ms`;

    if (isForward) {
        // --- 正向動畫：1 -> 2 ---
        mainCard.classList.add('fr-exit-forward');
        backCard.className = 'fr-card fr-main-pos';
        nextNextCard.className = 'fr-card fr-back-pos';
    } else {
        // --- 反向動畫：2 -> 1 ---
        // 主角退回右後方
        mainCard.classList.add('fr-exit-backward');
        // 左後方張卡片劃弧線進場變成主角
        backCard.className = 'fr-card fr-main-pos fr-enter-from-left';
        // 隱藏卡片補位到左後
        nextNextCard.className = 'fr-card fr-back-pos';
    }

    setTimeout(() => {
        // 更新當前索引
        currentFrIdx = nextStepIdx;

        // 瞬間重置卡片狀態與內容
        mainCard.style.transition = 'none';
        backCard.style.transition = 'none';
        nextNextCard.style.transition = 'none';

        // 重新填入內容
        mainCard.innerText = frDataArr[currentFrIdx];
        let bIdx = (currentFrIdx + 1) % frDataArr.length;
        backCard.innerText = frDataArr[bIdx];
        let nnIdx = (bIdx + 1) % frDataArr.length;
        nextNextCard.innerText = frDataArr[nnIdx];

        // 恢復原始位置 Class
        mainCard.className = 'fr-card fr-main-pos';
        backCard.className = 'fr-card fr-back-pos';
        nextNextCard.className = 'fr-card fr-hidden-right';

        // 強制重繪
        mainCard.offsetHeight;

        // 繼續檢查是否到達目標
        if (currentFrIdx !== targetIdx) {
            runFRAnimation(targetIdx);
        } else {
            isAnimating = false;
        }
    }, animSpeed);
}

// --- 直向 Cover Flow (保持隔離) ---
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
