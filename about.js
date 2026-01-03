const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
let currentFrVisualIdx = 0;
let isAnimating = false;

// --- 手機版 Panel 切換 ---
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// --- 電腦版 Hover 觸發器 ---
const dStageWrap = document.getElementById('dStageWrap');
const dMenuBox = document.getElementById('dMenuBox');

if (dMenuBox) {
    dMenuBox.addEventListener('mouseenter', () => dStageWrap.classList.add('active'));
    dMenuBox.addEventListener('mouseleave', () => dStageWrap.classList.remove('active'));
}

// 電腦版 Hover 切換
function pcHoverItem(idx) {
    if (window.innerWidth < 1025) return;
    updateMenuUI('#dFrList li', idx);
    runAnimationSequence(idx, 'dFr');
}

// 手機版 Click 切換
function selFRItem(idx) {
    updateMenuUI('#lFrList li', idx);
    runAnimationSequence(idx, 'lFr');
}

function updateMenuUI(selector, idx) {
    const items = document.querySelectorAll(selector);
    items.forEach((li, i) => li.classList.toggle('active', i === idx));
}

// --- 核心動畫引擎 (支援正反向與變速) ---
function runAnimationSequence(targetIdx, prefix) {
    if (isAnimating || currentFrVisualIdx === targetIdx) {
        if (!isAnimating && currentFrVisualIdx !== targetIdx) { /* 確保追趕 */ }
        return;
    }

    isAnimating = true;
    const isForward = targetIdx > currentFrVisualIdx;
    const speedMs = Math.abs(targetIdx - currentFrVisualIdx) > 1 ? 200 : 600;

    const main = document.getElementById(`${prefix}Main`);
    const back = document.getElementById(`${prefix}Back`);
    const next = document.getElementById(`${prefix}Next`);
    const prev = document.getElementById(`${prefix}Prev`);
    const cards = [main, back, next, prev];

    cards.forEach(c => c.style.transition = `transform ${speedMs}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${speedMs}ms ease`);

    if (isForward) {
        main.className = 'fr-card fr-pos-left-out';
        back.className = 'fr-card fr-pos-main';
        next.className = 'fr-card fr-pos-back';
    } else {
        main.className = 'fr-card fr-pos-back';
        back.className = 'fr-card fr-pos-right-out';
        prev.className = 'fr-card fr-pos-main';
    }

    setTimeout(() => {
        currentFrVisualIdx = isForward ? currentFrVisualIdx + 1 : currentFrVisualIdx - 1;
        
        cards.forEach(c => c.style.transition = 'none');
        
        const getIdx = (i) => (i + frDataArr.length) % frDataArr.length;
        [main, back, next, prev].forEach((c, idx) => {
            const offsets = [0, 1, 2, -1];
            c.innerText = frDataArr[getIdx(currentFrVisualIdx + offsets[idx])];
        });

        main.className = 'fr-card fr-pos-main';
        back.className = 'fr-card fr-pos-back';
        next.className = 'fr-card fr-pos-right-out';
        prev.className = 'fr-card fr-pos-left-out';

        void main.offsetWidth; // Reflow
        isAnimating = false;
        
        // 如果還沒到達目標，自動繼續下一格
        if (currentFrVisualIdx !== targetIdx) {
            runAnimationSequence(targetIdx, prefix);
        }
    }, speedMs);
}

// --- 直向 CoverFlow (不變) ---
document.addEventListener('DOMContentLoaded', () => {
    const pItems = document.querySelectorAll('.p-item');
    let pIdx = 0;
    const updateP = () => {
        pItems.forEach((item, i) => {
            item.className = 'p-item';
            if (i === pIdx) item.classList.add('active');
            else if (i === pIdx - 1) item.classList.add('prev');
            else if (i === pIdx + 1) item.classList.add('next');
        });
    };
    pItems.forEach((item, i) => item.onclick = () => { pIdx = i; updateP(); });
    updateP();
});
