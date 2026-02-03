function log() {
    alert("The button is clicked.");
};
const grid = document.getElementById('grid');
let isDragging = false;
let startX, startY, bgX = 0, bgY = 0;

grid.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - bgX;
    startY = e.clientY - bgY;
    grid.style.cursor = 'grabbing';
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    grid.style.cursor = 'grab';
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    bgX = e.clientX - startX;
    bgY = e.clientY - startY;
    grid.style.backgroundPosition = `${bgX}px ${bgY}px`;
});