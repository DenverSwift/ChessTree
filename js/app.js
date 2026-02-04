loadTreesToList();

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

// JavaScript - логика
const dialog = document.getElementById('nameDialog');
const form = dialog.querySelector('form');
const openBtn = document.getElementById('openBtn');
const cancelBtn = document.getElementById('cancelBtn');

openBtn.addEventListener('click', () => dialog.showModal());
cancelBtn.addEventListener('click', () => dialog.close());

form.addEventListener('submit', (e) => {
    const formData = new FormData(form);
    const treeName = formData.get('name');

    if (treeName) {
        createEmptyTree(treeName);

        loadTreesToList();

        form.reset();
    }
});

function addNewTree(name) {
    const select = document.querySelector('.select-list');

    const values = Array.from(select.options).map(opt => parseInt(opt.value) || 0);

    const maxValue = values.length > 0 ? Math.max(...values) : 0;
    const newValue = maxValue + 1;

    const newOption = document.createElement('option');
    newOption.value = newValue;
    newOption.textContent = name;

    select.appendChild(newOption);
    select.value = newValue;
}

function generateId() {
    return Number(getTime().replace(/\D/g, '')).toString(36);
}

function getTime() {
    return new Date()
        .toISOString()
        .replace(/[ZT]/g, (m) => (m === 'T' ? ' ' : ''));
}

function createEmptyTree(name) {
    let jsonPattern = {
        meta: {
            name: name,
            createdAt: getTime(),
            updatedAt: getTime(),
        },
        nodes: [],
    };
    localStorage.setItem(`./${name}.json`, JSON.stringify(jsonPattern, null, 2));
    return 0;
}

function loadTreesToList() {
    const select = document.querySelector('.select-list');
    select.innerHTML = '';

    let maxId = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key.startsWith('./') && key.endsWith('.json')) {
            const displayName = key.replace('./', '').replace('.json', '');

            const newOption = document.createElement('option');

            maxId++;
            newOption.value = maxId;
            newOption.textContent = displayName;

            select.appendChild(newOption);
        }
    }
}
