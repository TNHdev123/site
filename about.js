// --- 基礎跳轉 ---
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// --- Front Row 雙向輸送帶邏輯 ---
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
let currentFrIdx = 0;
let isAnimating = false;

function selFRItem(targetIdx) {
    if (isAnimating || targetIdx === currentFrIdx) return;
    
    // --- 藍色選單：立即定位 ---
    const listItems = document.querySelectorAll('#frList li');
    listItems.forEach((li, i) => li.classList.toggle('active', i === targetIdx));

    executeTransition(targetIdx);
}

function executeTransition(targetIdx) {
    if (currentFrIdx === targetIdx) {
        isAnimating = false;
        return;
    }
    isAnimating = true;

    const mainCard = document.getElementById('frMain');
    const backCard = document.getElementById('frBack');
    const nextCard = document.getElementById('frNext');

    const isForward = targetIdx > currentFrIdx;
    const stepDuration = 250; // 加速切換速度 (原本 600ms)

    // 設定動畫過渡時間
    [mainCard, backCard, nextCard].forEach(c => c.style.transition = `transform ${stepDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${stepDuration}ms`);

    if (isForward) {
        // --- 正向動畫 (1 -> 2) ---
        mainCard.className = 'fr-card fr-exit-pos'; // 中間去左前
        backCard.className = 'fr-card fr-main-pos'; // 左後去中間
        nextCard.className = 'fr-card fr-back-pos'; // 隱藏去左後
        currentFrIdx++;
    } else {
        // --- 反向動畫 (2 -> 1) ---
        // 想像一下：原本消失左去左前方嘅卡片，「吸」返黎中間
        mainCard.className = 'fr-card fr-back-pos'; // 中間去左後
        backCard.className = 'fr-card fr-hidden-pos'; // 左後去隱藏
        
        // 隱藏卡片(左前)「吸」回主角
        nextCard.className = 'fr-card fr-main-pos'; 
        currentFrIdx--;
    }

    setTimeout(() => {
        // 瞬間重置內容，準備下一幀
        [mainCard, backCard, nextCard].forEach(c => c.style.transition = 'none');

        // 更新文字內容
        mainCard.innerText = frDataArr[currentFrIdx];
        
        let backIdx = (currentFrIdx + 1) % frDataArr.length;
        backCard.innerText = frDataArr[backIdx];
        
        let nextIdx = (currentFrIdx + 2) % frDataArr.length;
        nextCard.innerText = frDataArr[nextIdx];

        // 瞬間歸位
        mainCard.className = 'fr-card fr-main-pos';
        backCard.className = 'fr-card fr-back-pos';
        nextCard.className = 'fr-card fr-hidden-pos';

        // 強制瀏覽器重繪
        mainCard.offsetHeight; 

        // 遞歸直到抵達目標
        if (currentFrIdx !== targetIdx) {
            executeTransition(targetIdx);
        } else {
            isAnimating = false;
        }
    }, stepDuration);
}

// --- 直向 Cover Flow (不變) ---
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
