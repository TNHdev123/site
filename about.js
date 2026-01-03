/**
 * TNH Portfolio - Core Logic (2026 Updated Version)
 * 包含：
 * 1. 直向 CoverFlow 觸控邏輯
 * 2. 橫向手機 Panel 切換與 FR 點擊邏輯
 * 3. 電腦版 Hover 觸發、1秒動畫鎖定、主頁資訊隱藏邏輯
 */

// =========================================
// 1. 全局數據
// =========================================
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];

// 分開記錄手機版 (Mobile) 與 電腦版 (Desktop) 的狀態
let mState = { menuIdx: 0, visualIdx: 0, isAnim: false };
let dState = { 
    menuIdx: 0, 
    visualIdx: 0, 
    isAnim: false, 
    lastTriggerTime: 0 // 用於 1 秒防 Bug 鎖定
};

// =========================================
// 2. 電腦版專屬交互 (Desktop Logic)
// =========================================
const dMenuWrapper = document.getElementById('dMenuWrapper');
const dStageArea = document.getElementById('dStageArea');
const dCenterInfo = document.getElementById('dCenterInfo');

if (dMenuWrapper) {
    // 滑鼠進入選單：顯示作品舞台，隱藏中間資訊
    dMenuWrapper.addEventListener('mouseenter', () => {
        if (window.innerWidth > 1024) {
            dStageArea.classList.add('active');
            if (dCenterInfo) dCenterInfo.classList.add('hidden');
        }
    });

    // 滑鼠離開選單：隱藏作品舞台，顯示中間資訊
    dMenuWrapper.addEventListener('mouseleave', () => {
        if (window.innerWidth > 1024) {
            dStageArea.classList.remove('active');
            if (dCenterInfo) dCenterInfo.classList.remove('hidden');
        }
    });
}

/**
 * 電腦版 Hover 切換作品
 * @param {number} targetIdx 
 */
function desktopHoverItem(targetIdx) {
    if (window.innerWidth <= 1024) return;

    const now = Date.now();
    
    // --- 核心防 Bug：1 秒限制機制 ---
    // 如果正在動畫中，且距離上次觸發不足 1000ms，則拒絕新的切換請求
    if (dState.isAnim && (now - dState.lastTriggerTime < 1000)) {
        console.log("Animation locked - high speed hover ignored.");
        return; 
    }

    if (targetIdx === dState.menuIdx) return;

    dState.lastTriggerTime = now;
    dState.menuIdx = targetIdx;

    // 更新電腦版選單 UI 高亮
    const items = document.querySelectorAll('#dFrList li');
    items.forEach((li, i) => li.classList.toggle('active', i === targetIdx));

    // 啟動電腦版 FR 動畫引擎
    runUniversalAnimation(targetIdx, dState, 'dFrMain', 'dFrBack', 'dFrNext', 'dFrPrev');
}

// =========================================
// 3. 橫向手機版交互 (Landscape Mobile Logic)
// =========================================
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}

function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

/**
 * 手機版點擊切換作品
 * @param {number} idx 
 */
function selFRItem(idx) {
    if (mState.isAnim || idx === mState.menuIdx) return;

    mState.menuIdx = idx;
    
    // 更新手機版選單 UI
    const items = document.querySelectorAll('#frList li');
    items.forEach((li, i) => li.classList.toggle('active', i === idx));

    // 啟動手機版 FR 動畫引擎
    runUniversalAnimation(idx, mState, 'frMain', 'frBack', 'frNext', 'frPrev');
}

// =========================================
// 4. 通用 3D 動畫引擎 (Universal FR Engine)
// =========================================
function runUniversalAnimation(targetIdx, stateObj, idMain, idBack, idNext, idPrev) {
    // 如果視覺已經到達目標，解鎖並停止
    if (stateObj.visualIdx === targetIdx) {
        stateObj.isAnim = false;
        return;
    }

    stateObj.isAnim = true;
    const isForward = targetIdx > stateObj.visualIdx;
    
    // 電腦版追求更靈敏的跳轉，中間過渡設為 350ms，單步則 600ms
    const isDesktop = window.innerWidth > 1024;
    const speedMs = Math.abs(targetIdx - stateObj.visualIdx) > 1 
                    ? (isDesktop ? 350 : 400) 
                    : (isDesktop ? 600 : 700);

    const cards = {
        main: document.getElementById(idMain),
        back: document.getElementById(idBack),
        next: document.getElementById(idNext),
        prev: document.getElementById(idPrev)
    };

    // 檢查元素是否存在，避免報錯
    if (!cards.main || !cards.back) return;

    // 應用動畫 Transition
    const easing = "cubic-bezier(0.2, 0.8, 0.2, 1)";
    [cards.main, cards.back, cards.next, cards.prev].forEach(c => {
        if(c) c.style.transition = `transform ${speedMs}ms ${easing}, opacity ${speedMs}ms ease`;
    });

    // 執行位移 Class 變換
    if (isForward) {
        cards.main.className = 'fr-card fr-pos-left-out';
        cards.back.className = 'fr-card fr-pos-main';
        cards.next.className = 'fr-card fr-pos-back';
    } else {
        cards.main.className = 'fr-card fr-pos-back';
        cards.back.className = 'fr-card fr-pos-right-out';
        cards.prev.className = 'fr-card fr-pos-main';
    }

    // 動畫完成後的數據交換
    setTimeout(() => {
        stateObj.visualIdx = isForward ? stateObj.visualIdx + 1 : stateObj.visualIdx - 1;

        // 瞬間移除 transition 進行內容重置
        [cards.main, cards.back, cards.next, cards.prev].forEach(c => { 
            if(c) c.style.transition = 'none'; 
        });

        const getIdx = (i) => (i + frDataArr.length) % frDataArr.length;
        
        // 更新卡片文字內容
        cards.main.innerText = frDataArr[getIdx(stateObj.visualIdx)];
        cards.back.innerText = frDataArr[getIdx(stateObj.visualIdx + 1)];
        cards.next.innerText = frDataArr[getIdx(stateObj.visualIdx + 2)];
        cards.prev.innerText = frDataArr[getIdx(stateObj.visualIdx - 1)];

        // 重置為標準位置 Class
        cards.main.className = 'fr-card fr-pos-main';
        cards.back.className = 'fr-card fr-pos-back';
        cards.next.className = 'fr-card fr-pos-right-out';
        cards.prev.className = 'fr-card fr-pos-left-out';

        // 強制瀏覽器重繪 (Reflow)
        void cards.main.offsetWidth;

        // 遞歸呼叫直至同步
        runUniversalAnimation(targetIdx, stateObj, idMain, idBack, idNext, idPrev);
    }, speedMs);
}

// =========================================
// 5. 直向介面初始化 (Portrait CoverFlow)
// =========================================
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

        // 點擊切換
        pItems.forEach((item, i) => {
            item.addEventListener('click', () => {
                pIdx = i;
                updatePortraitCoverflow();
            });
        });

        // 觸控滑動切換
        let startX = 0;
        pEngine.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
        }, {passive: true});

        pEngine.addEventListener('touchend', e => {
            let diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0 && pIdx < pItems.length - 1) pIdx++;
                else if (diff < 0 && pIdx > 0) pIdx--;
                updatePortraitCoverflow();
            }
        }, {passive: true});

        // 初始化
        updatePortraitCoverflow();
    }
});
