// --- 共用數據 ---
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];
let mState = { menuIdx: 0, visualIdx: 0, isAnim: false };
let dState = { menuIdx: 0, visualIdx: 0, isAnim: false, lastAnimTime: 0 };

// --- 電腦版交互 ---
const dMenuWrapper = document.getElementById('dMenuWrapper');
const dStageArea = document.getElementById('dStageArea');
const dCenterInfo = document.getElementById('dCenterInfo');

if (dMenuWrapper) {
    dMenuWrapper.addEventListener('mouseenter', () => {
        if (window.innerWidth > 1024) {
            dStageArea.classList.add('active');
            dCenterInfo.classList.add('hide'); // 隱藏中間資訊
        }
    });
    dMenuWrapper.addEventListener('mouseleave', () => {
        if (window.innerWidth > 1024) {
            dStageArea.classList.remove('active');
            dCenterInfo.classList.remove('hide'); // 顯示中間資訊
        }
    });
}

function desktopHoverItem(targetIdx) {
    if (window.innerWidth <= 1024) return;
    
    const now = Date.now();
    // 如果距離上次動畫播放唔夠 200ms，而且重有好多步要行，就強制進入「快速切換」模式
    const isSpamming = (now - dState.lastAnimTime < 200);
    
    dState.menuIdx = targetIdx;
    const items = document.querySelectorAll('#dFrList li');
    items.forEach((li, i) => li.classList.toggle('active', i === targetIdx));

    if (targetIdx !== dState.visualIdx) {
        dState.lastAnimTime = now;
        runUniversalAnimation(targetIdx, dState, 'dFrMain', 'dFrBack', 'dFrNext', 'dFrPrev');
    }
}

// --- 通用動畫引擎 (核心修正：Bug 防禦) ---
function runUniversalAnimation(targetIdx, stateObj, idMain, idBack, idNext, idPrev) {
    // 1. 如果已經到達目標，停止
    if (stateObj.visualIdx === targetIdx) {
        stateObj.isAnim = false;
        return;
    }

    // 2. 如果正在動畫中，等下一幀再檢查 (防止無限 Stack)
    if (stateObj.isAnim) return;

    stateObj.isAnim = true;
    const isForward = targetIdx > stateObj.visualIdx;
    const dist = Math.abs(targetIdx - stateObj.visualIdx);
    
    // 3. 動畫速度調整
    // 如果係電腦版且正在快速滑動，將速度極速化 (100ms) 以追上滑鼠
    const speedMs = dist > 1 ? 120 : 450;

    const mainCard = document.getElementById(idMain);
    const backCard = document.getElementById(idBack);
    const nextCard = document.getElementById(idNext);
    const prevCard = document.getElementById(idPrev);
    const all = [mainCard, backCard, nextCard, prevCard];

    all.forEach(c => c.style.transition = `transform ${speedMs}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${speedMs}ms ease`);

    if (isForward) {
        mainCard.className = 'fr-card fr-pos-left-out';
        backCard.className = 'fr-card fr-pos-main';
        nextCard.className = 'fr-card fr-pos-back';
    } else {
        mainCard.className = 'fr-card fr-pos-back';
        backCard.className = 'fr-card fr-pos-right-out';
        prevCard.className = 'fr-card fr-pos-main';
    }

    setTimeout(() => {
        stateObj.visualIdx = isForward ? stateObj.visualIdx + 1 : stateObj.visualIdx - 1;
        
        all.forEach(c => c.style.transition = 'none');
        
        const getIdx = (i) => (i + frDataArr.length) % frDataArr.length;
        mainCard.innerText = frDataArr[getIdx(stateObj.visualIdx)];
        backCard.innerText = frDataArr[getIdx(stateObj.visualIdx + 1)];
        nextCard.innerText = frDataArr[getIdx(stateObj.visualIdx + 2)];
        prevCard.innerText = frDataArr[getIdx(stateObj.visualIdx - 1)];

        mainCard.className = 'fr-card fr-pos-main';
        backCard.className = 'fr-card fr-pos-back';
        nextCard.className = 'fr-card fr-pos-right-out';
        prevCard.className = 'fr-card fr-pos-left-out';

        void mainCard.offsetWidth; // 強制重繪
        stateObj.isAnim = false;

        // 遞歸調用，直到 visualIdx 等於 targetIdx
        runUniversalAnimation(targetIdx, stateObj, idMain, idBack, idNext, idPrev);
    }, speedMs);
}

// (保留 selFRItem 同 DOMContentLoaded 內容)
