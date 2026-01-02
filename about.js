// --- 跳轉控制 ---
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// --- Front Row 橢圓轉場 (修正方向邏輯) ---
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

    // 橢圓方向切換
    if (isForward) {
        mainCard.classList.add('exit-forward'); // 向右前方繞出
    } else {
        mainCard.classList.add('exit-backward'); // 向左前方繞出
    }
    
    backCard.classList.add('entering'); // 由後方繞進補位

    setTimeout(() => {
        // 更新內容
        currentFrIdx = nextStepIdx;
        mainCard.innerText = frDataArr[currentFrIdx];
        
        let nextBackIdx = isForward ? currentFrIdx + 1 : currentFrIdx - 1;
        if (nextBackIdx < 0) nextBackIdx = 0;
        if (nextBackIdx >= frDataArr.length) nextBackIdx = frDataArr.length - 1;
        backCard.innerText = frDataArr[nextBackIdx];

        // 清除動畫狀態
        mainCard.classList.remove('exit-forward', 'exit-backward');
        backCard.classList.remove('entering');

        listItems.forEach((li, i) => li.classList.toggle('active', i === currentFrIdx));

        isAnimating = false;

        // 遞歸處理跨作品跳轉
        if (currentFrIdx !== targetIdx) {
            setTimeout(() => selFRItem(targetIdx), 50);
        }
    }, 600);
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
