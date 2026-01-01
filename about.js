/**
 * 1. 橫向介面控制 (Landscape Navigation)
 */
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}

function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

/**
 * 2. Front Row 作品選取 (獨立邏輯)
 */
const frData = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
function selFRItem(idx) {
    const listItems = document.querySelectorAll('#frList li');
    const mainCard = document.getElementById('frCurrent');
    const backCard = document.getElementById('frNext');

    listItems.forEach((li, i) => li.classList.toggle('active', i === idx));

    // 簡單轉場動畫
    mainCard.style.opacity = "0.5";
    mainCard.style.transform = "translateY(-50%) scale(0.95)";

    setTimeout(() => {
        mainCard.innerText = frData[idx];
        backCard.innerText = frData[(idx + 1) % frData.length];
        mainCard.style.opacity = "1";
        mainCard.style.transform = "translateY(-50%) scale(1)";
    }, 250);
}

/**
 * 3. 直向 Cover Flow 引擎 (獨立邏輯)
 */
document.addEventListener('DOMContentLoaded', () => {
    const pItems = document.querySelectorAll('.p-item');
    const pEngine = document.getElementById('pEngine');
    let pCurrentIdx = 0;

    function refreshPFlow() {
        pItems.forEach((item, i) => {
            item.classList.remove('active', 'prev', 'next');
            if (i === pCurrentIdx) {
                item.classList.add('active');
            } else if (i === pCurrentIdx - 1) {
                item.classList.add('prev');
            } else if (i === pCurrentIdx + 1) {
                item.classList.add('next');
            }
        });
    }

    // 點擊卡片直接切換
    pItems.forEach((item, i) => {
        item.addEventListener('click', () => {
            pCurrentIdx = i;
            refreshPFlow();
        });
    });

    // 直向專屬滑動偵測
    let pStartX = 0;
    pEngine.addEventListener('touchstart', e => pStartX = e.touches[0].clientX);
    pEngine.addEventListener('touchend', e => {
        let diff = pStartX - e.changedTouches[0].clientX;
        if (diff > 50 && pCurrentIdx < pItems.length - 1) pCurrentIdx++;
        else if (diff < -50 && pCurrentIdx > 0) pCurrentIdx--;
        refreshPFlow();
    });

    refreshPFlow();
});
