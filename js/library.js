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

const LIBRARY_METADATA_FILE = "data/openings/library-metadata.json";
const LICHESS_OPENING_STATS_FILE = "data/openings/lichess-opening-stats.json";
const OPENING_PAGE_URL = "opening.html";
const FAVORITES_STORAGE_KEY = "chess_tree_favorites";

const SIDE_ORDER = ["white", "black"];
const FIRST_MOVE_ORDER = ["king-pawn", "queen-pawn", "flank", "irregular"];
const FIRST_MOVE_LABELS = {
    "king-pawn": "King's Pawn",
    "queen-pawn": "Queen's Pawn",
    flank: "Flank Opening",
    irregular: "Irregular"
};
const SIDE_ICONS = { white: "\u2654", black: "\u265A" };
const FIRST_MOVE_ICONS = {
    "king-pawn": "\u2654",
    "queen-pawn": "\u2655",
    flank: "\u2659",
    irregular: "\u2658"
};

const DIFFICULTY_MIN = 1;
const DIFFICULTY_MAX = 5;
const POPULARITY_MIN = 1;
const POPULARITY_MAX = 5;
const ELO_MIN_BOUND = 100;
const ELO_MAX_BOUND = 2400;
const ELO_STEP = 100;
const SORT_OPTIONS = [
    { value: "popularity-desc", label: "Popularity: high to low" },
    { value: "popularity-asc", label: "Popularity: low to high" },
    { value: "difficulty-desc", label: "Difficulty: high to low" },
    { value: "difficulty-asc", label: "Difficulty: low to high" },
    { value: "elo-desc", label: "Elo: high to low" },
    { value: "elo-asc", label: "Elo: low to high" }
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

const state = {
    search: "",
    sort: "popularity-desc",
    filters: {
        favoritesOnly: false,
        side: "",
        firstMoveType: "",
        difficultyMin: DIFFICULTY_MIN,
        difficultyMax: DIFFICULTY_MAX,
        eloMin: ELO_MIN_BOUND,
        eloMax: ELO_MAX_BOUND
    }
};

const dataState = {
    all: [],
    filtered: [],
    options: {
        side: [""],
        firstMoveType: ["", ...FIRST_MOVE_ORDER]
    }
};

const favoriteState = {
    ids: new Set()
};

const drawerState = { isOpen: false, returnFocusEl: null };
const sortMenuState = { isOpen: false };
const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rowRevealState = {
    observer: null,
    timers: new Set()
};

const elements = {
    searchForm: document.getElementById("searchForm"),
    searchInput: document.getElementById("searchInput"),
    searchClear: document.getElementById("searchClear"),
    filtersTrigger: document.getElementById("filtersTrigger"),
    filtersActiveCount: document.getElementById("filtersActiveCount"),
    sortControl: document.querySelector(".sort-control"),
    sortTrigger: document.getElementById("sortTrigger"),
    sortCurrent: document.getElementById("sortCurrent"),
    sortMenu: document.getElementById("sortMenu"),
    sortSelect: document.getElementById("sortSelect"),
    favoritesFilters: document.getElementById("favoritesFilters"),
    sideFilters: document.getElementById("sideFilters"),
    firstMoveFilters: document.getElementById("firstMoveFilters"),
    difficultyRangeLabel: document.getElementById("difficultyRangeLabel"),
    difficultyMin: document.getElementById("difficultyMin"),
    difficultyMax: document.getElementById("difficultyMax"),
    difficultyRangeWrap: document.querySelector(".dual-range--difficulty"),
    difficultyTrackFill: document.getElementById("difficultyTrackFill"),
    eloRangeLabel: document.getElementById("eloRangeLabel"),
    eloMin: document.getElementById("eloMin"),
    eloMax: document.getElementById("eloMax"),
    eloRangeWrap: document.querySelector(".dual-range--elo"),
    eloTrackFill: document.getElementById("eloTrackFill"),
    rows: document.getElementById("rows"),
    emptyState: document.getElementById("emptyState"),
    resultsCount: document.getElementById("resultsCount"),
    activeChips: document.getElementById("activeChips"),
    filterBackdrop: document.getElementById("filterBackdrop"),
    filterDrawer: document.getElementById("filterDrawer"),
    drawerClose: document.getElementById("drawerClose"),
    drawerDone: document.getElementById("drawerDone"),
    drawerReset: document.getElementById("drawerReset"),
    scrollTopButton: document.getElementById("scrollTopButton")
};

function slugify(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function normalizeText(value, fallback = "") {
    const normalized = String(value || "").trim();
    return normalized || fallback;
}

function normalizeSide(value) {
    const normalized = normalizeText(value).toLowerCase();
    if (normalized === "white" || normalized === "black") return normalized;
    return "";
}

function mapDifficultyLabelToLevel(value) {
    const normalized = normalizeText(value).toLowerCase();
    if (normalized.includes("beginner")) return 1;
    if (normalized.includes("basic")) return 2;
    if (normalized.includes("intermediate")) return 3;
    if (normalized.includes("advanced")) return 4;
    if (normalized.includes("expert")) return 5;
    return 3;
}

function normalizeDifficultyLevel(rawLevel, rawLabel) {
    const numeric = Number.parseInt(rawLevel, 10);
    if (Number.isFinite(numeric)) return clamp(numeric, DIFFICULTY_MIN, DIFFICULTY_MAX);
    return clamp(mapDifficultyLabelToLevel(rawLabel), DIFFICULTY_MIN, DIFFICULTY_MAX);
}

function normalizePopularityLevel(rawLevel) {
    const numeric = Number.parseInt(rawLevel, 10);
    if (!Number.isFinite(numeric)) return 3;
    return clamp(numeric, POPULARITY_MIN, POPULARITY_MAX);
}

function inferFirstMoveType(openingType, openingName) {
    const type = normalizeText(openingType).toLowerCase();
    const name = normalizeText(openingName).toLowerCase();
    if (type.includes("king pawn")) return "king-pawn";
    if (type.includes("queen pawn")) return "queen-pawn";
    if (type.includes("flank")) return "flank";
    if (name.includes("english") || name.includes("bird")) return "flank";
    if (name.includes("queen")) return "queen-pawn";
    if (name.includes("sicilian") || name.includes("french") || name.includes("caro") || name.includes("pirc")) return "king-pawn";
    return "irregular";
}

function normalizeFirstMoveType(value, openingType, openingName) {
    const normalized = normalizeText(value).toLowerCase();
    if (FIRST_MOVE_ORDER.includes(normalized)) return normalized;
    return inferFirstMoveType(openingType, openingName);
}

function getDefaultEloRange(difficultyLevel) {
    if (difficultyLevel <= 1) return { min: 100, max: 1000 };
    if (difficultyLevel === 2) return { min: 600, max: 1600 };
    if (difficultyLevel === 3) return { min: 900, max: 1900 };
    if (difficultyLevel === 4) return { min: 1200, max: 2200 };
    return { min: 1500, max: 2400 };
}

function normalizeEloRange(rawMin, rawMax, difficultyLevel) {
    const fallback = getDefaultEloRange(difficultyLevel);
    let min = Number.parseInt(rawMin, 10);
    let max = Number.parseInt(rawMax, 10);
    if (!Number.isFinite(min)) min = fallback.min;
    if (!Number.isFinite(max)) max = fallback.max;
    min = clamp(Math.round(min / ELO_STEP) * ELO_STEP, ELO_MIN_BOUND, ELO_MAX_BOUND);
    max = clamp(Math.round(max / ELO_STEP) * ELO_STEP, ELO_MIN_BOUND, ELO_MAX_BOUND);
    if (max < min) [min, max] = [max, min];
    return { min, max };
}

function getSideLabel(side) {
    if (side === "white") return "White";
    if (side === "black") return "Black";
    return "Unknown";
}

function getSideIcon(side) {
    return SIDE_ICONS[side] || "\u265F";
}

function getFirstMoveLabel(type) {
    return FIRST_MOVE_LABELS[type] || "Irregular";
}

function getFirstMoveIcon(type) {
    return FIRST_MOVE_ICONS[type] || "\u2658";
}

function getDifficultyLevelTone(level) {
    return `level-${clamp(level, DIFFICULTY_MIN, DIFFICULTY_MAX)}`;
}

function getOpeningEloScore(opening) {
    return (opening.recommendedEloMin + opening.recommendedEloMax) / 2;
}

function formatEloValue(value, withPlus = false) {
    if (withPlus && value >= ELO_MAX_BOUND) return `${value}+`;
    return String(value);
}

function navigateTo(url) {
    if (typeof window.navigateWithTransition === "function") {
        window.navigateWithTransition(url);
        return;
    }
    window.location.href = url;
}

function clearRowRevealTimers() {
    rowRevealState.timers.forEach((timerId) => window.clearTimeout(timerId));
    rowRevealState.timers.clear();
}

function ensureRowRevealObserver() {
    if (rowRevealState.observer) return rowRevealState.observer;
    if (prefersReducedMotion) return null;
    if (typeof window.IntersectionObserver !== "function") return null;

    rowRevealState.observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const row = entry.target;
            observer.unobserve(row);

            const rawDelay = Number.parseInt(row.getAttribute("data-reveal-delay") || "0", 10);
            const revealDelay = Number.isFinite(rawDelay) ? Math.max(0, rawDelay) : 0;

            if (revealDelay > 0) {
                const timerId = window.setTimeout(() => {
                    row.classList.add("is-revealed");
                    rowRevealState.timers.delete(timerId);
                }, revealDelay);
                rowRevealState.timers.add(timerId);
                return;
            }

            row.classList.add("is-revealed");
        });
    }, {
        root: null,
        rootMargin: "0px 0px -2% 0px",
        threshold: 0.05
    });

    return rowRevealState.observer;
}

function observeRowReveal(row) {
    const observer = ensureRowRevealObserver();
    if (!observer) {
        row.classList.add("is-revealed");
        return;
    }
    observer.observe(row);
}

function getSortLabel(sortValue) {
    return SORT_OPTIONS.find((option) => option.value === sortValue)?.label || SORT_OPTIONS[0].label;
}

function loadFavoriteIds() {
    try {
        const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;
        favoriteState.ids = new Set(parsed.map((item) => String(item).trim()).filter(Boolean));
    } catch (_error) {
        favoriteState.ids = new Set();
    }
}

function saveFavoriteIds() {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favoriteState.ids)));
    } catch (_error) {
        // Ignore storage errors (private mode / quota)
    }
}

function isFavorite(openingId) {
    return favoriteState.ids.has(String(openingId));
}

function setFavorite(openingId, nextState) {
    const id = String(openingId);
    if (nextState) {
        favoriteState.ids.add(id);
    } else {
        favoriteState.ids.delete(id);
    }
    saveFavoriteIds();
}

function getEventElementTarget(event) {
    const target = event.target;
    if (target && target.nodeType === 1) return target;
    if (target && target.nodeType === 3 && target.parentElement) return target.parentElement;
    return null;
}

function uniqueSorted(items, order = []) {
    const unique = [...new Set(items.filter(Boolean))];
    if (!order.length) return unique.sort((a, b) => a.localeCompare(b));
    const ordered = unique.filter((item) => order.includes(item)).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const rest = unique.filter((item) => !order.includes(item)).sort((a, b) => a.localeCompare(b));
    return [...ordered, ...rest];
}

async function loadJson(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) return null;
        return await response.json();
    } catch (_error) {
        return null;
    }
}

async function loadLibraryMetadata() {
    const metadata = await loadJson(LIBRARY_METADATA_FILE);
    if (!metadata || typeof metadata !== "object") return {};
    return metadata;
}

async function loadOpeningStats() {
    const payload = await loadJson(LICHESS_OPENING_STATS_FILE);
    if (!payload || typeof payload !== "object") return {};

    const openingsRaw = payload.openings && typeof payload.openings === "object" ? payload.openings : payload;
    const byId = {};

    Object.entries(openingsRaw).forEach(([openingId, value]) => {
        if (!openingId || openingId.startsWith("_")) return;
        if (!value || typeof value !== "object") return;

        const popularityLevel = Number.parseInt(value.popularityLevel, 10);
        const recommendedEloMin = Number.parseInt(value.recommendedEloMin, 10);
        const recommendedEloMax = Number.parseInt(value.recommendedEloMax, 10);

        byId[openingId] = {
            popularityLevel: Number.isFinite(popularityLevel) ? clamp(popularityLevel, POPULARITY_MIN, POPULARITY_MAX) : null,
            recommendedEloMin: Number.isFinite(recommendedEloMin) ? recommendedEloMin : null,
            recommendedEloMax: Number.isFinite(recommendedEloMax) ? recommendedEloMax : null
        };
    });

    return byId;
}

function normalizeOpening(rawOpening, metadataById, statsById = {}) {
    const name = normalizeText(rawOpening?.name);
    if (!name) return null;

    const id = normalizeText(rawOpening?.id, slugify(name));
    const metadata = metadataById[id] || {};
    const stats = statsById[id] || {};
    const openingType = normalizeText(rawOpening?.openingType, "Irregular");
    const side = normalizeSide(rawOpening?.side);
    const difficultyLevel = normalizeDifficultyLevel(
        metadata.difficultyLevel ?? rawOpening?.difficultyLevel ?? rawOpening?.difficulty,
        rawOpening?.difficultyLabel
    );
    const popularityLevel = normalizePopularityLevel(
        stats.popularityLevel ?? metadata.popularityLevel ?? rawOpening?.popularityLevel ?? rawOpening?.popularity
    );
    const firstMoveType = normalizeFirstMoveType(
        metadata.firstMoveType ?? rawOpening?.firstMoveType,
        openingType,
        name
    );
    const eloRange = normalizeEloRange(
        stats.recommendedEloMin ?? metadata.recommendedEloMin ?? rawOpening?.recommendedEloMin,
        stats.recommendedEloMax ?? metadata.recommendedEloMax ?? rawOpening?.recommendedEloMax,
        difficultyLevel
    );

    return {
        id,
        slug: slugify(name),
        name,
        side,
        openingType,
        firstMoveType,
        difficultyLevel,
        popularityLevel,
        recommendedEloMin: eloRange.min,
        recommendedEloMax: eloRange.max,
        fen: normalizeText(rawOpening?.fen)
    };
}

async function loadOpenings(metadataById, statsById) {
    const rawOpenings = await Promise.all(OPENING_FILES.map(loadJson));
    return rawOpenings
        .filter(Boolean)
        .map((opening) => normalizeOpening(opening, metadataById, statsById))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));
}

function buildOptions(openings) {
    const side = ["", ...uniqueSorted(openings.map((item) => item.side), SIDE_ORDER)];
    const firstMoveType = ["", ...uniqueSorted(openings.map((item) => item.firstMoveType), FIRST_MOVE_ORDER)];
    return { side, firstMoveType };
}

function parseFEN(fen) {
    const boardPart = String(fen || "").split(" ")[0];
    const rows = boardPart.split("/");
    const matrix = [];

    for (let rowIndex = 0; rowIndex < 8; rowIndex += 1) {
        const row = [];
        const sourceRow = rows[rowIndex] || "";

        for (const char of sourceRow) {
            if (/\d/.test(char)) {
                const count = Number(char);
                for (let i = 0; i < count; i += 1) row.push(null);
            } else {
                row.push(char);
            }
        }

        while (row.length < 8) row.push(null);
        matrix.push(row.slice(0, 8));
    }

    return matrix;
}

function createBoard(fen, perspectiveSide) {
    const wrap = document.createElement("div");
    wrap.className = "thumb";

    const board = document.createElement("div");
    board.className = "board";

    const matrix = parseFEN(fen);
    const isBlackPerspective = perspectiveSide === "black";
    if (isBlackPerspective) {
        board.classList.add("board--black-perspective");
    }

    for (let displayRow = 0; displayRow < 8; displayRow += 1) {
        for (let displayCol = 0; displayCol < 8; displayCol += 1) {
            const sourceRow = isBlackPerspective ? 7 - displayRow : displayRow;
            const sourceCol = isBlackPerspective ? 7 - displayCol : displayCol;

            const square = document.createElement("div");
            square.className = `board-square ${((displayRow + displayCol) % 2 === 0) ? "dark" : "light"}`;

            const pieceCode = matrix[sourceRow]?.[sourceCol];
            if (pieceCode && PIECE_IMAGES[pieceCode]) {
                const image = document.createElement("img");
                image.className = "board-piece";
                image.src = PIECE_IMAGES[pieceCode];
                image.alt = "";
                image.loading = "lazy";
                square.appendChild(image);
            }

            board.appendChild(square);
        }
    }

    wrap.appendChild(board);
    return wrap;
}

function createSegmentScale({ minLevel = 1, maxLevel = 5, total = 5, ariaLabel, variant, toneLevel = maxLevel }) {
    const scale = document.createElement("div");
    scale.className = `level-scale level-scale--${variant}`;
    scale.dataset.tone = getDifficultyLevelTone(toneLevel);
    scale.setAttribute("role", "img");
    scale.setAttribute("aria-label", ariaLabel);

    for (let level = 1; level <= total; level += 1) {
        const item = document.createElement("span");
        item.className = "level-scale__segment";
        if (level >= minLevel && level <= maxLevel) {
            item.classList.add("is-active");
        }
        scale.appendChild(item);
    }

    return scale;
}

function createMetaItem(label, valueNode) {
    const item = document.createElement("div");
    item.className = "meta-item";

    const labelEl = document.createElement("span");
    labelEl.className = "meta-label";
    labelEl.textContent = label;

    const valueWrap = document.createElement("div");
    valueWrap.className = "meta-value";
    valueWrap.appendChild(valueNode);

    item.appendChild(labelEl);
    item.appendChild(valueWrap);
    return item;
}

function createIconTextValue(icon, text, extraClass = "") {
    const wrap = document.createElement("span");
    wrap.className = `meta-inline${extraClass ? ` ${extraClass}` : ""}`;

    const iconEl = document.createElement("span");
    iconEl.className = "meta-inline__icon";
    iconEl.textContent = icon;
    iconEl.setAttribute("aria-hidden", "true");

    const textEl = document.createElement("span");
    textEl.textContent = text;

    wrap.appendChild(iconEl);
    wrap.appendChild(textEl);
    return wrap;
}

function createDifficultyScale(level) {
    return createSegmentScale({
        minLevel: 1,
        maxLevel: level,
        total: 5,
        ariaLabel: `Difficulty ${level} out of 5`,
        variant: "difficulty",
        toneLevel: level
    });
}

function createPopularityScale(level, toneLevel = level) {
    return createSegmentScale({
        minLevel: 1,
        maxLevel: level,
        total: 5,
        ariaLabel: `Popularity ${level} out of 5`,
        variant: "popularity",
        toneLevel
    });
}

function createEloSuitabilityBar(opening) {
    const wrapper = document.createElement("div");
    wrapper.className = "elo-suitability";
    wrapper.setAttribute("aria-label", `Recommended Elo from ${opening.recommendedEloMin} to ${opening.recommendedEloMax}`);

    const label = document.createElement("div");
    label.className = "elo-suitability__label";
    label.textContent = "Elo suitability";

    const trackRow = document.createElement("div");
    trackRow.className = "elo-suitability__track-row";

    const minScale = document.createElement("span");
    minScale.className = "elo-suitability__scale-value";
    minScale.textContent = String(ELO_MIN_BOUND);

    const track = document.createElement("div");
    track.className = "elo-suitability__track";

    const fill = document.createElement("div");
    fill.className = "elo-suitability__fill";
    const fullRange = ELO_MAX_BOUND - ELO_MIN_BOUND;
    const start = ((opening.recommendedEloMin - ELO_MIN_BOUND) / fullRange) * 100;
    const end = ((opening.recommendedEloMax - ELO_MIN_BOUND) / fullRange) * 100;
    fill.style.left = `${clamp(start, 0, 100)}%`;
    fill.style.width = `${clamp(end - start, 2, 100)}%`;
    track.appendChild(fill);

    const maxScale = document.createElement("span");
    maxScale.className = "elo-suitability__scale-value";
    maxScale.textContent = `${ELO_MAX_BOUND}+`;

    trackRow.appendChild(minScale);
    trackRow.appendChild(track);
    trackRow.appendChild(maxScale);

    const selected = document.createElement("div");
    selected.className = "elo-suitability__selected";
    selected.textContent = `${formatEloValue(opening.recommendedEloMin)} - ${formatEloValue(opening.recommendedEloMax, true)}`;

    wrapper.appendChild(label);
    wrapper.appendChild(trackRow);
    wrapper.appendChild(selected);
    return wrapper;
}

function createFavouriteButton(opening) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "opening-favourite";

    const active = isFavorite(opening.id);
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-label", active ? `Remove ${opening.name} from favourites` : `Add ${opening.name} to favourites`);
    button.setAttribute("aria-pressed", active ? "true" : "false");

    button.innerHTML = `
        <svg class="opening-favourite__icon" viewBox="0 0 44 43" fill="none" aria-hidden="true">
            <path class="opening-favourite__shape" d="M22 2L28.18 14.52L42 16.54L32 26.28L34.36 40.04L22 33.54L9.64 40.04L12 26.28L2 16.54L15.82 14.52L22 2Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
    `;

    const toggle = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setFavorite(opening.id, !isFavorite(opening.id));
        renderAll();
    };

    button.addEventListener("click", toggle);
    button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            toggle(event);
        }
    });

    return button;
}

function createOpeningCard(opening, index) {
    const row = document.createElement("article");
    row.className = "opening-row";
    row.classList.add(`opening-row--lvl-${opening.difficultyLevel}`);
    row.setAttribute("data-reveal-delay", String(Math.min(index * 18, 90)));
    row.id = opening.slug;
    row.tabIndex = 0;
    row.setAttribute("role", "link");
    row.setAttribute(
        "aria-label",
        `${opening.name}. Side ${getSideLabel(opening.side)}. First move ${getFirstMoveLabel(opening.firstMoveType)}. Difficulty ${opening.difficultyLevel} out of 5. Popularity ${opening.popularityLevel} out of 5. Recommended Elo ${opening.recommendedEloMin}-${opening.recommendedEloMax}. Favourite ${isFavorite(opening.id) ? "yes" : "no"}.`
    );

    row.appendChild(createFavouriteButton(opening));
    row.appendChild(createBoard(opening.fen, opening.side));

    const body = document.createElement("div");
    body.className = "opening-body";

    const name = document.createElement("h2");
    name.className = "opening-name";
    name.textContent = opening.name;

    const metaGrid = document.createElement("div");
    metaGrid.className = "opening-meta-grid";

    metaGrid.appendChild(
        createMetaItem(
            "First move",
            createIconTextValue(getFirstMoveIcon(opening.firstMoveType), getFirstMoveLabel(opening.firstMoveType))
        )
    );
    metaGrid.appendChild(
        createMetaItem(
            "Side",
            createIconTextValue(getSideIcon(opening.side), getSideLabel(opening.side), "meta-side")
        )
    );
    metaGrid.appendChild(createMetaItem("Difficulty", createDifficultyScale(opening.difficultyLevel)));
    metaGrid.appendChild(createMetaItem("Popularity", createPopularityScale(opening.popularityLevel, opening.difficultyLevel)));

    body.appendChild(name);
    body.appendChild(metaGrid);

    row.appendChild(body);
    row.appendChild(createEloSuitabilityBar(opening));

    row.addEventListener("click", () => {
        navigateTo(`${OPENING_PAGE_URL}?id=${encodeURIComponent(opening.id)}`);
    });

    row.addEventListener("keydown", (event) => {
        if (event.target !== row) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            row.click();
        }
    });

    return row;
}

function applySearchFilter(opening, query) {
    if (!query) return true;
    return (opening.name || "").toLowerCase().includes(query);
}

function applyFilters(opening) {
    const filters = state.filters;
    if (filters.favoritesOnly && !isFavorite(opening.id)) return false;
    if (filters.side && opening.side !== filters.side) return false;
    if (filters.firstMoveType && opening.firstMoveType !== filters.firstMoveType) return false;
    if (opening.difficultyLevel < filters.difficultyMin || opening.difficultyLevel > filters.difficultyMax) return false;
    return opening.recommendedEloMax >= filters.eloMin && opening.recommendedEloMin <= filters.eloMax;
}

function sortOpenings(items) {
    const sortValue = state.sort;
    const sorted = [...items];

    sorted.sort((a, b) => {
        let result = 0;

        if (sortValue === "popularity-desc") {
            result = b.popularityLevel - a.popularityLevel;
        } else if (sortValue === "popularity-asc") {
            result = a.popularityLevel - b.popularityLevel;
        } else if (sortValue === "difficulty-desc") {
            result = b.difficultyLevel - a.difficultyLevel;
        } else if (sortValue === "difficulty-asc") {
            result = a.difficultyLevel - b.difficultyLevel;
        } else if (sortValue === "elo-desc") {
            result = getOpeningEloScore(b) - getOpeningEloScore(a);
        } else if (sortValue === "elo-asc") {
            result = getOpeningEloScore(a) - getOpeningEloScore(b);
        }

        if (result !== 0) return result;
        return a.name.localeCompare(b.name);
    });

    return sorted;
}

function filterOpenings() {
    const query = state.search.toLowerCase().trim();
    const filtered = dataState.all.filter((opening) => applyFilters(opening) && applySearchFilter(opening, query));
    return sortOpenings(filtered);
}

function renderRows(items) {
    if (!elements.rows || !elements.emptyState) return;
    clearRowRevealTimers();
    if (rowRevealState.observer) {
        rowRevealState.observer.disconnect();
    }
    elements.rows.innerHTML = "";
    items.forEach((opening, index) => {
        const row = createOpeningCard(opening, index);
        elements.rows.appendChild(row);
        observeRowReveal(row);
    });
    elements.emptyState.hidden = items.length > 0;
}

function renderResultsCount() {
    if (!elements.resultsCount) return;
    const total = dataState.all.length;
    const visible = dataState.filtered.length;
    elements.resultsCount.textContent = visible === total ? `${visible} results` : `${visible} of ${total} results`;
}

function isDifficultyDefault() {
    return state.filters.difficultyMin === DIFFICULTY_MIN && state.filters.difficultyMax === DIFFICULTY_MAX;
}

function isEloDefault() {
    return state.filters.eloMin === ELO_MIN_BOUND && state.filters.eloMax === ELO_MAX_BOUND;
}

function createChip(label, onRemove) {
    const chip = document.createElement("span");
    chip.className = "chip";

    const text = document.createElement("span");
    text.textContent = label;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove filter ${label}`);
    remove.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        </svg>
    `;
    remove.addEventListener("click", onRemove);

    chip.appendChild(text);
    chip.appendChild(remove);
    return chip;
}

function clearAllFilters() {
    state.filters.favoritesOnly = false;
    state.filters.side = "";
    state.filters.firstMoveType = "";
    state.filters.difficultyMin = DIFFICULTY_MIN;
    state.filters.difficultyMax = DIFFICULTY_MAX;
    state.filters.eloMin = ELO_MIN_BOUND;
    state.filters.eloMax = ELO_MAX_BOUND;
}

function renderActiveChips() {
    if (!elements.activeChips) return;
    elements.activeChips.innerHTML = "";
    const chips = [];

    if (state.filters.favoritesOnly) {
        chips.push(createChip("Favourites", () => {
            state.filters.favoritesOnly = false;
            renderAll();
        }));
    }

    if (state.filters.side) {
        chips.push(createChip(getSideLabel(state.filters.side), () => {
            state.filters.side = "";
            renderAll();
        }));
    }

    if (state.filters.firstMoveType) {
        chips.push(createChip(getFirstMoveLabel(state.filters.firstMoveType), () => {
            state.filters.firstMoveType = "";
            renderAll();
        }));
    }

    if (!isDifficultyDefault()) {
        chips.push(createChip(`Difficulty ${state.filters.difficultyMin}-${state.filters.difficultyMax}`, () => {
            state.filters.difficultyMin = DIFFICULTY_MIN;
            state.filters.difficultyMax = DIFFICULTY_MAX;
            renderAll();
        }));
    }

    if (!isEloDefault()) {
        chips.push(createChip(`Elo ${state.filters.eloMin}-${state.filters.eloMax}`, () => {
            state.filters.eloMin = ELO_MIN_BOUND;
            state.filters.eloMax = ELO_MAX_BOUND;
            renderAll();
        }));
    }

    chips.forEach((chip) => elements.activeChips.appendChild(chip));

    if (chips.length) {
        const reset = document.createElement("button");
        reset.type = "button";
        reset.className = "chips-reset";
        reset.textContent = "Reset all";
        reset.addEventListener("click", () => {
            clearAllFilters();
            renderAll();
        });
        elements.activeChips.appendChild(reset);
    }
}

function createFilterButtons(container, options, key, labelMap = {}) {
    if (!container) return;
    container.innerHTML = "";

    options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "filter-option";
        button.textContent = labelMap[option] || option || "All";

        if (state.filters[key] === option) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {
            state.filters[key] = state.filters[key] === option ? "" : option;
            renderAll();
        });

        container.appendChild(button);
    });
}

function renderFavoritesFilter() {
    if (!elements.favoritesFilters) return;
    elements.favoritesFilters.innerHTML = "";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-option filter-option--favourites";
    button.textContent = "★ Favourites only";
    if (state.filters.favoritesOnly) {
        button.classList.add("active");
    }

    button.addEventListener("click", () => {
        state.filters.favoritesOnly = !state.filters.favoritesOnly;
        renderAll();
    });

    elements.favoritesFilters.appendChild(button);
}

function renderFilters() {
    renderFavoritesFilter();

    createFilterButtons(elements.sideFilters, dataState.options.side, "side", {
        "": "All",
        white: "\u2654 White",
        black: "\u265A Black"
    });

    createFilterButtons(elements.firstMoveFilters, dataState.options.firstMoveType, "firstMoveType", {
        "": "All",
        "king-pawn": "\u2654 King's Pawn",
        "queen-pawn": "\u2655 Queen's Pawn",
        flank: "\u2659 Flank Opening",
        irregular: "\u2658 Irregular"
    });
}

function updateDifficultyTrackFill() {
    if (!elements.difficultyTrackFill) return;
    const range = DIFFICULTY_MAX - DIFFICULTY_MIN;
    const start = ((state.filters.difficultyMin - DIFFICULTY_MIN) / range) * 100;
    const end = ((state.filters.difficultyMax - DIFFICULTY_MIN) / range) * 100;
    elements.difficultyTrackFill.style.left = `${clamp(start, 0, 100)}%`;
    elements.difficultyTrackFill.style.width = `${clamp(end - start, 2, 100)}%`;
    elements.difficultyTrackFill.dataset.tone = getDifficultyLevelTone(state.filters.difficultyMax);
}

function updateEloTrackFill() {
    if (!elements.eloTrackFill) return;
    const range = ELO_MAX_BOUND - ELO_MIN_BOUND;
    const start = ((state.filters.eloMin - ELO_MIN_BOUND) / range) * 100;
    const end = ((state.filters.eloMax - ELO_MIN_BOUND) / range) * 100;
    elements.eloTrackFill.style.left = `${clamp(start, 0, 100)}%`;
    elements.eloTrackFill.style.width = `${clamp(end - start, 2, 100)}%`;
}

function updateRangeUI() {
    if (elements.difficultyMin) elements.difficultyMin.value = String(state.filters.difficultyMin);
    if (elements.difficultyMax) elements.difficultyMax.value = String(state.filters.difficultyMax);
    if (elements.difficultyRangeLabel) elements.difficultyRangeLabel.textContent = `${state.filters.difficultyMin} - ${state.filters.difficultyMax}`;
    updateDifficultyTrackFill();
    if (elements.difficultyRangeWrap) {
        elements.difficultyRangeWrap.classList.toggle("is-overlap", state.filters.difficultyMin === state.filters.difficultyMax);
    }

    if (elements.eloMin) elements.eloMin.value = String(state.filters.eloMin);
    if (elements.eloMax) elements.eloMax.value = String(state.filters.eloMax);
    if (elements.eloRangeLabel) elements.eloRangeLabel.textContent = `${state.filters.eloMin} - ${formatEloValue(state.filters.eloMax, true)}`;
    updateEloTrackFill();
    if (elements.eloRangeWrap) {
        elements.eloRangeWrap.classList.toggle("is-overlap", state.filters.eloMin === state.filters.eloMax);
    }
}

function getActiveFilterCount() {
    let count = 0;
    if (state.filters.favoritesOnly) count += 1;
    if (state.filters.side) count += 1;
    if (state.filters.firstMoveType) count += 1;
    if (!isDifficultyDefault()) count += 1;
    if (!isEloDefault()) count += 1;
    return count;
}

function updateFilterTriggerState() {
    if (!elements.filtersActiveCount) return;
    const count = getActiveFilterCount();
    elements.filtersActiveCount.textContent = String(count);
    elements.filtersActiveCount.hidden = count === 0;
}

function updateSearchClear() {
    if (!elements.searchClear) return;
    elements.searchClear.classList.toggle("is-visible", Boolean(state.search.trim()));
}

function updateSortUI() {
    if (elements.sortSelect) {
        elements.sortSelect.value = state.sort;
    }

    if (elements.sortCurrent) {
        elements.sortCurrent.textContent = getSortLabel(state.sort);
    }

    if (!elements.sortMenu) return;
    const options = Array.from(elements.sortMenu.querySelectorAll(".sort-option"));
    options.forEach((button) => {
        const isActive = button.dataset.value === state.sort;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
    });
}

function closeSortMenu({ restoreFocus = false } = {}) {
    sortMenuState.isOpen = false;
    if (elements.sortMenu) {
        elements.sortMenu.hidden = true;
        elements.sortMenu.classList.remove("is-open");
    }
    if (elements.sortTrigger) {
        elements.sortTrigger.setAttribute("aria-expanded", "false");
        if (restoreFocus) elements.sortTrigger.focus();
    }
}

function openSortMenu() {
    if (!elements.sortMenu || !elements.sortTrigger) return;
    sortMenuState.isOpen = true;
    elements.sortMenu.hidden = false;
    elements.sortMenu.classList.add("is-open");
    elements.sortTrigger.setAttribute("aria-expanded", "true");
}

function toggleSortMenu() {
    if (sortMenuState.isOpen) {
        closeSortMenu({ restoreFocus: false });
    } else {
        openSortMenu();
    }
}

function renderSortMenu() {
    if (!elements.sortMenu) return;
    elements.sortMenu.innerHTML = "";

    SORT_OPTIONS.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "sort-option";
        button.dataset.value = option.value;
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", option.value === state.sort ? "true" : "false");
        button.textContent = option.label;

        if (option.value === state.sort) {
            button.classList.add("is-active");
        }

        elements.sortMenu.appendChild(button);
    });
}

function updateDrawerResetState() {
    if (!elements.drawerReset) return;
    const hasActive = getActiveFilterCount() > 0;
    elements.drawerReset.disabled = !hasActive;
    elements.drawerReset.style.opacity = hasActive ? "1" : "0.5";
}

function renderAll() {
    renderFilters();
    dataState.filtered = filterOpenings();
    renderRows(dataState.filtered);
    renderResultsCount();
    renderActiveChips();
    updateRangeUI();
    updateFilterTriggerState();
    updateSearchClear();
    updateSortUI();
    if (!sortMenuState.isOpen && elements.sortMenu) {
        elements.sortMenu.hidden = true;
        elements.sortMenu.classList.remove("is-open");
        elements.sortTrigger?.setAttribute("aria-expanded", "false");
    }
    updateDrawerResetState();
}

function focusHashCard() {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, "").trim());
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    target.classList.add("opening-row--focus");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
        target.classList.remove("opening-row--focus");
    }, 1600);
}

function getFocusableElements(container) {
    return Array.from(
        container.querySelectorAll(
            "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
        )
    ).filter((element) => !element.hasAttribute("hidden"));
}

function closeDrawer(options = {}) {
    const { restoreFocus = true } = options;
    if (!elements.filterDrawer || !elements.filterBackdrop || !drawerState.isOpen) return;

    drawerState.isOpen = false;
    elements.filtersTrigger?.setAttribute("aria-expanded", "false");
    elements.filterDrawer.classList.remove("is-open");
    elements.filterBackdrop.classList.remove("is-open");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleDrawerKeydown);

    window.setTimeout(() => {
        elements.filterDrawer.hidden = true;
        elements.filterBackdrop.hidden = true;
        if (restoreFocus) {
            const target = drawerState.returnFocusEl || elements.filtersTrigger;
            target?.focus();
        }
    }, 220);
}

function handleDrawerKeydown(event) {
    if (!drawerState.isOpen || !elements.filterDrawer) return;

    if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
        return;
    }

    if (event.key !== "Tab") return;
    const focusable = getFocusableElements(elements.filterDrawer);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
    }
}

function openDrawer() {
    if (!elements.filterDrawer || !elements.filterBackdrop || drawerState.isOpen) return;

    drawerState.returnFocusEl = document.activeElement instanceof HTMLElement ? document.activeElement : elements.filtersTrigger;
    drawerState.isOpen = true;
    elements.filterDrawer.hidden = false;
    elements.filterBackdrop.hidden = false;
    elements.filtersTrigger?.setAttribute("aria-expanded", "true");

    requestAnimationFrame(() => {
        elements.filterDrawer.classList.add("is-open");
        elements.filterBackdrop.classList.add("is-open");
    });

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleDrawerKeydown);
    window.setTimeout(() => {
        (elements.drawerClose || elements.filterDrawer.querySelector("button, input"))?.focus();
    }, 30);
}

function bindDifficultyRange() {
    if (!elements.difficultyMin || !elements.difficultyMax) return;

    function update(changed) {
        let min = Number.parseInt(elements.difficultyMin.value, 10);
        let max = Number.parseInt(elements.difficultyMax.value, 10);

        min = clamp(min, DIFFICULTY_MIN, DIFFICULTY_MAX);
        max = clamp(max, DIFFICULTY_MIN, DIFFICULTY_MAX);

        if (min > max) {
            if (changed === "min") {
                max = min;
                elements.difficultyMax.value = String(max);
            } else {
                min = max;
                elements.difficultyMin.value = String(min);
            }
        }

        state.filters.difficultyMin = min;
        state.filters.difficultyMax = max;
        renderAll();
    }

    elements.difficultyMin.addEventListener("input", () => update("min"));
    elements.difficultyMax.addEventListener("input", () => update("max"));

    elements.difficultyMin.addEventListener("pointerdown", () => {
        elements.difficultyMin.style.zIndex = "4";
        elements.difficultyMax.style.zIndex = "3";
    });
    elements.difficultyMax.addEventListener("pointerdown", () => {
        elements.difficultyMin.style.zIndex = "3";
        elements.difficultyMax.style.zIndex = "4";
    });
}

function bindEloRange() {
    if (!elements.eloMin || !elements.eloMax) return;

    function update(changed) {
        let min = Number.parseInt(elements.eloMin.value, 10);
        let max = Number.parseInt(elements.eloMax.value, 10);

        min = clamp(Math.round(min / ELO_STEP) * ELO_STEP, ELO_MIN_BOUND, ELO_MAX_BOUND);
        max = clamp(Math.round(max / ELO_STEP) * ELO_STEP, ELO_MIN_BOUND, ELO_MAX_BOUND);

        if (min > max) {
            if (changed === "min") {
                max = min;
                elements.eloMax.value = String(max);
            } else {
                min = max;
                elements.eloMin.value = String(min);
            }
        }

        state.filters.eloMin = min;
        state.filters.eloMax = max;
        renderAll();
    }

    elements.eloMin.addEventListener("input", () => update("min"));
    elements.eloMax.addEventListener("input", () => update("max"));

    elements.eloMin.addEventListener("pointerdown", () => {
        elements.eloMin.style.zIndex = "4";
        elements.eloMax.style.zIndex = "3";
    });
    elements.eloMax.addEventListener("pointerdown", () => {
        elements.eloMin.style.zIndex = "3";
        elements.eloMax.style.zIndex = "4";
    });
}

function bindScrollTop() {
    if (!elements.scrollTopButton) return;

    function updateScrollButtonState() {
        elements.scrollTopButton.classList.toggle("is-visible", window.scrollY > 340);
    }

    elements.scrollTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", updateScrollButtonState, { passive: true });
    updateScrollButtonState();
}

function bindEvents() {
    if (elements.searchForm) {
        elements.searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            renderAll();
        });
    }

    if (elements.searchInput) {
        elements.searchInput.addEventListener("input", (event) => {
            state.search = String(event.target.value || "");
            renderAll();
        });
    }

    if (elements.searchClear) {
        elements.searchClear.addEventListener("click", () => {
            state.search = "";
            if (elements.searchInput) {
                elements.searchInput.value = "";
                elements.searchInput.focus();
            }
            renderAll();
        });
    }

    elements.sortTrigger?.addEventListener("click", () => {
        toggleSortMenu();
    });

    elements.sortMenu?.addEventListener("click", (event) => {
        const eventTarget = getEventElementTarget(event);
        if (!eventTarget) return;
        const optionButton = eventTarget.closest(".sort-option");
        if (!(optionButton instanceof HTMLButtonElement)) return;
        const value = String(optionButton.dataset.value || "");
        if (!value || value === state.sort) {
            closeSortMenu({ restoreFocus: true });
            return;
        }
        state.sort = value;
        closeSortMenu({ restoreFocus: true });
        renderAll();
    });

    elements.sortSelect?.addEventListener("change", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLSelectElement)) return;
        state.sort = String(target.value || "popularity-desc");
        renderAll();
    });

    document.addEventListener("pointerdown", (event) => {
        if (!sortMenuState.isOpen) return;
        const eventTarget = getEventElementTarget(event);
        if (!eventTarget) {
            closeSortMenu();
            return;
        }
        if (elements.sortControl?.contains(eventTarget)) return;
        closeSortMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && sortMenuState.isOpen) {
            event.preventDefault();
            closeSortMenu({ restoreFocus: true });
        }
    });

    bindDifficultyRange();
    bindEloRange();
    bindScrollTop();

    elements.filtersTrigger?.addEventListener("click", () => {
        closeSortMenu();
        if (drawerState.isOpen) {
            closeDrawer();
        } else {
            openDrawer();
        }
    });

    elements.filterBackdrop?.addEventListener("click", () => closeDrawer());
    elements.drawerClose?.addEventListener("click", () => closeDrawer());
    elements.drawerDone?.addEventListener("click", () => closeDrawer());

    elements.drawerReset?.addEventListener("click", () => {
        clearAllFilters();
        renderAll();
    });

    window.addEventListener("hashchange", focusHashCard);
}

async function init() {
    bindEvents();
    renderSortMenu();
    closeSortMenu();
    loadFavoriteIds();

    const [metadataById, statsById] = await Promise.all([
        loadLibraryMetadata(),
        loadOpeningStats()
    ]);
    const openings = await loadOpenings(metadataById, statsById);

    if (!openings.length) {
        if (elements.emptyState) {
            elements.emptyState.hidden = false;
            elements.emptyState.textContent = "Unable to load openings. Start a local server and reload this page.";
        }
        return;
    }

    dataState.all = openings;
    dataState.options = buildOptions(openings);

    renderAll();
    focusHashCard();
}

init();
