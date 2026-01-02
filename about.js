// --- 跳轉 ---
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// --- FR 真正的單向軌道引擎 ---
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
let currentFrIdx = 0;
let isAnimating = false;

function selFRItem(targetIdx) {
    if (isAnimating || targetIdx === currentFrIdx) return;
    isAnimating = true;

    const stage = document.getElementById('frStage');
    const oldMain = document.querySelector('.fr-card.main');
    const oldBack = document.querySelector('.fr-card.back');
    const listItems = document.querySelectorAll('#frList li');

    const isForward = targetIdx > currentFrIdx;
    const nextStepIdx = isForward ? currentFrIdx + 1 : currentFrIdx - 1;

    // 1. 啟動推場動畫
    oldMain.classList.add('exit-pushed'); 
    oldBack.style.opacity = "1"; // 讓原本在後面的顯示
    oldBack.classList.add('enter-pushed');

    // 2. 準備第三塊卡片 (由暗處準備進入)
    let futureIdx = isForward ? nextStepIdx + 1 : nextStepIdx - 1;
    if (futureIdx < 0) futureIdx = 0;
    if (futureIdx >= frDataArr.length) futureIdx = frDataArr.length - 1;

    const futureCard = document.createElement('div');
    futureCard.className = 'fr-card back';
    futureCard.innerText = frDataArr[futureIdx];
    stage.appendChild(futureCard);

    setTimeout(() => {
        // 3. 動畫結束後的清理與身份轉換
        oldMain.remove(); // 舊的徹底消失，唔會返轉頭

        // 將剛登場的作品轉為正式的 main
        oldBack.classList.remove('back', 'enter-pushed');
        oldBack.classList.add('main');
        oldBack.id = "frCurrent";

        // 更新當前索引
        currentFrIdx = nextStepIdx;
        listItems.forEach((li, i) => li.classList.toggle('active', i === currentFrIdx));

        isAnimating = false;

        // 4. 連續動畫處理
        if (currentFrIdx !== targetIdx) {
            setTimeout(() => selFRItem(targetIdx), 50);
        }
    }, 700); // 對應 CSS 0.7s
}

// --- 直向 Cover Flow ---
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
