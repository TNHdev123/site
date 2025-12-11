(function() {
    // == START: 外部引用版 (ad_lure.js) - Base64 修復版 ==

    // 1. Base64 圖片數據定義 (確保圖片一定能顯示的核心)
    const BASE64_IMGS = {
        football: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjUwIDE1MCI+PHJlY3Qgd2lkdGg9IjI1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzMzMyI+8u2S5oaKPC90ZXh0Pjwvc3ZnPg==",
        badminton: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjUwIDE1MCI+PHJlY3Qgd2lkdGg9IjI1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzMzMyI+8u2R6bqKPC90ZXh0Pjwvc3ZnPg==",
        game: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjUwIDE1MCI+PHJlY3Qgd2lkdGg9IjI1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzMzMyI+8u2V6YeKPC90ZXh0Pjwvc3ZnPg==",
        mc: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjUwIDE1MCI+PHJlY3Qgd2lkdGg9IjI1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzMzMyI+8u2V6Y+KPC90ZXh0Pjwvc3ZnPg=="
    };

    // 2. 文章資料庫
    const articles = [
        { title: "解構邊路衛的隱藏跑位：現代足球的關鍵戰術解析", type: "football" },
        { title: "高階技巧：如何利用「假動作」破解頂級防守", type: "badminton" },
        { title: "次世代足球遊戲：2026 年潛力新秀數據深度解析", type: "game" },
        { title: "1.25.0 更新預覽：被官方雪藏的隱藏生物與機制", type: "mc" },
        { title: "數據盲區：頂級聯賽中場傳球成功率與勝率的關係", type: "football" },
        { title: "專業訓練：羽毛球運動員的力量訓練與爆發力養成", type: "badminton" },
        { title: "戰術板設定：如何在遊戲中有效運用高位逼搶的參數設定", type: "game" },
        { title: "終極生存基地建造：防禦與資源整合的高效設計", type: "mc" },
    ];

    // 3. 設定與連結
    const PRANK_URL = "https://tnttc2.github.io/iog.github.io/http520.html";
    // 注意：這裡需要動態獲取當前頁面的 URL，確保跳轉回正確的頁面
    const getHomeUrl = () => window.location.href;

    const INITIAL_DELAY = 30000; // 首次延遲 30 秒
    const REFRESH_DELAY = 30000; // 刷新延遲 30 秒
    const LOCK_DURATION = 300;   // 鎖定 5 分鐘

    // 4. 輔助函數
    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 5. 核心函數：創建並顯示彈窗
    function showFakeAd() {
        if (document.getElementById('fakeAdOverlay')) return;

        // 隨機選擇文章並獲取對應的 Base64 圖片
        const randomIndex = Math.floor(Math.random() * articles.length);
        const selectedArticle = articles[randomIndex];
        // 使用 OR 運算符提供默認值，防止類型錯誤
        const base64ImgSrc = BASE64_IMGS[selectedArticle.type] || BASE64_IMGS.game;

        // 創建元素
        const overlay = document.createElement('div');
        overlay.id = 'fakeAdOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;justify-content:center;align-items:center;z-index:99999;pointer-events:auto;';

        const modal = document.createElement('div');
        modal.style.cssText = 'background:white;color:#333;padding:30px;border-radius:12px;width:85%;max-width:400px;box-shadow:0 10px 20px rgba(0,0,0,0.5);position:relative;text-align:center;cursor:pointer;';

        const closeBtnContainer = document.createElement('div');
        closeBtnContainer.style.cssText = 'position:absolute;top:10px;right:10px;display:flex;align-items:center;background:rgba(255,255,255,0.9);border-radius:10px;padding:5px;z-index:100000;';

        const timerDisplay = document.createElement('span');
        timerDisplay.style.cssText = 'font-size:14px;color:#e74c3c;font-weight:bold;margin-right:5px;user-select:none;';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '❌';
        closeBtn.disabled = true;
        closeBtn.style.cssText = 'background:#ccc;color:#666;border:none;font-size:18px;padding:5px 8px;border-radius:5px;cursor:not-allowed;transition:background 0.3s;pointer-events:auto;';

        // 事件處理
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            overlay.remove();
            setTimeout(showFakeAd, REFRESH_DELAY);
        };

        modal.onclick = () => {
            window.open(PRANK_URL, '_blank');
            window.location.href = getHomeUrl(); // 跳轉回當前頁面
        };

        // 組合 HTML
        const imageElement = `<img src="${base64ImgSrc}" style="width:100%;height:150px;object-fit:cover;border-radius:8px;margin-bottom:15px;">`;
        modal.innerHTML = `<h3 style="color:#e74c3c;margin-top:0;font-size:1.2em;font-weight:bold;">🎉 獨家發現！最新戰術報告洩露！</h3>${imageElement}<p style="font-size:1.1em;font-weight:bold;line-height:1.4;">${selectedArticle.title}</p><p style="color:#777;font-size:0.9em;margin-bottom:0;">點擊查看首席分析師的機密數據...</p>`;

        closeBtnContainer.appendChild(timerDisplay);
        closeBtnContainer.appendChild(closeBtn);
        modal.prepend(closeBtnContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // 倒數計時邏輯
        let timeLeft = LOCK_DURATION;
        timerDisplay.textContent = formatTime(timeLeft); // 立即顯示初始時間
        
        const timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerDisplay.textContent = '已解鎖';
                closeBtn.disabled = false;
                closeBtn.style.cursor = 'pointer';
                closeBtn.style.backgroundColor = '#2ecc71';
                closeBtn.style.color = 'white';
            } else {
                timerDisplay.textContent = formatTime(timeLeft);
            }
        }, 1000);
    }

    // 6. 啟動
    // 使用 setTimeout 確保在頁面載入後才開始計時
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(showFakeAd, INITIAL_DELAY));
    } else {
        setTimeout(showFakeAd, INITIAL_DELAY);
    }

})(); // IIFE 結束
