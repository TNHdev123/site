// == START: 外部引用版 (ad_lure.js) JavaScript ==

// 網站文章資料庫：使用 Base64 佔位符以確保圖片顯示，避免 CSP 限制。
// Base64 圖片 (純色方塊，寫有主題名稱) - 確保它們在任何環境下都能顯示。
const BASE64_IMG_FOOTBALL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjUwIDE1MCI+PHJlY3Qgd2lkdGg9IjI1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzMzMyI+8u2S5oaKPC90ZXh0Pjwvc3ZnPg==";
const BASE64_IMG_BADMINTON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjUwIDE1MCI+PHJlY3Qgd2lkdGg9IjI1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzMzMyI+8u2R6bqKPC90ZXh0Pjwvc3ZnPg==";
const BASE64_IMG_GAME = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjUwIDE1MCI+PHJlY3Qgd2lkdGg9IjI1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzMzMyI+8u2V6YeKPC90ZXh0Pjwvc3ZnPg==";
const BASE64_IMG_MC = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjUwIDE1MCI+PHJlY3Qgd2lkdGg9IjI1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzMzMyI+8u2V6Y+KPC90ZXh0Pjwvc3ZnPg==";

const articles = [
    { title: "解構邊路衛的隱藏跑位：現代足球的關鍵戰術解析", type: "football", hash: "#sport-ft1" },
    { title: "高階技巧：如何利用「假動作」破解頂級防守", type: "badminton", hash: "#sport-bt1" },
    { title: "次世代足球遊戲：2026 年潛力新秀數據深度解析", type: "game", hash: "#game-fg1" },
    { title: "1.25.0 更新預覽：被官方雪藏的隱藏生物與機制", type: "mc", hash: "#game-mc1" },
    { title: "數據盲區：頂級聯賽中場傳球成功率與勝率的關係", type: "football", hash: "#sport-ft2" },
    { title: "專業訓練：羽毛球運動員的力量訓練與爆發力養成", type: "badminton", hash: "#sport-bt2" },
    { title: "戰術板設定：如何在遊戲中有效運用高位逼搶的參數設定", type: "game", hash: "#game-fg2" },
    { title: "終極生存基地建造：防禦與資源整合的高效設計", type: "mc", hash: "#game-mc2" },
];

// 惡作劇連結和目標網址
const PRANK_URL = "https://tnttc2.github.io/iog.github.io/http520.html";
const HOME_URL = "https://tnhdev123.github.io/site/TacticsBlocks/index.html";

// 延遲設定
const INITIAL_DELAY = 30000; // 首次彈出延遲：30 秒 
const REFRESH_DELAY = 30000; // 關閉後刷新延遲：30 秒 
const LOCK_DURATION = 300;   // 關閉按鈕鎖定時間：5 分鐘 

/** 根據文章類型獲取 Base64 圖片數據 */
function getBase64Image(type) {
    switch (type) {
        case 'football': return BASE64_IMG_FOOTBALL;
        case 'badminton': return BASE64_IMG_BADMINTON;
        case 'game': return BASE64_IMG_GAME;
        case 'mc': return BASE64_IMG_MC;
        default: return BASE64_IMG_GAME;
    }
}

/** 格式化秒數為 MM:SS 格式 */
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}`;
}

/** 創建並顯示彈出視窗 */
function showFakeAd() {
    if (document.getElementById('fakeAdOverlay')) {
        return;
    }

    // 隨機選擇文章並獲取其 Base64 圖片
    const randomIndex = Math.floor(Math.random() * articles.length);
    const selectedArticle = articles[randomIndex];
    const base64ImgSrc = getBase64Image(selectedArticle.type);

    // 1. 創建半透明遮罩 (Overlay)
    const overlay = document.createElement('div');
    overlay.id = 'fakeAdOverlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex; justify-content: center; align-items: center;
        z-index: 99999; pointer-events: auto; 
    `;
    
    // 2. 創建彈窗內容 (Modal)
    const modal = document.createElement('div');
    modal.style.cssText = `
        background-color: white; color: #333; padding: 30px; border-radius: 12px;
        width: 85%; max-width: 400px; box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        position: relative; text-align: center; cursor: pointer; 
    `;
    
    // 3. 關閉按鈕和計時器容器
    const closeBtnContainer = document.createElement('div');
    closeBtnContainer.style.cssText = `
        position: absolute; top: 10px; right: 10px; display: flex; align-items: center;
        background: rgba(255,255,255,0.9); border-radius: 10px; padding: 5px; z-index: 100000; 
    `;
    
    const timerDisplay = document.createElement('span');
    timerDisplay.id = 'timerDisplay';
    timerDisplay.style.cssText = `
        font-size: 14px; color: #e74c3c; font-weight: bold; margin-right: 5px; user-select: none;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeButton';
    closeBtn.textContent = '❌';
    closeBtn.disabled = true; 
    closeBtn.style.cssText = `
        background: #ccc; color: #666; border: none; font-size: 18px; padding: 5px 8px;
        border-radius: 5px; cursor: not-allowed; transition: background 0.3s; pointer-events: auto; 
    `;
    
    // 關閉按鈕點擊事件 (包含自動刷新機制)
    closeBtn.onclick = (e) => {
        e.stopPropagation(); 
        overlay.remove();   
        
        // 關閉後，設置 30 秒延遲再次彈出
        setTimeout(showFakeAd, REFRESH_DELAY);
    };

    closeBtnContainer.appendChild(timerDisplay);
    closeBtnContainer.appendChild(closeBtn);
    
    // 4. 廣告內容 (使用 Base64 圖片)
    const imageElement = `<img src="${base64ImgSrc}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">`;

    modal.innerHTML = `
        <h3 style="color: #e74c3c; margin-top: 0; font-size: 1.2em; font-weight: bold;">
            🎉 獨家發現！最新戰術報告洩露！
        </h3>
        ${imageElement}
        <p style="font-size: 1.1em; font-weight: bold; line-height: 1.4;">
            ${selectedArticle.title}
        </p>
        <p style="color: #777; font-size: 0.9em; margin-bottom: 0;">
            點擊查看首席分析師的機密數據...
        </p>
    `;

    // 5. 彈窗本身的點擊事件 (執行惡作劇)
    modal.onclick = () => {
        window.open(PRANK_URL, '_blank');
        window.location.href = HOME_URL;
    };
    
    // 組合元素
    modal.prepend(closeBtnContainer); 
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // 6. 啟動倒數計時器邏輯
    let timeLeft = LOCK_DURATION; 
    let timerInterval;
    
    function updateTimer() {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = '已解鎖';
            closeBtn.disabled = false;
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.backgroundColor = '#2ecc71'; 
            closeBtn.style.color = 'white';
        } else {
            timerDisplay.textContent = formatTime(timeLeft);
            timeLeft--;
        }
    }
    
    updateTimer(); 
    timerInterval = setInterval(updateTimer, 1000); 
}

// 首次延遲 30 秒執行
setTimeout(showFakeAd, INITIAL_DELAY);

// ** 已移除 completion() 函數，以確保在標準網頁環境中正常執行 **

// == END: 外部引用版 (ad_lure.js) JavaScript ==
