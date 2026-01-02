// 切換介面
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// Front Row 作品選取 (獨立邏輯)
const frData = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
function selFRItem(idx) {
    const listItems = document.querySelectorAll('#frList li');
    const mainCard = document.getElementById('frCurrent');
    const backCard = document.getElementById('frNext');

    listItems.forEach((li, i) => li.classList.toggle('active', i === idx));

    mainCard.innerText = frData[idx];
    backCard.innerText = frData[(idx + 1) % frData.length];
}

// 直向 Cover Flow 引擎
document.addEventListener('DOMContentLoaded', () => {
    const pItems = document.querySelectorAll('.p-item');
    const pEngine = document.getElementById('pEngine');
    let pIdx = 0;

    function drawP() {
        pItems.forEach((item, i) => {
            item.className = 'p-item';
            if (i === pIdx) item.classList.add('active');
            else if (i === pIdx - 1) item.classList.add('prev');
            else if (i === pIdx + 1) item.classList.add('next');
        });
    }

    let startX = 0;
    pEngine.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    pEngine.addEventListener('touchend', e => {
        let diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && pIdx < pItems.length - 1) pIdx++;
            else if (diff < 0 && pIdx > 0) pIdx--;
            drawP();
        }
    });
    drawP();
});
