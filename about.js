// --- 基礎跳轉 ---
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// --- Front Row 緊湊版邏輯 ---
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];

let currentFrMenuIdx = 0; 
let currentFrVisualIdx = 0;
let isAnimating = false;

function selFRItem(targetIdx) {
    if (isAnimating || targetIdx === currentFrMenuIdx) return;
    
    // 即時更新選單
    currentFrMenuIdx = targetIdx;
    const listItems = document.querySelectorAll('#frList li');
    listItems.forEach((li, i) => li.classList.toggle('active', i === currentFrMenuIdx));

    runAnimationSequence(targetIdx);
}

function runAnimationSequence(targetIdx) {
    if (currentFrVisualIdx === targetIdx) {
        isAnimating = false;
        return;
    }

    isAnimating = true;
    const isForward = targetIdx > currentFrVisualIdx;
    const remainingSteps = Math.abs(targetIdx - currentFrVisualIdx);
    
    // 如果跨度大，動畫加速 (200ms)，否則正常優雅速度 (600ms)
    const speedMs = remainingSteps > 1 ? 200 : 600;

    const mainCard = document.getElementById('frMain');
    const backCard = document.getElementById('frBack');
    const nextCard = document.getElementById('frNext');
    const prevCard = document.getElementById('frPrev');

    const allCards = [mainCard, backCard, nextCard, prevCard];
    
    // 設定這一步的動畫時間與貝茲曲線
    const transitionRule = `transform ${speedMs}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${speedMs}ms ease`;
    allCards.forEach(card => card.style.transition = transitionRule);

    if (isForward) {
        // Forward: Main -> LeftOut, Back -> Main, Next -> Back
        mainCard.className = 'fr-card fr-pos-left-out';
        backCard.className = 'fr-card fr-pos-main';
        nextCard.className = 'fr-card fr-pos-back';
        // prevCard 保持在 LeftOut (或移動去 RightOut 準備，但 CSS opacity 0 看不見)
    } else {
        // Reverse: Main -> Back, Back -> Next, Prev -> Main
        mainCard.className = 'fr-card fr-pos-back';
        backCard.className = 'fr-card fr-pos-right-out';
        prevCard.className = 'fr-card fr-pos-main';
    }

    setTimeout(() => {
        // 1. 更新視覺索引
        currentFrVisualIdx = isForward ? currentFrVisualIdx + 1 : currentFrVisualIdx - 1;

        // 2. 暫時移除動畫以進行瞬間重置
        allCards.forEach(c => c.style.transition = 'none');

        // 3. 計算內容
        const getIdx = (i) => (i + frDataArr.length) % frDataArr.length;
        const idxMain = getIdx(currentFrVisualIdx);
        const idxBack = getIdx(currentFrVisualIdx + 1);
        const idxNext = getIdx(currentFrVisualIdx + 2); 
        const idxPrev = getIdx(currentFrVisualIdx - 1); 

        mainCard.innerText = frDataArr[idxMain];
        backCard.innerText = frDataArr[idxBack];
        nextCard.innerText = frDataArr[idxNext];
        prevCard.innerText = frDataArr[idxPrev];

        // 4. 卡片歸位 (重置 Class)
        mainCard.className = 'fr-card fr-pos-main';
        backCard.className = 'fr-card fr-pos-back';
        nextCard.className = 'fr-card fr-pos-right-out';
        prevCard.className = 'fr-card fr-pos-left-out';

        // 5. 強制瀏覽器重繪 (Reflow)，避免與下一步動畫合併導致閃爍
        void mainCard.offsetWidth; 

        // 6. 遞歸下一步
        runAnimationSequence(targetIdx);

    }, speedMs); // 等待動畫時間結束
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
