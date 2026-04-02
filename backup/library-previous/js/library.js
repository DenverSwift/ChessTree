const OPENING_FILES = [
    "data/openings/alekhine-defense.json",
    "data/openings/bird-opening.json",
    "data/openings/caro-kann-defense.json",
    "data/openings/english-opening.json",
    "data/openings/evans-gambit.json",
    "data/openings/french-defense.json",
    "data/openings/italian-game.json",
    "data/openings/kings-gambit.json",
    "data/openings/nimzo-indian-defense.json",
    "data/openings/pirc-defense.json",
    "data/openings/queens-gambit.json",
    "data/openings/ruy-lopez.json",
    "data/openings/scandinavian-defense.json",
    "data/openings/sicilian-defense.json"
];

const PIECE_IMAGES = {
    P: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
    N: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
    B: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
    R: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
    Q: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
    K: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
    p: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
    n: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
    b: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
    r: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
    q: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
    k: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg"
};

const accountBtn = document.getElementById("accountBtn");
if (accountBtn) {
    accountBtn.addEventListener("click", () => {
        accountBtn.textContent = "Account";
    });
}

const grid = document.getElementById("openingGrid");
const form = document.getElementById("searchForm");
const input = document.getElementById("openingSearch");
const scrollTopBtn = document.getElementById("scrollTopBtn");

let openingsCache = [];
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
    const trimmed = query.toLowerCase().trim();
    if (!trimmed) return openingsCache;

    const scored = openingsCache
        .map((opening) => ({ opening, score: scoreMatch(query, opening.name) }))
        .filter((item) => item.score > 0);

    return scored
        .map((item) => item.opening)
        .sort((a, b) => a.name.localeCompare(b.name));
}

function createRatingDots(value) {
    const wrapper = document.createElement("div");
    wrapper.className = "rating-dots";
    for (let i = 0; i < 5; i += 1) {
        const dot = document.createElement("span");
        dot.className = "rating-dot";
        if (i < value) dot.classList.add("filled");
        wrapper.appendChild(dot);
    }
    return wrapper;
}

function createRatingRow(label, value) {
    const row = document.createElement("div");
    row.className = "rating-row";

    const text = document.createElement("span");
    text.textContent = label;

    row.appendChild(text);
    row.appendChild(createRatingDots(value));
    return row;
}

function createInfoBlock(opening) {
    const info = document.createElement("div");
    info.className = "opening-info";

    const name = document.createElement("h2");
    name.className = "opening-name";
    name.textContent = opening.name;

    const tagline = document.createElement("p");
    tagline.className = "opening-tagline";
    tagline.textContent = opening.tagline;

    info.appendChild(name);
    info.appendChild(tagline);
    info.appendChild(createRatingRow("Difficulty", opening.difficulty));
    info.appendChild(createRatingRow("Popularity", opening.popularity));

    return info;
}

function parseFenPieces(fen) {
    const boardPart = fen.split(" ")[0];
    const rows = boardPart.split("/");
    const pieceMap = new Map();

    for (let row = 0; row < 8; row += 1) {
        let file = 0;
        const rowData = rows[row] || "";
        for (const char of rowData) {
            if (/\d/.test(char)) {
                file += Number.parseInt(char, 10);
            } else {
                pieceMap.set(`${row}-${file}`, char);
                file += 1;
            }
        }
    }

    return pieceMap;
}

function buildBoard(container, fen) {
    const pieceMap = parseFenPieces(fen);
    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            const square = document.createElement("div");
            square.className = "board-square";
            square.classList.add((row + col) % 2 === 0 ? "dark" : "light");

            const pieceKey = `${row}-${col}`;
            const pieceCode = pieceMap.get(pieceKey);
            if (pieceCode && PIECE_IMAGES[pieceCode]) {
                const img = document.createElement("img");
                img.className = "board-piece";
                img.src = PIECE_IMAGES[pieceCode];
                img.alt = "";
                img.loading = "lazy";
                square.appendChild(img);
            }

            container.appendChild(square);
        }
    }
}

function createOpeningCard(opening) {
    const card = document.createElement("article");
    card.className = "opening-card";
    card.id = slugify(opening.name);

    const board = document.createElement("div");
    board.className = "opening-board";
    buildBoard(board, opening.fen);

    const info = createInfoBlock(opening);

    card.appendChild(board);
    card.appendChild(info);

    const hover = document.createElement("div");
    hover.className = "opening-card__hover";

    const hoverSpacer = document.createElement("div");
    const hoverBody = document.createElement("div");
    hoverBody.className = "opening-hover-body";

    const hoverInfo = createInfoBlock(opening);
    const actions = document.createElement("div");
    actions.className = "opening-actions";

    const practiceBtn = document.createElement("button");
    practiceBtn.type = "button";
    practiceBtn.textContent = "Practice";

    const learnBtn = document.createElement("button");
    learnBtn.type = "button";
    learnBtn.textContent = "Learn";

    actions.appendChild(practiceBtn);
    actions.appendChild(learnBtn);

    hoverBody.appendChild(hoverInfo);
    hoverBody.appendChild(actions);

    hover.appendChild(hoverSpacer);
    hover.appendChild(hoverBody);
    card.appendChild(hover);

    return card;
}

function renderOpenings(openings) {
    grid.innerHTML = "";
    if (!openings.length) {
        const empty = document.createElement("p");
        empty.textContent = "No openings found.";
        grid.appendChild(empty);
        return;
    }

    for (const opening of openings) {
        grid.appendChild(createOpeningCard(opening));
    }
}

async function loadOpenings() {
    const results = await Promise.all(
        OPENING_FILES.map(async (file) => {
            try {
                const response = await fetch(file);
                if (!response.ok) return null;
                return await response.json();
            } catch (_error) {
                return null;
            }
        })
    );

    openingsCache = results.filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
    renderOpenings(openingsCache);
}

function setupSearch() {
    if (!form || !input) return;

    input.addEventListener("input", () => {
        renderOpenings(getMatches(input.value));
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        renderOpenings(getMatches(input.value));
    });
}

function setupScrollTop() {
    if (!scrollTopBtn) return;

    function updateVisibility() {
        if (window.scrollY > 240) {
            scrollTopBtn.classList.add("visible");
        } else {
            scrollTopBtn.classList.remove("visible");
        }
    }

    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();
}

function setupNetworkBackground() {
    const canvas = document.getElementById("bg-network");
    if (!canvas) return;

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
        for (let i = arr.length - 1; i > 0; i -= 1) {
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

        for (let i = 0; i < order.length - 1; i += 1) {
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
                attempts += 1;
                continue;
            }
            addEdge(a, b);
            attempts += 1;
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

        for (let i = 0; i < clusterCount; i += 1) {
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

            for (let j = 0; j < pointCount; j += 1) {
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
}

loadOpenings().then(() => {
    setupSearch();
    setupScrollTop();
    setupNetworkBackground();
});
