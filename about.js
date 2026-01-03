// --- 基礎跳轉 ---
function goWorks() {
    document.getElementById('lHome').classList.remove('active');
    document.getElementById('lWorks').classList.add('active');
}
function goHome() {
    document.getElementById('lWorks').classList.remove('active');
    document.getElementById('lHome').classList.add('active');
}

// --- Front Row 進階雙向動畫邏輯 ---
const frDataArr = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];

// 這裡有兩個索引：
// 1. currentFrMenuIdx: 代表選單藍色亮起的位置 (即刻更新)
// 2. currentFrVisualIdx: 代表動畫當前顯示到邊張卡 (逐步追趕)
let currentFrMenuIdx = 0; 
let currentFrVisualIdx = 0;
let isAnimating = false;

function selFRItem(targetIdx) {
    if (isAnimating || targetIdx === currentFrMenuIdx) return;
    
    // 1. 立即更新選單顯示 (直接跳轉)
    currentFrMenuIdx = targetIdx;
    const listItems = document.querySelectorAll('#frList li');
    listItems.forEach((li, i) => li.classList.toggle('active', i === currentFrMenuIdx));

    // 啟動追趕動畫
    runAnimationSequence(targetIdx);
}

function runAnimationSequence(targetIdx) {
    // 遞歸終止條件：視覺索引追上了目標索引
    if (currentFrVisualIdx === targetIdx) {
        isAnimating = false;
        return;
    }

    isAnimating = true;

    // 判斷方向
    const isForward = targetIdx > currentFrVisualIdx;
    
    // 計算剩餘步數，用來決定速度
    const remainingSteps = Math.abs(targetIdx - currentFrVisualIdx);
    
    // 如果剩餘步數大於1，就加速 (0.2s)，否則用正常速度 (0.6s)
    const speedMs = remainingSteps > 1 ? 200 : 600;

    // 獲取 DOM 元素
    const mainCard = document.getElementById('frMain');    // 中間
    const backCard = document.getElementById('frBack');    // 左後
    const nextCard = document.getElementById('frNext');    // 右後外 (Feeder)
    const prevCard = document.getElementById('frPrev');    // 左前外 (Leaver)

    // 設定動畫速度
    const allCards = [mainCard, backCard, nextCard, prevCard];
    allCards.forEach(card => {
        // 使用 CSS transition 屬性動態調整時間
        card.style.transition = `transform ${speedMs}ms ease, opacity ${speedMs}ms ease`;
    });

    if (isForward) {
        // === 正向播放 (Forward: 1 -> 2) ===
        // 動作：Main 離場去 Left-Out，Back 上前做 Main，Next 進入做 Back
        
        mainCard.className = 'fr-card fr-pos-left-out'; // 離場
        backCard.className = 'fr-card fr-pos-main';     // 上位
        nextCard.className = 'fr-card fr-pos-back';     // 補位
        
        // PrevCard 保持在 Left-Out 狀態不動 (或者它本身就在那裡)

    } else {
        // === 反向播放 (Reverse: 2 -> 1) ===
        // 動作：Main 退後做 Back，Back 退後做 Next，Prev (Left-Out) 回歸做 Main
        
        mainCard.className = 'fr-card fr-pos-back';      // 退後
        backCard.className = 'fr-card fr-pos-right-out'; // 消失
        prevCard.className = 'fr-card fr-pos-main';      // 回歸
    }

    // 等待動畫完成後重置 DOM
    setTimeout(() => {
        // 更新視覺索引
        currentFrVisualIdx = isForward ? currentFrVisualIdx + 1 : currentFrVisualIdx - 1;

        // 瞬間移除過渡效果以進行無縫交換
        allCards.forEach(c => c.style.transition = 'none');

        // 計算新的內容索引
        // Helper: 處理負數取模
        const getIdx = (i) => (i + frDataArr.length) % frDataArr.length;
        
        // 根據新的 visualIdx 重新分配文字內容
        // 在這個邏輯裡，我們假設:
        // Main 顯示 visualIdx
        // Back 顯示 visualIdx + 1
        // Next 顯示 visualIdx + 2
        // Prev 顯示 visualIdx - 1
        
        const idxMain = getIdx(currentFrVisualIdx);
        const idxBack = getIdx(currentFrVisualIdx + 1);
        const idxNext = getIdx(currentFrVisualIdx + 2); // 預備下一張
        const idxPrev = getIdx(currentFrVisualIdx - 1); // 預備上一張

        // 重新指派 ID 給對應位置的卡片 (這步是關鍵：將 DOM 角色歸位)
        // 為了簡單起見，我們不交換 ID，而是交換內容並重置 Class
        
        mainCard.innerText = frDataArr[idxMain];
        backCard.innerText = frDataArr[idxBack];
        nextCard.innerText = frDataArr[idxNext];
        prevCard.innerText = frDataArr[idxPrev];

        // 所有人回到初始 Class 位置
        mainCard.className = 'fr-card fr-pos-main';
        backCard.className = 'fr-card fr-pos-back';
        nextCard.className = 'fr-card fr-pos-right-out'; // 歸位去右邊等待
        prevCard.className = 'fr-card fr-pos-left-out';  // 歸位去左邊等待

        // 強制重繪 (Reflow) 確保 Class 變更有被瀏覽器消化
        mainCard.offsetHeight; 

        // 繼續下一步動畫
        runAnimationSequence(targetIdx);

    }, speedMs);
}

// --- 直向 Cover Flow (保持不變) ---
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
