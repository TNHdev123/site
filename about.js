/**
 * 橫向板面跳轉
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
 * Front Row 切換 (獨立邏輯)
 */
const myWorks = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
function selFRItem(idx) {
    const list = document.querySelectorAll('#frList li');
    const main = document.getElementById('frCurrent');
    const next = document.getElementById('frNext');

    list.forEach((li, i) => li.classList.toggle('active', i === idx));

    // 切換動畫：縮放漸變
    main.style.opacity = "0";
    setTimeout(() => {
        main.innerText = myWorks[idx];
        next.innerText = myWorks[(idx + 1) % myWorks.length];
        main.style.opacity = "1";
    }, 200);
}

/**
 * 直向 Cover Flow 引擎
 */
document.addEventListener('DOMContentLoaded', () => {
    const pItems = document.querySelectorAll('.p-item');
    let pIdx = 0;

    function refreshP() {
        pItems.forEach((item, i) => {
            item.classList.remove('active', 'prev', 'next');
            if (i === pIdx) item.classList.add('active');
            else if (i === pIdx - 1) item.classList.add('prev');
            else if (i === pIdx + 1) item.classList.add('next');
        });
    }

    // 觸控滑動 (只針對 Cover Flow 區域)
    let startX = 0;
    const engine = document.getElementById('pFlowEngine');
    engine.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    engine.addEventListener('touchend', e => {
        let diff = startX - e.changedTouches[0].clientX;
        if (diff > 50 && pIdx < pItems.length - 1) pIdx++;
        else if (diff < -50 && pIdx > 0) pIdx--;
        refreshP();
    });

    refreshP();
});
