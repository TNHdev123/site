// =========================================
// 1. 共用數據與狀態
// =========================================
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];

// 分開記錄手機版 (Mobile) 同 電腦版 (Desktop) 嘅狀態，互不干擾
let mState = { menuIdx: 0, visualIdx: 0, isAnim: false };
let dState = { menuIdx: 0, visualIdx: 0, isAnim: false };

// =========================================
// 2. 電腦版專屬邏輯 (Desktop Logic)
// =========================================
const dMenuWrapper = document.getElementById('dMenuWrapper');
const dStageArea = document.getElementById('dStageArea');

if (dMenuWrapper && dStageArea) {
    // 進入選單範圍 -> 顯示舞台
    dMenuWrapper.addEventListener('mouseenter', () => {
        if (window.innerWidth > 1024) dStageArea.classList.add('active');
    });
    // 離開選單範圍 -> 隱藏舞台
    dMenuWrapper.addEventListener('mouseleave', () => {
        if (window.innerWidth > 1024) dStageArea.classList.remove('active');
    });
}

// Hover 項目觸發切換
function desktopHoverItem(targetIdx) {
    if (window.innerWidth <= 1024) return; // 手機模式下禁止執行
    
    // 即時更新選單 UI
    dState.menuIdx = targetIdx;
    const items = document.querySelectorAll('#dFrList li');
    items.forEach((li, i) => li.classList.toggle('active', i === targetIdx));

    // 呼叫動畫引擎 (傳入電腦版專用 ID)
    runUniversalAnimation(targetIdx, dState, 
        'dFrMain', 'dFrBack', 'dFrNext', 'dFrPrev');
}

// =========================================
// 3. 手機版專屬邏輯 (Mobile Logic)
// =========================================
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// Click 項目觸發切換
function selFRItem(targetIdx) {
    if (mState.isAnim || targetIdx === mState.menuIdx) return;
    
    mState.menuIdx = targetIdx;
    const items = document.querySelectorAll('#frList li');
    items.forEach((li, i) => li.classList.toggle('active', i === targetIdx));

    // 呼叫動畫引擎 (傳入手機版專用 ID)
    runUniversalAnimation(targetIdx, mState, 
        'frMain', 'frBack', 'frNext', 'frPrev');
}

// =========================================
// 4. 通用核心動畫引擎 (Core Engine)
// 負責處理卡片嘅物理移動，無論係手機定電腦都係用呢套數學邏輯
// =========================================
function runUniversalAnimation(targetIdx, stateObj, idMain, idBack, idNext, idPrev) {
    // 如果視覺已經同步，停止遞歸
    if (stateObj.visualIdx === targetIdx) {
        stateObj.isAnim = false;
        return;
    }

    stateObj.isAnim = true;
    const isForward = targetIdx > stateObj.visualIdx;
    const dist = Math.abs(targetIdx - stateObj.visualIdx);
    
    // 加速邏輯：如果距離遠，中間幾步飛快啲 (150ms)，最後一步先正常 (500ms)
    // 注意：電腦版可以快少少
    const isDesktop = window.innerWidth > 1024;
    const speedMs = dist > 1 ? (isDesktop ? 120 : 150) : (isDesktop ? 500 : 600);

    const mainCard = document.getElementById(idMain);
    const backCard = document.getElementById(idBack);
    const nextCard = document.getElementById(idNext);
    const prevCard = document.getElementById(idPrev);
    
    if (!mainCard) return; // 安全檢查

    const all = [mainCard, backCard, nextCard, prevCard];
    
    // 設定動畫過渡
    const ease = "cubic-bezier(0.2, 0.8, 0.2, 1)";
    all.forEach(c => c.style.transition = `transform ${speedMs}ms ${ease}, opacity ${speedMs}ms ease`);

    if (isForward) {
        // Forward: Main 離場, Back 上位, Next 補位
        mainCard.className = 'fr-card fr-pos-left-out';
        backCard.className = 'fr-card fr-pos-main';
        nextCard.className = 'fr-card fr-pos-back';
        // prevCard 保持在 left-out 狀態 (invisible)
    } else {
        // Reverse: Main 退位, Back 退位, Prev 回歸
        mainCard.className = 'fr-card fr-pos-back';
        backCard.className = 'fr-card fr-pos-right-out';
        prevCard.className = 'fr-card fr-pos-main';
    }

    setTimeout(() => {
        // 更新視覺索引
        stateObj.visualIdx = isForward ? stateObj.visualIdx + 1 : stateObj.visualIdx - 1;

        // 瞬間重置 (移除動畫)
        all.forEach(c => c.style.transition = 'none');

        // 計算新內容
        const getIdx = (i) => (i + frDataArr.length) % frDataArr.length;
        mainCard.innerText = frDataArr[getIdx(stateObj.visualIdx)];
        backCard.innerText = frDataArr[getIdx(stateObj.visualIdx + 1)];
        nextCard.innerText = frDataArr[getIdx(stateObj.visualIdx + 2)];
        prevCard.innerText = frDataArr[getIdx(stateObj.visualIdx - 1)];

        // 歸位 Class
        mainCard.className = 'fr-card fr-pos-main';
        backCard.className = 'fr-card fr-pos-back';
        nextCard.className = 'fr-card fr-pos-right-out';
        prevCard.className = 'fr-card fr-pos-left-out';

        // 強制重繪
        void mainCard.offsetWidth;

        // 繼續下一步
        runUniversalAnimation(targetIdx, stateObj, idMain, idBack, idNext, idPrev);

    }, speedMs);
}

// =========================================
// 5. 直向 Cover Flow 邏輯 (Portrait Only) - 保持不變
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const pItems = document.querySelectorAll('.p-item');
    const pEngine = document.getElementById('pEngine');
    
    if(pEngine) {
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
    }
});
