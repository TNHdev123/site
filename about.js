// --- 基礎跳轉 ---
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// --- Front Row 迴轉動畫核心 ---
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
let currentFrIdx = 0;
let isAnimating = false;

function selFRItem(targetIdx) {
    if (isAnimating || targetIdx === currentFrIdx) return;
    isAnimating = true;

    const mainCard = document.getElementById('frCurrent');
    const backCard = document.getElementById('frNext');
    const listItems = document.querySelectorAll('#frList li');

    // 判斷方向：前進還是後退
    const isForward = targetIdx > currentFrIdx;
    const nextStepIdx = isForward ? currentFrIdx + 1 : currentFrIdx - 1;

    // 1. 啟動第一階段動畫 (迴轉半圈)
    mainCard.classList.add(isForward ? 'exit-next' : 'exit-prev');
    
    // 將 BackCard 預熱 (拉向中心)
    backCard.style.transform = "translateY(-50%) translateX(50%) translateZ(50px) rotateY(0deg)";
    backCard.style.opacity = "1";

    setTimeout(() => {
        // 2. 更新內容
        currentFrIdx = nextStepIdx;
        mainCard.innerText = frDataArr[currentFrIdx];
        
        // 預測下一個 BackCard
        let nextBackIdx = isForward ? currentFrIdx + 1 : currentFrIdx - 1;
        if (nextBackIdx < 0) nextBackIdx = 0;
        if (nextBackIdx >= frDataArr.length) nextBackIdx = frDataArr.length - 1;
        backCard.innerText = frDataArr[nextBackIdx];

        // 3. 恢復初始狀態
        mainCard.classList.remove('exit-next', 'exit-prev');
        backCard.style.transform = ""; // 恢復 CSS 定義的後方位置
        backCard.style.opacity = "";

        // 更新選單亮起
        listItems.forEach((li, i) => li.classList.toggle('active', i === currentFrIdx));

        isAnimating = false;

        // 4. 遞歸檢查：如果未到目標，繼續行下一步
        if (currentFrIdx !== targetIdx) {
            selFRItem(targetIdx);
        }
    }, 500); // 對應 CSS 的 transition 時間
}

// --- 直向 Cover Flow (維持原狀) ---
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
