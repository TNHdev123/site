// --- 跳轉控制 ---
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// --- Front Row 傳送帶橢圓邏輯 ---
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
let currentFrIdx = 0;
let isAnimating = false;

function selFRItem(targetIdx) {
    if (isAnimating || targetIdx === currentFrIdx) return;
    isAnimating = true;

    const mainCard = document.getElementById('frCurrent');
    const backCard = document.getElementById('frNext');
    const listItems = document.querySelectorAll('#frList li');

    const isForward = targetIdx > currentFrIdx;
    const nextStepIdx = isForward ? currentFrIdx + 1 : currentFrIdx - 1;

    // 1. 執行單向推場動畫
    mainCard.classList.add('push-exit'); // 中間 -> 左前消失
    backCard.classList.add('push-enter'); // 左後 -> 中間登場

    setTimeout(() => {
        // 2. 動畫完成，更新數據
        currentFrIdx = nextStepIdx;
        mainCard.innerText = frDataArr[currentFrIdx];
        
        // 預備下一個登場的作品 (依然擺喺橢圓左後方)
        let nextBackIdx = isForward ? currentFrIdx + 1 : currentFrIdx - 1;
        if (nextBackIdx < 0) nextBackIdx = 0;
        if (nextBackIdx >= frDataArr.length) nextBackIdx = frDataArr.length - 1;
        backCard.innerText = frDataArr[nextBackIdx];

        // 3. 瞬間重置狀態 (唔可以用 transition)
        mainCard.classList.remove('push-exit');
        backCard.classList.remove('push-enter');

        // 更新選單
        listItems.forEach((li, i) => li.classList.toggle('active', i === currentFrIdx));

        isAnimating = false;

        // 遞歸處理連續跳轉
        if (currentFrIdx !== targetIdx) {
            setTimeout(() => selFRItem(targetIdx), 50);
        }
    }, 600); // 同 CSS transition 時間一致
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
