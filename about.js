document.addEventListener('DOMContentLoaded', () => {
    // 切換板面邏輯
    const landMain = document.getElementById('landMain');
    const landWorks = document.getElementById('landWorks');
    const btnBrowse = document.getElementById('btnBrowse');
    const btnBack = document.getElementById('btnBack');

    btnBrowse.onclick = () => {
        landMain.classList.remove('active');
        landWorks.classList.add('active');
    };
    btnBack.onclick = () => {
        landWorks.classList.remove('active');
        landMain.classList.add('active');
    };

    // 作品清單切換
    const listItems = document.querySelectorAll('#lList li');
    const previewBox = document.getElementById('lPreview');

    listItems.forEach((li, index) => {
        li.onclick = () => {
            listItems.forEach(item => item.classList.remove('active'));
            li.classList.add('active');
            previewBox.innerText = `作品 ${index + 1}`;
        };
    });

    // 直向 Cover Flow 邏輯 (略，維持之前 currentIndex 0 嘅 update 邏輯即可)
});
