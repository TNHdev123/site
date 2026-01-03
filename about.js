const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];

let mState = { menuIdx: 0, visualIdx: 0, isAnim: false };
let dState = { menuIdx: 0, visualIdx: 0, isAnim: false, lastTriggerTime: 0 };

// 電腦版交互
const dMenuWrapper = document.getElementById('dMenuWrapper');
const dStageArea = document.getElementById('dStageArea');
const dCenterInfo = document.getElementById('dCenterInfo');

if (dMenuWrapper) {
    dMenuWrapper.addEventListener('mouseenter', () => {
        if (window.innerWidth > 1024) {
            dStageArea.classList.add('active');
            if (dCenterInfo) dCenterInfo.classList.add('hidden');
        }
    });
    dMenuWrapper.addEventListener('mouseleave', () => {
        if (window.innerWidth > 1024) {
            dStageArea.classList.remove('active');
            if (dCenterInfo) dCenterInfo.classList.remove('hidden');
        }
    });
}

function desktopHoverItem(targetIdx) {
    if (window.innerWidth <= 1024) return;
    const now = Date.now();
    // 1秒鎖定機制
    if (dState.isAnim && (now - dState.lastTriggerTime < 1000)) return; 
    if (targetIdx === dState.menuIdx) return;

    dState.lastTriggerTime = now;
    dState.menuIdx = targetIdx;
    const items = document.querySelectorAll('#dFrList li');
    items.forEach((li, i) => li.classList.toggle('active', i === targetIdx));
    runUniversalAnimation(targetIdx, dState, 'dFrMain', 'dFrBack', 'dFrNext', 'dFrPrev');
}

// 橫向手機切換
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}
function selFRItem(idx) {
    if (mState.isAnim || idx === mState.menuIdx) return;
    mState.menuIdx = idx;
    const items = document.querySelectorAll('#frList li');
    items.forEach((li, i) => li.classList.toggle('active', i === idx));
    runUniversalAnimation(idx, mState, 'frMain', 'frBack', 'frNext', 'frPrev');
}

// 3D 動畫引擎
function runUniversalAnimation(targetIdx, stateObj, idMain, idBack, idNext, idPrev) {
    if (stateObj.visualIdx === targetIdx) {
        stateObj.isAnim = false;
        return;
    }
    stateObj.isAnim = true;
    const isForward = targetIdx > stateObj.visualIdx;
    const isDesktop = window.innerWidth > 1024;
    const speedMs = Math.abs(targetIdx - stateObj.visualIdx) > 1 ? (isDesktop ? 350 : 400) : (isDesktop ? 600 : 700);

    const cards = {
        main: document.getElementById(idMain),
        back: document.getElementById(idBack),
        next: document.getElementById(idNext),
        prev: document.getElementById(idPrev)
    };

    if (!cards.main || !cards.back) return;
    const easing = "cubic-bezier(0.2, 0.8, 0.2, 1)";
    [cards.main, cards.back, cards.next, cards.prev].forEach(c => {
        if(c) c.style.transition = `transform ${speedMs}ms ${easing}, opacity ${speedMs}ms ease`;
    });

    if (isForward) {
        cards.main.className = 'fr-card fr-pos-left-out';
        cards.back.className = 'fr-card fr-pos-main';
        cards.next.className = 'fr-card fr-pos-back';
    } else {
        cards.main.className = 'fr-card fr-pos-back';
        cards.back.className = 'fr-card fr-pos-right-out';
        cards.prev.className = 'fr-card fr-pos-main';
    }

    setTimeout(() => {
        stateObj.visualIdx = isForward ? stateObj.visualIdx + 1 : stateObj.visualIdx - 1;
        [cards.main, cards.back, cards.next, cards.prev].forEach(c => { if(c) c.style.transition = 'none'; });
        const getIdx = (i) => (i + frDataArr.length) % frDataArr.length;
        cards.main.innerText = frDataArr[getIdx(stateObj.visualIdx)];
        cards.back.innerText = frDataArr[getIdx(stateObj.visualIdx + 1)];
        cards.next.innerText = frDataArr[getIdx(stateObj.visualIdx + 2)];
        cards.prev.innerText = frDataArr[getIdx(stateObj.visualIdx - 1)];
        cards.main.className = 'fr-card fr-pos-main';
        cards.back.className = 'fr-card fr-pos-back';
        cards.next.className = 'fr-card fr-pos-right-out';
        cards.prev.className = 'fr-card fr-pos-left-out';
        void cards.main.offsetWidth;
        runUniversalAnimation(targetIdx, stateObj, idMain, idBack, idNext, idPrev);
    }, speedMs);
}

// 直向 CoverFlow
document.addEventListener('DOMContentLoaded', () => {
    const pItems = document.querySelectorAll('.p-item');
    const pEngine = document.getElementById('pEngine');
    if(pEngine && pItems.length > 0) {
        let pIdx = 0;
        function updatePortraitCoverflow() {
            pItems.forEach((item, i) => {
                item.className = 'p-item';
                if (i === pIdx) item.classList.add('active');
                else if (i === pIdx - 1) item.classList.add('prev');
                else if (i === pIdx + 1) item.classList.add('next');
            });
        }
        pItems.forEach((item, i) => item.addEventListener('click', () => { pIdx = i; updatePortraitCoverflow(); }));
        let startX = 0;
        pEngine.addEventListener('touchstart', e => startX = e.touches[0].clientX, {passive: true});
        pEngine.addEventListener('touchend', e => {
            let diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0 && pIdx < pItems.length - 1) pIdx++;
                else if (diff < 0 && pIdx > 0) pIdx--;
                updatePortraitCoverflow();
            }
        }, {passive: true});
        updatePortraitCoverflow();
    }
});
