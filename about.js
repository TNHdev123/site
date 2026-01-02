// --- 跳轉控制 ---
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
    isAnimating = true;

    const mainCard = document.getElementById('frMain');
    const backCard = document.getElementById('frBack');
    const nextNextCard = document.getElementById('frNextNext');
    const listItems = document.querySelectorAll('#frList li');

    const isForward = targetIdx > currentFrIdx;
    const nextStepIdx = isForward ? (currentFrIdx + 1) % frDataArr.length : (currentFrIdx - 1 + frDataArr.length) % frDataArr.length;

    // 1. 啟動離場與進場
    mainCard.classList.add('fr-exit-left'); // 中間主角 -> 左前消失
    
    backCard.className = 'fr-card fr-main-pos'; // 左後等待 -> 中間主角
    
    nextNextCard.className = 'fr-card fr-back-pos'; // 右側隱藏 -> 左後等待

    setTimeout(() => {
        // 2. 動畫中途更新索引
        currentFrIdx = nextStepIdx;

        // 3. 瞬間重置所有卡片位置與內容 (唔要 transition)
        // 重新設定內容，確保視覺連續
        mainCard.style.transition = 'none';
        backCard.style.transition = 'none';
        nextNextCard.style.transition = 'none';

        // 更新文字
        mainCard.innerText = frDataArr[currentFrIdx];
        
        let backIdx = (currentFrIdx + 1) % frDataArr.length;
        backCard.innerText = frDataArr[backIdx];
        
        let nextNextIdx = (backIdx + 1) % frDataArr.length;
        nextNextCard.innerText = frDataArr[nextNextIdx];

        // 歸位
        mainCard.className = 'fr-card fr-main-pos';
        backCard.className = 'fr-card fr-back-pos';
        nextNextCard.className = 'fr-card fr-hidden-right';

        // 強制重繪
        mainCard.offsetHeight; 

        // 恢復 transition
        mainCard.style.transition = '';
        backCard.style.transition = '';
        nextNextCard.style.transition = '';

        listItems.forEach((li, i) => li.classList.toggle('active', i === currentFrIdx));
        isAnimating = false;

        // 遞歸連續播放
        if (currentFrIdx !== targetIdx) {
            setTimeout(() => selFRItem(targetIdx), 50);
        }
    }, 600);
}

// --- 直向維持 ---
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
