<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Hello 我係TNH</title>
    <link rel="stylesheet" href="about.css">
</head>
<body>
    <div class="background-overlay"></div>

    <div class="container portrait-view">
        <header class="profile-header">
            <div class="icon-container">
                <img src="image/icon.jpeg" class="avatar">
                <div class="gloss"></div>
            </div>
            <div class="greeting-text">
                <h1>Hello</h1>
                <h2>我係TNH</h2>
            </div>
        </header>
        <section class="info-section">
            <h3>一個</h3>
            <p>創作者、HongKonger、Minecrafter、測試者、設計者、開發者</p>
        </section>
        <section class="info-section">
            <h3>興趣</h3>
            <p>Minecraft、創作、懷舊設計、軟件修改</p>
        </section>
        <section class="works-section">
            <h3>作品</h3>
            <div class="cover-flow-wrap">
                <div class="cover-flow-container" id="pCoverFlow">
                    <div class="cover-item">作品 1</div>
                    <div class="cover-item">作品 2</div>
                    <div class="cover-item">作品 3</div>
                    <div class="cover-item">作品 4</div>
                    <div class="cover-item">作品 5</div>
                </div>
            </div>
        </section>
        <section class="social-section">
            <h3>關注我</h3>
            <div class="social-row">
                <a href="#"><img src="image/ig.png"></a>
                <a href="#"><img src="image/th.png"></a>
                <a href="#"><img src="image/yt.png"></a>
                <a href="#"><img src="image/rd.png"></a>
                <a href="#"><img src="image/tw.png"></a>
            </div>
        </section>
    </div>

    <div class="landscape-container landscape-view">
        <div id="landMain" class="land-panel active">
            <div class="land-top">
                <div class="land-left">
                    <h3>一個</h3>
                    <p>創作者、HongKonger、Minecrafter、測試者、設計者、開發者</p>
                    <h3 style="margin-top:20px">興趣</h3>
                    <p>Minecraft、創作、懷舊設計、軟件修改</p>
                </div>
                <div class="land-center">
                    <div class="icon-container large-icon">
                        <img src="image/icon.jpeg" class="avatar">
                        <div class="gloss"></div>
                    </div>
                </div>
                <div class="land-right">
                    <h1 class="big-hello">Hello</h1>
                    <h2 class="big-name">我係TNH</h2>
                    <h3 class="follow-text">關注我</h3>
                </div>
            </div>
            <div class="land-bottom">
                <button class="btn-browse" id="btnBrowse">瀏覽作品</button>
                <div class="social-row land-social">
                    <a href="#"><img src="image/ig.png"></a>
                    <a href="#"><img src="image/th.png"></a>
                    <a href="#"><img src="image/yt.png"></a>
                    <a href="#"><img src="image/rd.png"></a>
                    <a href="#"><img src="image/tw.png"></a>
                </div>
            </div>
        </div>

        <div id="landWorks" class="land-panel">
            <div class="land-works-main">
                <div class="land-display">
                    <div class="land-preview-box" id="lPreview">作品 1</div>
                </div>
                <div class="land-list-side">
                    <h3>我的作品</h3>
                    <ul class="works-list" id="lList">
                        <li class="active">作品 1</li>
                        <li>作品 2</li>
                        <li>作品 3</li>
                        <li>作品 4</li>
                        <li>作品 5</li>
                    </ul>
                </div>
            </div>
            <div class="land-works-footer">
                <button class="btn-itv btn-gray" id="btnBack">關閉</button>
                <button class="btn-itv btn-blue">前往</button>
            </div>
        </div>
    </div>

    <script src="about.js"></script>
</body>
</html>
