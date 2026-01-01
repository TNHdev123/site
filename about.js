document.addEventListener('DOMContentLoaded', () => {
    const items = Array.from(document.querySelectorAll('.cover-item'));
    let currentIndex = 2; // 指向 "Cover Flow" 那張

    function update() {
        items.forEach((item, i) => {
            item.className = 'cover-item';
            if (i === currentIndex) item.classList.add('active');
            else if (i === currentIndex - 1) item.classList.add('prev');
            else if (i === currentIndex + 1) item.classList.add('next');
            else item.classList.add('hidden');
        });
    }

    items.forEach((item, i) => {
        item.addEventListener('click', () => {
            currentIndex = i;
            update();
        });
    });

    update();
});
