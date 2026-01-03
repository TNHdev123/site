// --- 數據 ---
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];

// --- 狀態控制 ---
let mState = { menuIdx: 0, visualIdx: 0, isAnim: false };
let dState = { menuIdx: 0, visualIdx: 0, isAnim: false, lastTriggerTime: 0 };

// --- 電腦版交互 ---
const dMenuWrapper = document.getElementById('dMenuWrapper');
const dStageArea = document.getElementById('dStageArea');
const dCenterInfo = document.getElementById('dCenterInfo');

if (dMenuWrapper) {
    dMenuWrapper.addEventListener('mouseenter', () => {
        if (window.innerWidth > 1024) {
            dStageArea.classList.add('active');
            dCenterInfo.classList.add('hidden');
        }
    });
    dMenuWrapper.addEventListener('mouseleave', () => {
        if (window.innerWidth > 1024) {
            dStageArea.classList.remove('active');
            dCenterInfo.classList.remove('hidden');
        }
    });
}

function desktopHoverItem(targetIdx) {
    if (window.innerWidth <= 1024) return;

    // --- 核心防 Bug 機制：限制切換頻率 ---
    const now = Date.now();
    // 如果距離上次觸發唔夠 1 秒且仲喺動畫中，就忽略今次觸發
    if (dState.isAnim && (now - dState.lastTriggerTime < 1000)) {
        return; 
    }

    if (targetIdx === dState.menuIdx) return;

    dState.lastTriggerTime = now;
    dState.menuIdx = targetIdx;

    // 更新選單 UI
    const items = document.querySelectorAll('#dFrList li');
    items.forEach((li, i) => li.classList.toggle('active', i === targetIdx));

    // 啟動動畫
    runUniversalAnimation(targetIdx, dState, 'dFrMain', 'dFrBack', 'dFrNext', 'dFrPrev');
}

// --- 通用動畫引擎 (具備鎖定功能) ---
function runUniversalAnimation(targetIdx, stateObj, idMain, idBack, idNext, idPrev) {
    if (stateObj.visualIdx === targetIdx) {
        stateObj.isAnim = false;
        return;
    }

    stateObj.isAnim = true;
    const isForward = targetIdx > stateObj.visualIdx;
    
    // 電腦版如果係快速跳轉，會稍微加速動畫到 300ms，單步則 600ms
    const speedMs = Math.abs(targetIdx - stateObj.visualIdx) > 1 ? 300 : 600;

    const cards = {
        main: document.getElementById(idMain),
        back: document.getElementById(idBack),
        next: document.getElementById(idNext),
        prev: document.getElementById(idPrev)
    };

    Object.values(cards).forEach(c => {
        if(c) c.style.transition = `transform ${speedMs}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${speedMs}ms ease`;
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

        // 重置位置
        Object.values(cards).forEach(c => { if(c) c.style.transition = 'none'; });

        const getIdx = (i) => (i + frDataArr.length) % frDataArr.length;
        cards.main.innerText = frDataArr[getIdx(stateObj.visualIdx)];
        cards.back.innerText = frDataArr[getIdx(stateObj.visualIdx + 1)];
        cards.next.innerText = frDataArr[getIdx(stateObj.visualIdx + 2)];
        cards.prev.innerText = frDataArr[getIdx(stateObj.visualIdx - 1)];

        cards.main.className = 'fr-card fr-pos-main';
        cards.back.className = 'fr-card fr-pos-back';
        cards.next.className = 'fr-card fr-pos-right-out';
        cards.prev.className = 'fr-card fr-pos-left-out';

        void cards.main.offsetWidth; // 強制重繪

        // 遞歸直到對齊 targetIdx
        runUniversalAnimation(targetIdx, stateObj, idMain, idBack, idNext, idPrev);
    }, speedMs);
}

// --- 手機/平板功能 (保持原樣) ---
function selFRItem(idx) {
    if (mState.isAnim || idx === mState.menuIdx) return;
    mState.menuIdx = idx;
    const items = document.querySelectorAll('#frList li');
    items.forEach((li, i) => li.classList.toggle('active', i === idx));
    runUniversalAnimation(idx, mState, 'frMain', 'frBack', 'frNext', 'frPrev');
}

// (直向 CoverFlow DOMContentLoaded 部分略，請保留之前版本)
