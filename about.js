// 切換板面
function navTo(id) {
    document.querySelectorAll('.l-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Front Row 作品切換動畫
let works = ["作品 1", "作品 2", "作品 3", "作品 4", "作品 5"];

function selFR(idx) {
    const list = document.querySelectorAll('.l-menu-list li');
    const curCard = document.getElementById('frCurrent');
    const nextCard = document.getElementById('frNext');

    // 更新列表樣式
    list.forEach((li, i) => li.classList.toggle('active', i === idx));

    // 觸發切換動畫
    curCard.style.transform = "translateX(-100px) scale(0.8) opacity(0)";
    
    setTimeout(() => {
        curCard.innerText = works[idx];
        nextCard.innerText = works[(idx + 1) % works.length];
        curCard.style.transform = "translateZ(0)";
    }, 300);
}

// 直向控制 (維持原本邏輯)
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.p-card');
    let cur = 0;
    function updateP() {
        cards.forEach((c, i) => {
            c.className = 'p-card';
            if (i === cur) c.classList.add('active');
            else if (i === cur + 1) c.classList.add('next');
            else c.classList.add('hidden');
        });
    }
    // 簡單點擊切換測試
    document.getElementById('pFlow').onclick = () => { cur = (cur + 1) % cards.length; updateP(); };
    updateP();
});
