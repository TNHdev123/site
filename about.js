// --- 基礎導航 ---
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// --- Front Row 雙向輸送帶橢圓邏輯 ---
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
let currentFrIdx = 0;
let isAnimating = false;

function selFRItem(targetIdx) {
    if (targetIdx === currentFrIdx) return;
    
    // 立即將選單藍色跳到目標作品
    const listItems = document.querySelectorAll('#frList li');
    listItems.forEach((li, i) => li.classList.toggle('active', i === targetIdx));

    if (isAnimating) return; 
    executeFrStep(targetIdx);
}

function executeFrStep(targetIdx) {
    if (currentFrIdx === targetIdx) {
        isAnimating = false;
        return;
    }

    isAnimating = true;
    const isForward = targetIdx > currentFrIdx;
    
    // 加速機制：跨度越大，動畫越快
    const distance = Math.abs(targetIdx - currentFrIdx);
    const animSpeed = distance > 1 ? 250 : 400; // 跨數切換時加速到 250ms

    const mainCard = document.getElementById('frMain');
    const backCard = document.getElementById('frBack');
    const nextCard = document.getElementById('frNextNext');

    // 設置過渡時間
    const transitionStyle = `transform ${animSpeed}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${animSpeed}ms`;
    mainCard.style.transition = transitionStyle;
    backCard.style.transition = transitionStyle;
    nextCard.style.transition = transitionStyle;

    if (isForward) {
        // --- 正向動畫 (1->2) ---
        mainCard.classList.add('fr-exit-left'); // 主角左前消失
        backCard.className = 'fr-card fr-main-pos'; // 左後補上中間
        nextCard.className = 'fr-card fr-back-pos'; // 隱藏補上左後
    } else {
        // --- 反向動畫 (2->1) ---
        mainCard.classList.add('fr-exit-right'); // 主角右後消失
        backCard.className = 'fr-card fr-main-pos'; // 左前(exit-left位)補上中間
        // 呢度要做一個特殊處理：等下一張由左前方(exit-left位)劃入
        nextCard.className = 'fr-card fr-back-pos'; 
    }

    setTimeout(() => {
        // 更新當前索引
        currentFrIdx = isForward ? currentFrIdx + 1 : currentFrIdx - 1;

        // 瞬間重置與更新內容
        mainCard.style.transition = 'none';
        backCard.style.transition = 'none';
        nextCard.style.transition = 'none';

        // 更新各卡片文字 (環形取值)
        mainCard.innerText = frDataArr[currentFrIdx];
        let bIdx = (currentFrIdx + 1) % frDataArr.length;
        backCard.innerText = frDataArr[bIdx];
        let nIdx = (bIdx + 1) % frDataArr.length;
        nextCard.innerText = frDataArr[nIdx];

        // 重置位置
        mainCard.className = 'fr-card fr-main-pos';
        backCard.className = 'fr-card fr-back-pos';
        nextCard.className = 'fr-card fr-hidden-pos';

        mainCard.offsetHeight; // 強制 reflow

        // 繼續下一步
        if (currentFrIdx !== targetIdx) {
            executeFrStep(targetIdx);
        } else {
            isAnimating = false;
        }
    }, animSpeed);
}

// --- 直向 Cover Flow 保持不變 ---
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
