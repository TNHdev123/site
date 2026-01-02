function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
function selFRItem(idx) {
    const listItems = document.querySelectorAll('#frList li');
    const mainCard = document.getElementById('frCurrent');
    const backCard = document.getElementById('frNext');

    listItems.forEach((li, i) => li.classList.toggle('active', i === idx));
    mainCard.style.opacity = "0.6";
    mainCard.style.transform = "translateY(-50%) scale(0.9)";

    setTimeout(() => {
        mainCard.innerText = frDataArr[idx];
        backCard.innerText = frDataArr[(idx + 1) % frDataArr.length];
        mainCard.style.opacity = "1";
        mainCard.style.transform = "translateY(-50%) scale(1)";
    }, 200);
}

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
