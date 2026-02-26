const OPENINGS = [
    "Alekhine Defense",
    "Bird Opening",
    "Caro-Kann Defense",
    "English Opening",
    "Evans Gambit",
    "French Defense",
    "Italian Game",
    "King's Gambit",
    "Nimzo-Indian Defense",
    "Pirc Defense",
    "Queen's Gambit",
    "Ruy Lopez",
    "Scandinavian Defense",
    "Sicilian Defense"
].sort((a, b) => a.localeCompare(b));

const SLOGANS = [
    "Explore new openings",
    "Try new gambit",
    "Learn, play, enjoy!",
    "Find your favourite way to play"
];

const heroText = document.getElementById("heroText");
const accountBtn = document.getElementById("accountBtn");
const form = document.getElementById("searchForm");
const input = document.getElementById("openingSearch");
const list = document.getElementById("openingList");
let activeSuggestions = [];
let activeIndex = -1;

heroText.textContent = SLOGANS[Math.floor(Math.random() * SLOGANS.length)];

accountBtn.addEventListener("click", () => {
    accountBtn.textContent = "Account";
});

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

function scoreMatch(query, opening) {
    const q = query.toLowerCase().trim();
    const name = opening.toLowerCase();
    if (!q) return 1;
    if (name === q) return 100;
    if (name.startsWith(q)) return 70;
    if (name.includes(q)) return 40;

    const parts = q.split(/\s+/).filter(Boolean);
    let score = 0;
    for (const part of parts) {
        if (name.includes(part)) score += 12;
    }
    return score;
}

function getMatches(query) {
    const normalized = query.toLowerCase().trim();
    const scored = OPENINGS
        .map((opening) => ({ opening, score: scoreMatch(query, opening) }))
        .filter((item) => item.score > 0);

    const startsWith = scored
        .filter((item) => item.opening.toLowerCase().startsWith(normalized))
        .map((item) => item.opening)
        .sort((a, b) => a.localeCompare(b));

    const includes = scored
        .filter((item) => !item.opening.toLowerCase().startsWith(normalized))
        .map((item) => item.opening)
        .sort((a, b) => a.localeCompare(b));

    return [...startsWith, ...includes];
}

function positionListWithinViewport() {
    list.classList.remove("drop-up");
    list.style.maxHeight = "";

    const viewportMargin = 12;
    const searchRect = form.getBoundingClientRect();
    const spaceBelow = window.innerHeight - searchRect.bottom - viewportMargin;
    const spaceAbove = searchRect.top - viewportMargin;

    const targetHeight = Math.min(300, window.innerHeight * 0.42);
    const belowHeight = Math.max(0, Math.min(targetHeight, spaceBelow - 8));
    const aboveHeight = Math.max(0, Math.min(targetHeight, spaceAbove - 8));

    if (belowHeight < 120 && aboveHeight > belowHeight) {
        list.classList.add("drop-up");
        list.style.maxHeight = `${aboveHeight}px`;
    } else {
        list.style.maxHeight = `${belowHeight}px`;
    }
}

function renderList(matches) {
    list.innerHTML = "";
    activeIndex = -1;
    activeSuggestions = matches;

    if (!matches.length) {
        const li = document.createElement("li");
        li.className = "no-opening";
        li.textContent = "no opening found";
        list.appendChild(li);
    } else {
        for (const opening of matches) {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "opening-option";
            btn.textContent = opening;
            btn.addEventListener("click", () => {
                window.location.href = `library.html#${slugify(opening)}`;
            });
            li.appendChild(btn);
            list.appendChild(li);
        }
    }

    list.classList.add("visible");
    input.setAttribute("aria-expanded", "true");
    positionListWithinViewport();
}

function hideList() {
    list.classList.remove("visible");
    list.classList.remove("drop-up");
    input.setAttribute("aria-expanded", "false");
}

function routeFromInput() {
    const matches = getMatches(input.value);
    const destination = matches.length ? `library.html#${slugify(matches[0])}` : "library.html";
    window.location.href = destination;
}

input.addEventListener("focus", () => {
    renderList(getMatches(input.value));
});

input.addEventListener("input", () => {
    renderList(getMatches(input.value));
});

window.addEventListener("resize", () => {
    if (list.classList.contains("visible")) {
        positionListWithinViewport();
    }
});

input.addEventListener("keydown", (event) => {
    if (!list.classList.contains("visible")) return;

    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!activeSuggestions.length) return;
        activeIndex = (activeIndex + 1) % activeSuggestions.length;
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!activeSuggestions.length) return;
        activeIndex = (activeIndex - 1 + activeSuggestions.length) % activeSuggestions.length;
    }

    if (event.key === "Enter") {
        event.preventDefault();
        if (activeSuggestions.length && activeIndex >= 0) {
            window.location.href = `library.html#${slugify(activeSuggestions[activeIndex])}`;
            return;
        }
        routeFromInput();
    }

    const options = list.querySelectorAll(".opening-option");
    options.forEach((node, idx) => node.classList.toggle("active", idx === activeIndex));
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    routeFromInput();
});

document.addEventListener("click", (event) => {
    if (!form.contains(event.target)) {
        hideList();
    }
});

const canvas = document.getElementById("bg-network");
const ctx = canvas.getContext("2d");
const pointer = { x: -9999, y: -9999 };
let dpr = 1;
let width = 0;
let height = 0;
let clusters = [];

function randomIn(min, max) {
    return min + Math.random() * (max - min);
}

function buildClusters() {
    clusters = [];
    const area = width * height;
    const clusterCount = Math.max(18, Math.floor(area / 57500));

    for (let i = 0; i < clusterCount; i++) {
        const pointCount = 3 + Math.floor(Math.random() * 3);
        const radius = randomIn(34, 58);
        const cluster = {
            cx: randomIn(40, Math.max(41, width - 40)),
            cy: randomIn(40, Math.max(41, height - 40)),
            driftX: randomIn(-0.18, 0.18),
            driftY: randomIn(-0.18, 0.18),
            radius,
            points: []
        };

        for (let j = 0; j < pointCount; j++) {
            cluster.points.push({
                angle: (Math.PI * 2 * j) / pointCount + randomIn(-0.2, 0.2),
                distance: radius * randomIn(0.55, 1),
                phase: randomIn(0, Math.PI * 2),
                speed: randomIn(0.003, 0.008),
                offsetX: 0,
                offsetY: 0
            });
        }

        clusters.push(cluster);
    }
}

function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildClusters();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

window.addEventListener("mousemove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
});

window.addEventListener("mouseleave", () => {
    pointer.x = -9999;
    pointer.y = -9999;
});

function animate() {
    ctx.clearRect(0, 0, width, height);

    for (const cluster of clusters) {
        cluster.cx += cluster.driftX;
        cluster.cy += cluster.driftY;

        if (cluster.cx < 20 || cluster.cx > width - 20) cluster.driftX *= -1;
        if (cluster.cy < 20 || cluster.cy > height - 20) cluster.driftY *= -1;

        const rendered = [];

        for (const point of cluster.points) {
            point.phase += point.speed;
            const wobble = Math.sin(point.phase) * 4;

            const baseX = cluster.cx + Math.cos(point.angle) * (point.distance + wobble);
            const baseY = cluster.cy + Math.sin(point.angle) * (point.distance + wobble);

            const dx = baseX - pointer.x;
            const dy = baseY - pointer.y;
            const dist = Math.hypot(dx, dy);
            let targetOffsetX = 0;
            let targetOffsetY = 0;
            if (dist < 110 && dist > 0.001) {
                const strength = (1 - dist / 110) * 8;
                targetOffsetX = (dx / dist) * strength;
                targetOffsetY = (dy / dist) * strength;
            }

            point.offsetX += (targetOffsetX - point.offsetX) * 0.08;
            point.offsetY += (targetOffsetY - point.offsetY) * 0.08;

            const x = baseX + point.offsetX;
            const y = baseY + point.offsetY;
            rendered.push({ x, y });
        }

        ctx.beginPath();
        ctx.strokeStyle = "rgba(10, 10, 10, 0.2)";
        ctx.lineWidth = 1;
        for (let i = 0; i < rendered.length; i++) {
            const a = rendered[i];
            const b = rendered[(i + 1) % rendered.length];
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();

        for (const p of rendered) {
            ctx.beginPath();
            ctx.fillStyle = "rgba(15, 15, 15, 0.72)";
            ctx.arc(p.x, p.y, 1.9, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    requestAnimationFrame(animate);
}

animate();
