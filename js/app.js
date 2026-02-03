function log() {
    alert("The button is clicked.");
}
const grid = document.getElementById('grid');
let isDragging = false;
let startX, startY, bgX = 0, bgY = 0;

grid.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

grid.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
        isDragging = true;
        startX = e.clientX - bgX;
        startY = e.clientY - bgY;
        grid.style.cursor = 'grabbing';
    }
});

window.addEventListener('mouseup', (e) => {
    if (e.button === 2) {
        isDragging = false;
        grid.style.cursor = 'grab';
    }
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    bgX = e.clientX - startX;
    bgY = e.clientY - startY;
    grid.style.backgroundPosition = `${bgX}px ${bgY}px`;
    const contentLayer = document.getElementById('node');
    contentLayer.style.transform = `translate(${bgX}px, ${bgY}px)`;
});

function returnButton() {
    bgX = 0;
    bgY = 0;
    grid.style.backgroundPosition = '0px 0px';
    const contentLayer = document.getElementById('node');
    contentLayer.style.transform = `translate(0px, 0px)`;
}

