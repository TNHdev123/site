// --- 導航 ---
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// --- Front Row 圓周迴轉邏輯 ---
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

    // 1. 開始旋轉退出
    mainCard.classList.add(isForward ? 'rotate-exit-next' : 'rotate-exit-prev');
    // 2. 後方作品繞入中心預備
    backCard.classList.add('rotate-enter');

    setTimeout(() => {
        // 3. 切換內容
        currentFrIdx = nextStepIdx;
        mainCard.innerText = frDataArr[currentFrIdx];
        
        // 預計下一個後方作品內容
        let nextBackIdx = isForward ? currentFrIdx + 1 : currentFrIdx - 1;
        if (nextBackIdx < 0) nextBackIdx = 0;
        if (nextBackIdx >= frDataArr.length) nextBackIdx = frDataArr.length - 1;
        backCard.innerText = frDataArr[nextBackIdx];

        // 4. 重設動畫 Class
        mainCard.classList.remove('rotate-exit-next', 'rotate-exit-prev');
        backCard.classList.remove('rotate-enter');

        // 選單同步
        listItems.forEach((li, i) => li.classList.toggle('active', i === currentFrIdx));

        isAnimating = false;

        // 5. 遞歸：實現跨作品連續迴轉
        if (currentFrIdx !== targetIdx) {
            selFRItem(targetIdx);
        }
    }, 600); // 稍微加長轉場時間令迴轉更明顯
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
