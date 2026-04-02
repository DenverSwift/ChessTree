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
    "Find your favourite way to play",
    "Sharpen your opening instincts",
    "Build lines that make sense",
    "Train smarter, move faster",
    "From first move to clear plan",
    "Discover ideas behind each opening",
    "Grow your chess confidence daily",
    "Master patterns, not just moves",
    "Create your own opening roadmap"
];

const heroText = document.getElementById("heroText");
const accountBtn = document.getElementById("accountBtn");
const form = document.getElementById("searchForm");
const input = document.getElementById("openingSearch");
const list = document.getElementById("openingList");
let activeSuggestions = [];
let activeIndex = -1;

function pickSlogan() {
    if (!SLOGANS.length) return "";
    if (SLOGANS.length === 1) return SLOGANS[0];

    const storageKey = "home_last_slogan_index";
    let lastIndex = -1;

    try {
        lastIndex = Number.parseInt(localStorage.getItem(storageKey), 10);
    } catch (_error) {
        lastIndex = -1;
    }

    let nextIndex = Math.floor(Math.random() * SLOGANS.length);

    if (!Number.isNaN(lastIndex) && lastIndex >= 0 && lastIndex < SLOGANS.length && nextIndex === lastIndex) {
        nextIndex = (lastIndex + 1 + Math.floor(Math.random() * (SLOGANS.length - 1))) % SLOGANS.length;
    }

    try {
        localStorage.setItem(storageKey, String(nextIndex));
    } catch (_error) {
        // Ignore storage errors (private mode or blocked storage).
    }

    return SLOGANS[nextIndex];
}

heroText.textContent = pickSlogan();

if (accountBtn) {
    accountBtn.addEventListener("click", () => {
        accountBtn.textContent = "Account";
    });
}

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

function navigateTo(url) {
    if (typeof window.navigateWithTransition === "function") {
        window.navigateWithTransition(url);
        return;
    }
    window.location.href = url;
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

    const viewportMargin = 24;
    const listGap = 12;
    const searchRect = form.getBoundingClientRect();
    const spaceBelow = window.innerHeight - searchRect.bottom - viewportMargin;
    const spaceAbove = searchRect.top - viewportMargin;

    const targetHeight = Math.min(300, window.innerHeight * 0.42);
    const belowHeight = Math.max(0, Math.min(targetHeight, spaceBelow - listGap));
    const aboveHeight = Math.max(0, Math.min(targetHeight, spaceAbove - listGap));

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
                navigateTo(`library.html#${slugify(opening)}`);
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
    navigateTo(destination);
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
            navigateTo(`library.html#${slugify(activeSuggestions[activeIndex])}`);
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
let networkRGB = "255, 255, 255";

function updateNetworkPalette() {
    const rootStyles = getComputedStyle(document.documentElement);
    const rgb = rootStyles.getPropertyValue("--network-rgb").trim();
    networkRGB = rgb || "255, 255, 255";
}

function randomIn(min, max) {
    return min + Math.random() * (max - min);
}

function shuffle(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function createEdges(pointCount, closed) {
    const order = shuffle(Array.from({ length: pointCount }, (_, i) => i));
    const used = new Set();
    const edges = [];

    function addEdge(a, b) {
        if (a === b) return false;
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (used.has(key)) return false;
        used.add(key);
        edges.push([a, b]);
        return true;
    }

    for (let i = 0; i < order.length - 1; i++) {
        addEdge(order[i], order[i + 1]);
    }

    if (closed) {
        addEdge(order[order.length - 1], order[0]);
    }

    const extraEdges = closed ? Math.ceil(pointCount * 0.8) : Math.ceil(pointCount * 0.5);
    const first = order[0];
    const last = order[order.length - 1];
    let attempts = 0;
    while (attempts < 80 && edges.length < (pointCount - 1 + (closed ? 1 : 0) + extraEdges)) {
        const a = order[Math.floor(Math.random() * order.length)];
        const b = order[Math.floor(Math.random() * order.length)];
        if (!closed && ((a === first && b === last) || (a === last && b === first))) {
            attempts++;
            continue;
        }
        addEdge(a, b);
        attempts++;
    }

    return edges;
}

function buildClusters() {
    clusters = [];
    const area = width * height;
    const clusterCount = Math.max(18, Math.floor(area / 57500));
    const closeFlags = shuffle([
        ...Array.from({ length: Math.floor(clusterCount / 2) }, () => true),
        ...Array.from({ length: clusterCount - Math.floor(clusterCount / 2) }, () => false)
    ]);

    for (let i = 0; i < clusterCount; i++) {
        const pointCount = 3 + Math.floor(Math.random() * 5);
        const radius = randomIn(36, 64);
        const closed = closeFlags[i];
        const cluster = {
            cx: randomIn(40, Math.max(41, width - 40)),
            cy: randomIn(40, Math.max(41, height - 40)),
            driftX: randomIn(-0.18, 0.18),
            driftY: randomIn(-0.18, 0.18),
            radius,
            closed,
            points: [],
            edges: []
        };

        for (let j = 0; j < pointCount; j++) {
            cluster.points.push({
                angle: randomIn(0, Math.PI * 2),
                angularDrift: randomIn(-0.0025, 0.0025),
                distance: radius * randomIn(0.4, 1.1),
                phase: randomIn(0, Math.PI * 2),
                speed: randomIn(0.003, 0.008),
                offsetX: 0,
                offsetY: 0,
                glow: 0
            });
        }

        cluster.edges = createEdges(pointCount, closed);
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
updateNetworkPalette();
document.addEventListener("themechange", updateNetworkPalette);

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
            point.angle += point.angularDrift;
            const wobble = Math.sin(point.phase) * 4;

            const baseX = cluster.cx + Math.cos(point.angle) * (point.distance + wobble);
            const baseY = cluster.cy + Math.sin(point.angle) * (point.distance + wobble);

            const dx = baseX - pointer.x;
            const dy = baseY - pointer.y;
            const dist = Math.hypot(dx, dy);
            let targetOffsetX = 0;
            let targetOffsetY = 0;
            let targetGlow = 0;
            if (dist < 110 && dist > 0.001) {
                const strength = (1 - dist / 110) * 8;
                targetOffsetX = (dx / dist) * strength;
                targetOffsetY = (dy / dist) * strength;
            }
            if (dist < 150) {
                targetGlow = 1 - dist / 150;
            }

            point.offsetX += (targetOffsetX - point.offsetX) * 0.08;
            point.offsetY += (targetOffsetY - point.offsetY) * 0.08;
            point.glow += (targetGlow - point.glow) * 0.07;

            const x = baseX + point.offsetX;
            const y = baseY + point.offsetY;
            rendered.push({ x, y, glow: point.glow });
        }

        for (const [aIdx, bIdx] of cluster.edges) {
            const a = rendered[aIdx];
            const b = rendered[bIdx];
            const lineGlow = (a.glow + b.glow) / 2;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${networkRGB}, ${0.2 + lineGlow * 0.45})`;
            ctx.lineWidth = 1 + lineGlow * 0.9;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }

        for (const p of rendered) {
            ctx.beginPath();
            ctx.fillStyle = `rgba(${networkRGB}, ${0.72 + p.glow * 0.25})`;
            ctx.arc(p.x, p.y, 1.9 + p.glow * 1.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    requestAnimationFrame(animate);
}

animate();
