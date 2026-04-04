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

const OPENING_DETAILS_FILE = "data/openings/opening-details.json";
const LIBRARY_METADATA_FILE = "data/openings/library-metadata.json";
const LICHESS_OPENING_STATS_FILE = "data/openings/lichess-opening-stats.json";
const EXPLORER_URL = "tree.html";
const OPENING_EXPLORER_API_URLS = [
    "https://explorer.lichess.ovh/lichess",
    "https://explorer.lichess.org/lichess"
];
const OPENING_EXPLORER_VARIANT = "standard";
const OPENING_EXPLORER_SPEEDS = "blitz,rapid,classical";
const OPENING_EXPLORER_SINCE = `${Math.max(2000, new Date().getUTCFullYear() - 3)}-01`;
const OPENING_EXPLORER_TOKEN_STORAGE_KEY = "chess_tree_lichess_token";
const OPENING_EXPLORER_CONFIG = window.CHESS_TREE_OPENING_CONFIG && typeof window.CHESS_TREE_OPENING_CONFIG === "object"
    ? window.CHESS_TREE_OPENING_CONFIG
    : {};
const ELO_USAGE_BUCKETS = [
    { ratingGroup: 100, elo: 100, label: "100" },
    { ratingGroup: 400, elo: 400, label: "400" },
    { ratingGroup: 700, elo: 700, label: "700" },
    { ratingGroup: 1000, elo: 1000, label: "1000" },
    { ratingGroup: 1300, elo: 1300, label: "1300" },
    { ratingGroup: 1600, elo: 1600, label: "1600" },
    { ratingGroup: 1900, elo: 1900, label: "1900" },
    { ratingGroup: 2200, elo: 2200, label: "2200" },
    { ratingGroup: 2500, elo: 2500, label: "2500" }
];
const ELO_CHART_TICKS = ELO_USAGE_BUCKETS.map((bucket) => ({
    elo: bucket.elo,
    label: bucket.label
}));
const SVG_NS = "http://www.w3.org/2000/svg";

const FIRST_MOVE_ORDER = ["king-pawn", "queen-pawn", "flank", "irregular"];
const FIRST_MOVE_LABELS = {
    "king-pawn": "King's Pawn",
    "queen-pawn": "Queen's Pawn",
    flank: "Flank Opening",
    irregular: "Irregular"
};
const FIRST_MOVE_ICONS = {
    "king-pawn": "\u2654",
    "queen-pawn": "\u2655",
    flank: "\u2659",
    irregular: "\u2658"
};
const SIDE_ICONS = {
    white: "\u2654",
    black: "\u265A"
};
const TIP_ICON_SVGS = {
    center: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 3V6M12 18V21M3 12H6M18 12H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    develop: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 18H10V13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 14L14.5 8.5L18 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.2 7.8V12.2H13.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    queen: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 17H19L17.7 9L14.5 12L12 7L9.5 12L6.3 9L5 17Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 20H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    king: '<svg viewBox="0 0 24 24" fill="none"><path d="M7.2 19V11.4L12 8.4L16.8 11.4V19H7.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 4V7.2M10.4 5.6H13.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    tension: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 16L10 10L14 14L20 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 8H16.8M20 8V11.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    square: '<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M9 3V6M15 3V6M9 18V21M15 18V21M3 9H6M3 15H6M18 9H21M18 15H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    flank: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 18H9.2C12.8 18 15.8 15 15.8 11.4V8.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12.8 11.8L15.8 8.8L18.8 11.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tempo: '<svg viewBox="0 0 24 24" fill="none"><path d="M13.2 3L6.8 13.2H11.8L10.8 21L17.2 10.8H12.2L13.2 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    memory: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H18V18.5A2.5 2.5 0 0 0 15.5 16H5V6.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 16V18.5A2.5 2.5 0 0 0 7.5 21H18" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    safety: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3L19 6V11.2C19 15.6 16.1 19.6 12 21C7.9 19.6 5 15.6 5 11.2V6L12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.4 12.2L11.2 14L14.8 10.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

const DIFFICULTY_MIN = 1;
const DIFFICULTY_MAX = 5;
const ELO_MIN_BOUND = 100;
const ELO_MAX_BOUND = 2400;
const ELO_STEP = 100;
const MIN_ELO_USAGE_POINTS = 2;
const MIN_ELO_USAGE_OPENING_GAMES = 3;
const MIN_ELO_USAGE_PEAK_PERCENT = 0.02;
const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const FILES = "abcdefgh";

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

const elements = {
    breadcrumbCurrent: document.getElementById("breadcrumbCurrent"),
    openingHeroCard: document.getElementById("openingHeroCard"),
    openingTitle: document.getElementById("openingTitle"),
    openingPreview: document.getElementById("openingPreview"),
    openingMetaGrid: document.getElementById("openingMetaGrid"),
    openingEloSuitability: document.getElementById("openingEloSuitability"),
    openingTips: document.getElementById("openingTips"),
    openExplorerButton: document.getElementById("openExplorerButton"),
    openYoutubeButton: document.getElementById("openYoutubeButton"),
    variationsList: document.getElementById("variationsList"),
    variationsEmpty: document.getElementById("variationsEmpty")
};
const explorerCountCache = new Map();
const openingEloUsageCache = new Map();
let latestEloRenderRequest = 0;

function slugify(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function normalizeText(value, fallback = "") {
    const normalized = String(value || "").trim();
    return normalized || fallback;
}

function getConfiguredOpeningExplorerToken() {
    return normalizeText(OPENING_EXPLORER_CONFIG.lichessApiToken);
}

function getOpeningExplorerToken() {
    try {
        const localToken = normalizeText(window.localStorage.getItem(OPENING_EXPLORER_TOKEN_STORAGE_KEY));
        if (localToken) return localToken;
    } catch (_error) {
        // no-op
    }
    return getConfiguredOpeningExplorerToken();
}

function setOpeningExplorerToken(token) {
    const normalized = normalizeText(token);
    try {
        if (!normalized) {
            window.localStorage.removeItem(OPENING_EXPLORER_TOKEN_STORAGE_KEY);
            return;
        }
        window.localStorage.setItem(OPENING_EXPLORER_TOKEN_STORAGE_KEY, normalized);
    } catch (_error) {
        // no-op
    }
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

function mapDifficultyLevelToLabel(level) {
    if (level <= 1) return "Beginner";
    if (level <= 2) return "Basic";
    if (level <= 3) return "Intermediate";
    if (level <= 4) return "Advanced";
    return "Expert";
}

function normalizeDifficultyLevel(rawLevel, rawLabel) {
    const numeric = Number.parseInt(rawLevel, 10);
    if (Number.isFinite(numeric)) return clamp(numeric, DIFFICULTY_MIN, DIFFICULTY_MAX);
    return clamp(mapDifficultyLabelToLevel(rawLabel), DIFFICULTY_MIN, DIFFICULTY_MAX);
}

function normalizePopularityLevel(rawLevel, difficultyLevel) {
    const numeric = Number.parseInt(rawLevel, 10);
    if (Number.isFinite(numeric)) return clamp(numeric, 1, 5);
    return clamp(Math.round((difficultyLevel + 2) / 2), 2, 4);
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

function normalizeOpening(rawOpening, metadataById, statsById = {}, statsMeta = {}) {
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
    const popularityLevel = normalizePopularityLevel(
        stats.popularityLevel ?? rawOpening?.popularityLevel ?? rawOpening?.popularity,
        difficultyLevel
    );
    const usageByElo = Array.isArray(stats.usageByElo) ? stats.usageByElo : [];
    const hasExplicitUsageFlag = stats.hasUsageStats === true || stats.hasUsageStats === false;
    const hasUsageStats = hasExplicitUsageFlag
        ? (stats.hasUsageStats === true && usageByElo.length >= MIN_ELO_USAGE_POINTS)
        : (usageByElo.length >= MIN_ELO_USAGE_POINTS ? true : null);

    return {
        id,
        name,
        side,
        openingType,
        firstMoveType,
        difficultyLevel,
        popularityLevel,
        recommendedEloMin: eloRange.min,
        recommendedEloMax: eloRange.max,
        fen: normalizeText(rawOpening?.fen),
        usageByElo,
        hasUsageStats,
        noStatsReason: normalizeText(stats.noStatsReason),
        statsSourceName: normalizeText(statsMeta.sourceName, "Lichess Opening Explorer"),
        statsSourceUrl: normalizeText(statsMeta.sourceUrl, "https://explorer.lichess.org")
    };
}

function normalizeVariation(rawVariation) {
    const name = normalizeText(rawVariation?.name);
    const moves = normalizeText(rawVariation?.moves);
    if (!name && !moves) return null;

    const difficultyLevel = normalizeDifficultyLevel(rawVariation?.difficultyLevel, rawVariation?.difficulty);
    return {
        id: normalizeText(rawVariation?.id, slugify(name || moves)),
        name: name || "Variation",
        moves: moves || "Moves in progress.",
        difficultyLevel,
        difficultyLabel: mapDifficultyLevelToLabel(difficultyLevel)
    };
}

function normalizeDetails(rawDetails) {
    const details = {};
    if (!rawDetails || typeof rawDetails !== "object") return details;

    Object.entries(rawDetails).forEach(([openingId, value]) => {
        const variations = Array.isArray(value?.variations)
            ? value.variations.map(normalizeVariation).filter(Boolean)
            : [];

        const keyIdeas = Array.isArray(value?.keyIdeas)
            ? value.keyIdeas.map((idea) => normalizeText(idea)).filter(Boolean)
            : [];

        details[openingId] = {
            eco: normalizeText(value?.eco),
            keyIdeas,
            mainLineMoves: normalizeText(value?.mainLineMoves),
            variations
        };
    });

    return details;
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

function normalizeUsageByElo(rawPoints) {
    if (!Array.isArray(rawPoints)) return [];

    return rawPoints
        .map((point) => {
            const elo = Number.parseInt(point?.elo ?? point?.ratingGroup ?? point?.rating, 10);
            const percent = Number(point?.percent);
            const openingGames = Number(point?.openingGames ?? point?.games ?? point?.count);
            if (!Number.isFinite(elo) || !Number.isFinite(percent) || percent <= 0) return null;
            if (Number.isFinite(openingGames) && openingGames <= 0) return null;

            const clampedElo = clamp(elo, 100, 2500);
            const label = normalizeText(point?.label, String(clampedElo));

            return {
                elo: clampedElo,
                label,
                percent: clamp(percent, 0, 100),
                openingGames: Number.isFinite(openingGames) ? openingGames : null
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.elo - b.elo);
}

function evaluateUsagePointReliability(rawPoints) {
    const points = Array.isArray(rawPoints)
        ? rawPoints
            .map((point) => ({
                ...point,
                percent: Number(point?.percent),
                openingGames: Number(point?.openingGames)
            }))
            .filter((point) => {
                if (!Number.isFinite(point.percent) || point.percent <= 0) return false;
                if (Number.isFinite(point.openingGames) && point.openingGames < MIN_ELO_USAGE_OPENING_GAMES) return false;
                return true;
            })
            .sort((a, b) => a.elo - b.elo)
        : [];

    if (points.length < MIN_ELO_USAGE_POINTS) {
        return {
            ok: false,
            points: [],
            reason: "Not enough reliable Elo buckets for this opening"
        };
    }

    const peakPercent = Math.max(...points.map((point) => point.percent), 0);
    if (peakPercent < MIN_ELO_USAGE_PEAK_PERCENT) {
        return {
            ok: false,
            points: [],
            reason: "Opening usage is too close to zero in available Elo buckets"
        };
    }

    return { ok: true, points, reason: "" };
}

async function loadOpeningStats() {
    const payload = await loadJson(LICHESS_OPENING_STATS_FILE);
    const fallbackMeta = {
        sourceName: "Lichess Opening Explorer",
        sourceUrl: "https://explorer.lichess.org"
    };

    if (!payload || typeof payload !== "object") {
        return { byId: {}, ...fallbackMeta };
    }

    const rootMeta = payload._meta && typeof payload._meta === "object" ? payload._meta : {};
    const sourceName = normalizeText(payload.sourceName ?? rootMeta.sourceName, fallbackMeta.sourceName);
    const sourceUrl = normalizeText(payload.sourceUrl ?? rootMeta.sourceUrl, fallbackMeta.sourceUrl);
    const openingsRaw = payload.openings && typeof payload.openings === "object" ? payload.openings : payload;
    const byId = {};

    Object.entries(openingsRaw).forEach(([openingId, value]) => {
        if (!openingId || openingId.startsWith("_")) return;
        if (!value || typeof value !== "object") return;

        const usageByElo = normalizeUsageByElo(value.usageByElo ?? value.eloUsage ?? value.points);
        const popularityLevel = Number.parseInt(value.popularityLevel, 10);
        const recommendedEloMin = Number.parseInt(value.recommendedEloMin, 10);
        const recommendedEloMax = Number.parseInt(value.recommendedEloMax, 10);
        const hasUsageStatsRaw = value.hasUsageStats;
        const hasExplicitUsageFlag = hasUsageStatsRaw === true || hasUsageStatsRaw === false;
        const hasUsageStats = hasExplicitUsageFlag
            ? hasUsageStatsRaw
            : (usageByElo.length >= MIN_ELO_USAGE_POINTS);

        byId[openingId] = {
            popularityLevel: Number.isFinite(popularityLevel) ? clamp(popularityLevel, 1, 5) : null,
            recommendedEloMin: Number.isFinite(recommendedEloMin) ? recommendedEloMin : null,
            recommendedEloMax: Number.isFinite(recommendedEloMax) ? recommendedEloMax : null,
            usageByElo,
            hasUsageStats,
            noStatsReason: normalizeText(value.noStatsReason ?? value.reason)
        };
    });

    return { byId, sourceName, sourceUrl };
}

async function loadOpenings(metadataById, statsById, statsMeta) {
    const rawItems = await Promise.all(OPENING_FILES.map(loadJson));
    return rawItems
        .filter(Boolean)
        .map((opening) => normalizeOpening(opening, metadataById, statsById, statsMeta))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));
}

async function loadDetails() {
    const rawDetails = await loadJson(OPENING_DETAILS_FILE);
    return normalizeDetails(rawDetails);
}

function getRequestedOpeningId() {
    const params = new URLSearchParams(window.location.search);
    return normalizeText(params.get("id")).toLowerCase();
}

function findOpening(openings, requestedId) {
    if (!openings.length) return null;
    if (!requestedId) return openings[0];

    const direct = openings.find((item) => item.id.toLowerCase() === requestedId);
    if (direct) return direct;

    const bySlug = openings.find((item) => slugify(item.name) === requestedId);
    return bySlug || openings[0];
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

function coordsFromSquare(square) {
    const normalized = normalizeText(square).toLowerCase();
    if (!/^[a-h][1-8]$/.test(normalized)) return null;
    const col = FILES.indexOf(normalized[0]);
    const rank = Number(normalized[1]);
    return { row: 8 - rank, col };
}

function squareFromCoords(row, col) {
    if (row < 0 || row > 7 || col < 0 || col > 7) return "-";
    return `${FILES[col]}${8 - row}`;
}

function getPieceColor(piece) {
    if (!piece) return "";
    return piece === piece.toUpperCase() ? "white" : "black";
}

function getPieceType(piece) {
    return String(piece || "").toUpperCase();
}

function isInsideBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isPathClear(board, fromRow, fromCol, toRow, toCol) {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let row = fromRow + rowStep;
    let col = fromCol + colStep;

    while (row !== toRow || col !== toCol) {
        if (board[row]?.[col]) return false;
        row += rowStep;
        col += colStep;
    }

    return true;
}

function canPieceReach(position, fromRow, fromCol, toRow, toCol, pieceType, isCapture) {
    const board = position.board;
    const side = position.sideToMove;
    const targetPiece = board[toRow]?.[toCol] || null;
    const targetColor = getPieceColor(targetPiece);
    if (targetPiece && targetColor === side) return false;

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRow = Math.abs(rowDiff);
    const absCol = Math.abs(colDiff);

    if (pieceType === "P") {
        const direction = side === "white" ? -1 : 1;
        const startRow = side === "white" ? 6 : 1;
        const enPassantCoords = coordsFromSquare(position.enPassant);

        if (isCapture) {
            if (rowDiff !== direction || absCol !== 1) return false;
            if (targetPiece) return targetColor && targetColor !== side;
            if (!enPassantCoords) return false;
            return enPassantCoords.row === toRow && enPassantCoords.col === toCol;
        }

        if (colDiff !== 0 || targetPiece) return false;
        if (rowDiff === direction) return true;
        if (fromRow === startRow && rowDiff === direction * 2) {
            const midRow = fromRow + direction;
            return !board[midRow]?.[fromCol];
        }
        return false;
    }

    if (isCapture && !targetPiece) return false;
    if (!isCapture && targetPiece) return false;

    if (pieceType === "N") {
        return (absRow === 2 && absCol === 1) || (absRow === 1 && absCol === 2);
    }

    if (pieceType === "B") {
        return absRow === absCol && isPathClear(board, fromRow, fromCol, toRow, toCol);
    }

    if (pieceType === "R") {
        return (rowDiff === 0 || colDiff === 0) && isPathClear(board, fromRow, fromCol, toRow, toCol);
    }

    if (pieceType === "Q") {
        const diagonal = absRow === absCol;
        const straight = rowDiff === 0 || colDiff === 0;
        return (diagonal || straight) && isPathClear(board, fromRow, fromCol, toRow, toCol);
    }

    if (pieceType === "K") {
        return absRow <= 1 && absCol <= 1;
    }

    return false;
}

function createPositionFromFen(fen = INITIAL_FEN) {
    const [boardPart = INITIAL_FEN.split(" ")[0], sidePart = "w", castlingPart = "KQkq", enPassantPart = "-"] = String(fen || INITIAL_FEN).split(" ");
    return {
        board: parseFEN(boardPart),
        sideToMove: sidePart === "b" ? "black" : "white",
        castling: castlingPart,
        enPassant: enPassantPart
    };
}

function serializeBoardToFen(board) {
    return board
        .map((row) => {
            let fenRow = "";
            let empty = 0;
            row.forEach((cell) => {
                if (!cell) {
                    empty += 1;
                } else {
                    if (empty > 0) fenRow += String(empty);
                    empty = 0;
                    fenRow += cell;
                }
            });
            if (empty > 0) fenRow += String(empty);
            return fenRow;
        })
        .join("/");
}

function serializePositionToFen(position) {
    return `${serializeBoardToFen(position.board)} ${position.sideToMove === "black" ? "b" : "w"} - - 0 1`;
}

function findSourceCandidates(position, pieceType, destination, isCapture, fromFileHint = "", fromRankHint = "") {
    const destCoords = coordsFromSquare(destination);
    if (!destCoords) return [];

    const board = position.board;
    const side = position.sideToMove;
    const expectedPiece = side === "white" ? pieceType : pieceType.toLowerCase();
    const candidates = [];

    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            const piece = board[row]?.[col];
            if (piece !== expectedPiece) continue;
            if (fromFileHint && FILES[col] !== fromFileHint) continue;
            if (fromRankHint && String(8 - row) !== fromRankHint) continue;
            if (!canPieceReach(position, row, col, destCoords.row, destCoords.col, pieceType, isCapture)) continue;
            candidates.push({ fromRow: row, fromCol: col, toRow: destCoords.row, toCol: destCoords.col });
        }
    }

    return candidates;
}

function applyCastleMove(position, isLongCastle) {
    const row = position.sideToMove === "white" ? 7 : 0;
    const kingFromCol = 4;
    const kingToCol = isLongCastle ? 2 : 6;
    const rookFromCol = isLongCastle ? 0 : 7;
    const rookToCol = isLongCastle ? 3 : 5;
    const kingFallback = position.sideToMove === "white" ? "K" : "k";
    const rookFallback = position.sideToMove === "white" ? "R" : "r";

    const king = position.board[row]?.[kingFromCol] || kingFallback;
    const rook = position.board[row]?.[rookFromCol] || rookFallback;

    position.board[row][kingFromCol] = null;
    position.board[row][rookFromCol] = null;
    position.board[row][kingToCol] = king;
    position.board[row][rookToCol] = rook;
    position.enPassant = "-";
    position.sideToMove = position.sideToMove === "white" ? "black" : "white";
    return true;
}

function applyStandardSanMove(position, san) {
    const cleanSan = normalizeText(san)
        .replace(/[+#?!]+/g, "")
        .replace(/e\.p\./gi, "")
        .trim();

    const match = cleanSan.match(/^([KQRBN])?([a-h])?([1-8])?(x)?([a-h][1-8])(?:=([QRBN]))?$/);
    if (!match) return false;

    const pieceType = match[1] || "P";
    const fromFileHint = match[2] || "";
    const fromRankHint = match[3] || "";
    const isCapture = Boolean(match[4]);
    const destination = match[5];
    const promotion = match[6] || "";

    const candidates = findSourceCandidates(position, pieceType, destination, isCapture, fromFileHint, fromRankHint);
    if (!candidates.length) return false;

    const selected = candidates[0];
    const { fromRow, fromCol, toRow, toCol } = selected;
    const side = position.sideToMove;
    const movingPiece = position.board[fromRow]?.[fromCol];
    if (!movingPiece) return false;

    let isEnPassantCapture = false;
    if (pieceType === "P" && isCapture && !position.board[toRow]?.[toCol]) {
        const enPassantCoords = coordsFromSquare(position.enPassant);
        if (enPassantCoords && enPassantCoords.row === toRow && enPassantCoords.col === toCol) {
            isEnPassantCapture = true;
        }
    }

    position.board[fromRow][fromCol] = null;

    if (isEnPassantCapture) {
        const capturedPawnRow = side === "white" ? toRow + 1 : toRow - 1;
        if (isInsideBoard(capturedPawnRow, toCol)) {
            position.board[capturedPawnRow][toCol] = null;
        }
    }

    position.board[toRow][toCol] = movingPiece;

    if (promotion) {
        position.board[toRow][toCol] = side === "white" ? promotion : promotion.toLowerCase();
    }

    position.enPassant = "-";
    if (pieceType === "P" && Math.abs(toRow - fromRow) === 2) {
        const middleRow = (toRow + fromRow) / 2;
        position.enPassant = squareFromCoords(middleRow, toCol);
    }

    position.sideToMove = side === "white" ? "black" : "white";
    return true;
}

function applySanMove(position, san) {
    const cleanSan = normalizeText(san).replace(/[+#?!]+/g, "");
    if (!cleanSan) return false;
    if (cleanSan === "O-O" || cleanSan === "0-0") return applyCastleMove(position, false);
    if (cleanSan === "O-O-O" || cleanSan === "0-0-0") return applyCastleMove(position, true);
    return applyStandardSanMove(position, cleanSan);
}

function extractSanMoves(movesText) {
    return normalizeText(movesText)
        .replace(/\{[^}]*\}/g, " ")
        .replace(/\([^)]*\)/g, " ")
        .replace(/\d+\.(\.\.)?/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map((token) => token.trim())
        .filter((token) => token && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token));
}

function calculateVariationFen(movesText) {
    const tokens = extractSanMoves(movesText);
    if (!tokens.length) return "";

    const position = createPositionFromFen(INITIAL_FEN);
    tokens.forEach((token) => {
        applySanMove(position, token);
    });

    return serializePositionToFen(position);
}

function renderFenBoard(target, fen, perspectiveSide, options = {}) {
    if (!target) return;

    const squareBaseClass = options.squareBaseClass || "board-square";
    const lightClass = options.lightClass || "light";
    const darkClass = options.darkClass || "dark";
    const pieceClass = options.pieceClass || "board-piece";
    const animatedPieces = options.animatedPieces !== false;

    target.innerHTML = "";
    if (!fen) return;

    const matrix = parseFEN(fen);
    const isBlackPerspective = perspectiveSide === "black";

    for (let displayRow = 0; displayRow < 8; displayRow += 1) {
        for (let displayCol = 0; displayCol < 8; displayCol += 1) {
            const sourceRow = isBlackPerspective ? 7 - displayRow : displayRow;
            const sourceCol = isBlackPerspective ? 7 - displayCol : displayCol;

            const square = document.createElement("div");
            square.className = `${squareBaseClass} ${((displayRow + displayCol) % 2 === 0) ? darkClass : lightClass}`;

            const pieceCode = matrix[sourceRow]?.[sourceCol];
            if (pieceCode && PIECE_IMAGES[pieceCode]) {
                const image = document.createElement("img");
                image.className = pieceClass;
                image.src = PIECE_IMAGES[pieceCode];
                image.alt = "";
                image.loading = "lazy";
                image.decoding = "async";
                if (animatedPieces) {
                    image.style.setProperty("--piece-delay", `${(displayRow * 8 + displayCol) * 16}ms`);
                }
                square.appendChild(image);
            }

            target.appendChild(square);
        }
    }
}

function renderBoardPreview(fen, perspectiveSide, openingName) {
    if (!elements.openingPreview) return;

    elements.openingPreview.innerHTML = "";
    if (!fen) {
        const placeholder = document.createElement("div");
        placeholder.className = "preview-placeholder";
        placeholder.textContent = "Preview in progress.";
        elements.openingPreview.appendChild(placeholder);
        return;
    }

    renderFenBoard(elements.openingPreview, fen, perspectiveSide, {
        squareBaseClass: "board-square",
        lightClass: "light",
        darkClass: "dark",
        pieceClass: "board-piece",
        animatedPieces: true
    });

    elements.openingPreview.setAttribute("aria-label", `Board preview for ${openingName}`);
}

function createSegmentScale({ minLevel = 1, maxLevel = 5, total = 5, ariaLabel, toneLevel = maxLevel, variant = "difficulty" }) {
    const scale = document.createElement("div");
    scale.className = "level-scale";
    scale.dataset.tone = getDifficultyLevelTone(toneLevel);
    scale.dataset.variant = variant;
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

function createDifficultyScale(level, label = "") {
    const difficultyLabel = label || `Difficulty ${level} out of 5`;
    return createSegmentScale({
        minLevel: 1,
        maxLevel: level,
        total: 5,
        ariaLabel: difficultyLabel,
        toneLevel: level,
        variant: "difficulty"
    });
}

function createPopularityScale(level, toneLevel = level) {
    return createSegmentScale({
        minLevel: 1,
        maxLevel: level,
        total: 5,
        ariaLabel: `Popularity ${level} out of 5`,
        toneLevel,
        variant: "popularity"
    });
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

function createEloRangeFallbackBar(opening, statusText = "", options = {}) {
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

    if (statusText) {
        const status = document.createElement("div");
        status.className = "elo-suitability__status";
        status.textContent = statusText;
        wrapper.appendChild(status);
    }

    if (options.showTokenAction) {
        const actionButton = document.createElement("button");
        actionButton.type = "button";
        actionButton.className = "elo-suitability__token-action";
        actionButton.textContent = options.tokenActionLabel || "Add token";
        actionButton.addEventListener("click", () => {
            if (typeof options.onTokenAction === "function") {
                options.onTokenAction();
            }
        });
        wrapper.appendChild(actionButton);
    }

    return wrapper;
}

function createSvgElement(name, attributes = {}) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => {
        node.setAttribute(key, String(value));
    });
    return node;
}

function sumExplorerGameCounts(payload) {
    const white = Number(payload?.white) || 0;
    const draws = Number(payload?.draws) || 0;
    const black = Number(payload?.black) || 0;
    return white + draws + black;
}

function buildExplorerCountUrl(baseUrl, fen, ratingGroup) {
    const params = new URLSearchParams();
    params.set("variant", OPENING_EXPLORER_VARIANT);
    params.set("speeds", OPENING_EXPLORER_SPEEDS);
    params.set("ratings", String(ratingGroup));
    params.set("fen", fen);
    params.set("since", OPENING_EXPLORER_SINCE);
    return `${baseUrl}?${params.toString()}`;
}

async function fetchExplorerPositionGameCount(fen, ratingGroup) {
    const token = getOpeningExplorerToken();
    const cacheKey = `${fen}::${ratingGroup}::${token ? "token" : "anon"}`;
    if (explorerCountCache.has(cacheKey)) {
        return explorerCountCache.get(cacheKey);
    }

    const requestPromise = (async () => {
        const errors = [];

        for (const apiUrl of OPENING_EXPLORER_API_URLS) {
            try {
                const response = await fetch(buildExplorerCountUrl(apiUrl, fen, ratingGroup), {
                    method: "GET",
                    mode: "cors",
                    cache: "no-store",
                    headers: token
                        ? {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`
                        }
                        : { Accept: "application/json" }
                });

                if (!response.ok) {
                    errors.push(`${new URL(apiUrl).host} HTTP ${response.status}`);
                    continue;
                }

                const payload = await response.json();
                return {
                    count: sumExplorerGameCounts(payload),
                    sourceUrl: apiUrl,
                    error: ""
                };
            } catch (_error) {
                errors.push(`${new URL(apiUrl).host} network`);
            }
        }

        return {
            count: null,
            sourceUrl: "",
            error: errors.length ? errors.join("; ") : "network"
        };
    })();

    explorerCountCache.set(cacheKey, requestPromise);
    return requestPromise;
}

async function fetchOpeningEloUsageStats(opening) {
    const cachedPoints = Array.isArray(opening.usageByElo) ? opening.usageByElo : [];
    const cachedUsage = evaluateUsagePointReliability(cachedPoints);

    if (opening.hasUsageStats && cachedUsage.ok) {
        return {
            ok: true,
            serviceName: opening.statsSourceName || "Lichess Opening Explorer",
            serviceUrl: opening.statsSourceUrl || "https://explorer.lichess.org",
            points: cachedUsage.points
        };
    }

    if (opening.hasUsageStats === false || (cachedPoints.length > 0 && !cachedUsage.ok)) {
        return {
            ok: false,
            serviceName: opening.statsSourceName || "Lichess Opening Explorer",
            serviceUrl: opening.statsSourceUrl || OPENING_EXPLORER_API_URLS[0],
            reason: normalizeText(opening.noStatsReason, cachedUsage.reason || "No reliable statistics for this opening yet"),
            reasonCode: "no_stats"
        };
    }

    const openingFen = normalizeText(opening.fen);
    if (!openingFen) {
        return {
            ok: false,
            serviceName: "Lichess Opening Explorer",
            serviceUrl: OPENING_EXPLORER_API_URLS[0],
            reason: "Position data for this opening is missing",
            reasonCode: "no_stats"
        };
    }

    const cacheKey = `${opening.id}::${openingFen}`;
    if (openingEloUsageCache.has(cacheKey)) {
        return openingEloUsageCache.get(cacheKey);
    }

    const requestPromise = (async () => {
        const points = [];
        const errors = [];
        let detectedSourceUrl = "";

        for (const bucket of ELO_USAGE_BUCKETS) {
            const [openingStats, totalStats] = await Promise.all([
                fetchExplorerPositionGameCount(openingFen, bucket.ratingGroup),
                fetchExplorerPositionGameCount(INITIAL_FEN, bucket.ratingGroup)
            ]);

            const openingGames = openingStats?.count;
            const totalGames = totalStats?.count;

            if (!detectedSourceUrl) {
                detectedSourceUrl = openingStats?.sourceUrl || totalStats?.sourceUrl || "";
            }

            if (!Number.isFinite(openingGames) || !Number.isFinite(totalGames) || totalGames <= 0) {
                if (openingStats?.error) errors.push(openingStats.error);
                if (totalStats?.error) errors.push(totalStats.error);
                points.push({ ...bucket, percent: null, openingGames: 0, totalGames: 0 });
                continue;
            }

            const percent = clamp((openingGames / totalGames) * 100, 0, 100);
            points.push({
                ...bucket,
                percent,
                openingGames,
                totalGames
            });
        }

        const validPoints = points.filter((point) => Number.isFinite(point.percent) && Number(point.percent) > 0 && Number(point.openingGames) > 0);
        const usageEvaluation = evaluateUsagePointReliability(validPoints);
        if (!usageEvaluation.ok) {
            const hasAuthError = errors.some((error) => String(error).includes("HTTP 401"));
            const hasAnySuccessfulBucket = points.some((point) => Number.isFinite(point.percent));
            if (hasAuthError && !hasAnySuccessfulBucket) {
                return {
                    ok: false,
                    serviceName: "Lichess Opening Explorer",
                    serviceUrl: detectedSourceUrl || OPENING_EXPLORER_API_URLS[0],
                    reason: errors[0] || "Authentication is required for online opening statistics",
                    reasonCode: "auth_required"
                };
            }
            return {
                ok: false,
                serviceName: "Lichess Opening Explorer",
                serviceUrl: detectedSourceUrl || OPENING_EXPLORER_API_URLS[0],
                reason: usageEvaluation.reason || "No reliable statistics for this opening yet",
                reasonCode: "no_stats"
            };
        }

        return {
            ok: true,
            serviceName: "Lichess Opening Explorer",
            serviceUrl: detectedSourceUrl || OPENING_EXPLORER_API_URLS[0],
            points: usageEvaluation.points
        };
    })();

    openingEloUsageCache.set(cacheKey, requestPromise);
    return requestPromise;
}

function buildSmoothPath(points) {
    if (!points.length) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let index = 0; index < points.length - 1; index += 1) {
        const p0 = points[index - 1] || points[index];
        const p1 = points[index];
        const p2 = points[index + 1];
        const p3 = points[index + 2] || p2;

        const cp1x = p1.x + ((p2.x - p0.x) / 6);
        const cp1y = p1.y + ((p2.y - p0.y) / 6);
        const cp2x = p2.x - ((p3.x - p1.x) / 6);
        const cp2y = p2.y - ((p3.y - p1.y) / 6);

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
}

function interpolateUsagePercent(points, targetElo) {
    if (!Array.isArray(points) || !points.length) return null;
    const sorted = [...points].sort((a, b) => a.elo - b.elo);

    if (targetElo < sorted[0].elo) return null;
    if (targetElo > sorted[sorted.length - 1].elo) return null;

    for (let index = 0; index < sorted.length - 1; index += 1) {
        const left = sorted[index];
        const right = sorted[index + 1];
        if (targetElo < left.elo || targetElo > right.elo) continue;
        const span = Math.max(1, right.elo - left.elo);
        const ratio = (targetElo - left.elo) / span;
        return left.percent + ((right.percent - left.percent) * ratio);
    }

    return null;
}

function buildHoverPercentMap(points, minElo, maxElo, step) {
    const map = new Map();
    for (let elo = minElo; elo <= maxElo; elo += step) {
        const percent = interpolateUsagePercent(points, elo);
        if (!Number.isFinite(percent)) continue;
        map.set(elo, clamp(percent, 0, 100));
    }
    return map;
}

function formatUsagePercent(value) {
    const safe = clamp(Number(value) || 0, 0, 100);
    if (safe < 1) return `${safe.toFixed(2)}%`;
    return `${safe.toFixed(1)}%`;
}

function createEloUsageChart(opening, usageStats) {
    const wrapper = document.createElement("div");
    wrapper.className = "elo-suitability elo-suitability--chart";
    wrapper.setAttribute("aria-label", `Opening usage by Elo for ${opening.name}`);

    const head = document.createElement("div");
    head.className = "elo-suitability__head";

    const label = document.createElement("div");
    label.className = "elo-suitability__label";
    label.textContent = "Opening usage by Elo";

    const source = document.createElement("div");
    source.className = "elo-suitability__source";
    source.textContent = "Source: ";

    const sourceLink = document.createElement("a");
    sourceLink.className = "elo-suitability__source-link";
    sourceLink.href = usageStats.serviceUrl;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.textContent = usageStats.serviceName;
    source.appendChild(sourceLink);

    head.appendChild(label);
    head.appendChild(source);

    const chartFrame = document.createElement("div");
    chartFrame.className = "elo-suitability__chart-frame";

    const viewWidth = 760;
    const viewHeight = 268;
    const paddingLeft = 66;
    const paddingRight = 16;
    const paddingTop = 14;
    const paddingBottom = 40;
    const plotWidth = viewWidth - paddingLeft - paddingRight;
    const plotHeight = viewHeight - paddingTop - paddingBottom;
    const plotBottom = paddingTop + plotHeight;

    const sourcePoints = usageStats.points
        .map((point) => ({
            elo: Number(point.elo),
            percent: Number(point.percent) || 0
        }))
        .filter((point) => Number.isFinite(point.elo) && Number.isFinite(point.percent))
        .sort((a, b) => a.elo - b.elo);

    const yValues = sourcePoints.map((point) => point.percent || 0);
    const xMin = ELO_CHART_TICKS[0].elo;
    const xMax = ELO_CHART_TICKS[ELO_CHART_TICKS.length - 1].elo;
    const maxPercent = Math.max(...yValues, 0.4);
    const yMax = Math.max(0.5, Math.ceil((maxPercent * 1.2) / 0.25) * 0.25);

    const xToPixel = (value) => paddingLeft + (((value - xMin) / Math.max(1, xMax - xMin)) * plotWidth);
    const yToPixel = (value) => paddingTop + ((1 - (value / yMax)) * plotHeight);

    const chartPoints = sourcePoints
        .map((point) => ({
            ...point,
            x: xToPixel(point.elo),
            y: yToPixel(point.percent || 0)
        }))
        .sort((a, b) => a.elo - b.elo);

    const hoverPercentByElo = buildHoverPercentMap(sourcePoints, xMin, xMax, ELO_STEP);

    const svg = createSvgElement("svg", {
        class: "elo-suitability__svg",
        viewBox: `0 0 ${viewWidth} ${viewHeight}`,
        role: "img",
        "aria-label": `Usage percentage by Elo for ${opening.name}`
    });

    const uniqueId = `elo-${Math.random().toString(36).slice(2, 9)}`;
    const defs = createSvgElement("defs");

    const lineGradient = createSvgElement("linearGradient", {
        id: `${uniqueId}-line`,
        x1: "0%",
        y1: "0%",
        x2: "100%",
        y2: "0%"
    });
    lineGradient.appendChild(createSvgElement("stop", { offset: "0%", "stop-color": "var(--opening-accent-start)" }));
    lineGradient.appendChild(createSvgElement("stop", { offset: "100%", "stop-color": "var(--opening-accent-end)" }));

    const areaGradient = createSvgElement("linearGradient", {
        id: `${uniqueId}-area`,
        x1: "0%",
        y1: "0%",
        x2: "0%",
        y2: "100%"
    });
    areaGradient.appendChild(createSvgElement("stop", { offset: "0%", "stop-color": "var(--opening-accent-end)", "stop-opacity": "0.35" }));
    areaGradient.appendChild(createSvgElement("stop", { offset: "100%", "stop-color": "var(--opening-accent-end)", "stop-opacity": "0.02" }));

    defs.appendChild(lineGradient);
    defs.appendChild(areaGradient);
    svg.appendChild(defs);

    const horizontalTickCount = 5;
    for (let tickIndex = 0; tickIndex <= horizontalTickCount; tickIndex += 1) {
        const value = (yMax / horizontalTickCount) * tickIndex;
        const y = yToPixel(value);

        svg.appendChild(createSvgElement("line", {
            x1: paddingLeft,
            y1: y,
            x2: paddingLeft + plotWidth,
            y2: y,
            class: "elo-suitability__grid-line"
        }));

        const tickLabel = createSvgElement("text", {
            x: paddingLeft - 10,
            y: y + 4.5,
            class: "elo-suitability__tick-label elo-suitability__tick-label--y",
            "text-anchor": "end"
        });
        tickLabel.textContent = `${value.toFixed(value < 1 ? 1 : 0)}%`;
        svg.appendChild(tickLabel);
    }

    ELO_CHART_TICKS.forEach((tick) => {
        const x = xToPixel(tick.elo);
        svg.appendChild(createSvgElement("line", {
            x1: x,
            y1: paddingTop,
            x2: x,
            y2: plotBottom,
            class: "elo-suitability__grid-line elo-suitability__grid-line--vertical"
        }));

        const xLabel = createSvgElement("text", {
            x,
            y: plotBottom + 23,
            class: "elo-suitability__tick-label elo-suitability__tick-label--x",
            "text-anchor": "middle"
        });
        xLabel.textContent = tick.label;
        svg.appendChild(xLabel);
    });

    svg.appendChild(createSvgElement("line", {
        x1: paddingLeft,
        y1: plotBottom,
        x2: paddingLeft + plotWidth,
        y2: plotBottom,
        class: "elo-suitability__axis-line"
    }));
    svg.appendChild(createSvgElement("line", {
        x1: paddingLeft,
        y1: paddingTop,
        x2: paddingLeft,
        y2: plotBottom,
        class: "elo-suitability__axis-line"
    }));

    const smoothPath = buildSmoothPath(chartPoints);
    if (smoothPath) {
        const areaPath = createSvgElement("path", {
            d: `${smoothPath} L ${chartPoints[chartPoints.length - 1].x} ${plotBottom} L ${chartPoints[0].x} ${plotBottom} Z`,
            class: "elo-suitability__area-path",
            fill: `url(#${uniqueId}-area)`
        });

        const linePath = createSvgElement("path", {
            d: smoothPath,
            class: "elo-suitability__line-path",
            stroke: `url(#${uniqueId}-line)`
        });

        svg.appendChild(areaPath);
        svg.appendChild(linePath);
    }

    chartPoints.forEach((point) => {
        svg.appendChild(createSvgElement("circle", {
            cx: point.x,
            cy: point.y,
            r: 4.5,
            class: "elo-suitability__point"
        }));
    });

    const hoverGuide = createSvgElement("line", {
        x1: paddingLeft,
        y1: paddingTop,
        x2: paddingLeft,
        y2: plotBottom,
        class: "elo-suitability__hover-guide"
    });
    hoverGuide.style.visibility = "hidden";
    svg.appendChild(hoverGuide);

    const hoverDot = createSvgElement("circle", {
        cx: paddingLeft,
        cy: plotBottom,
        r: 5.2,
        class: "elo-suitability__hover-dot"
    });
    hoverDot.style.visibility = "hidden";
    svg.appendChild(hoverDot);

    const hoverSurface = createSvgElement("rect", {
        x: paddingLeft,
        y: paddingTop,
        width: plotWidth,
        height: plotHeight,
        class: "elo-suitability__hover-surface"
    });
    svg.appendChild(hoverSurface);

    const tooltip = document.createElement("div");
    tooltip.className = "elo-suitability__tooltip";
    tooltip.hidden = true;

    const hideHoverState = () => {
        hoverGuide.style.visibility = "hidden";
        hoverDot.style.visibility = "hidden";
        tooltip.hidden = true;
    };

    const showHoverState = (clientX, clientY) => {
        const frameRect = chartFrame.getBoundingClientRect();
        if (!frameRect.width || !frameRect.height) {
            hideHoverState();
            return;
        }

        const localViewX = ((clientX - frameRect.left) / frameRect.width) * viewWidth;
        const clampedViewX = clamp(localViewX, paddingLeft, paddingLeft + plotWidth);
        const relativeX = (clampedViewX - paddingLeft) / Math.max(1, plotWidth);
        const rawElo = xMin + (relativeX * (xMax - xMin));
        const hoveredElo = clamp(Math.round(rawElo / ELO_STEP) * ELO_STEP, xMin, xMax);
        const hoveredPercent = hoverPercentByElo.get(hoveredElo);

        if (!Number.isFinite(hoveredPercent)) {
            hideHoverState();
            return;
        }

        const pointX = xToPixel(hoveredElo);
        const pointY = yToPixel(hoveredPercent);
        hoverGuide.setAttribute("x1", String(pointX));
        hoverGuide.setAttribute("x2", String(pointX));
        hoverDot.setAttribute("cx", String(pointX));
        hoverDot.setAttribute("cy", String(pointY));
        hoverGuide.style.visibility = "visible";
        hoverDot.style.visibility = "visible";

        const eloLabel = hoveredElo >= xMax ? `${hoveredElo}+` : String(hoveredElo);
        tooltip.textContent = `Elo ${eloLabel}: ${formatUsagePercent(hoveredPercent)}`;
        tooltip.hidden = false;

        const px = (pointX / viewWidth) * frameRect.width;
        const py = (pointY / viewHeight) * frameRect.height;
        const tooltipRect = tooltip.getBoundingClientRect();
        let left = px + 12;
        let top = py - tooltipRect.height - 10;

        if (left + tooltipRect.width > frameRect.width - 8) {
            left = px - tooltipRect.width - 12;
        }
        if (left < 8) {
            left = 8;
        }
        if (top < 8) {
            top = py + 12;
        }
        if (top + tooltipRect.height > frameRect.height - 8) {
            top = frameRect.height - tooltipRect.height - 8;
        }

        tooltip.style.left = `${Math.round(left)}px`;
        tooltip.style.top = `${Math.round(top)}px`;
    };

    hoverSurface.addEventListener("pointerenter", (event) => {
        showHoverState(event.clientX, event.clientY);
    });
    hoverSurface.addEventListener("pointermove", (event) => {
        showHoverState(event.clientX, event.clientY);
    });
    hoverSurface.addEventListener("pointerleave", hideHoverState);
    hoverSurface.addEventListener("pointercancel", hideHoverState);

    chartFrame.appendChild(svg);
    chartFrame.appendChild(tooltip);

    wrapper.appendChild(head);
    wrapper.appendChild(chartFrame);
    return wrapper;
}

function buildEloFallbackMessage(opening, usageStats) {
    const reason = normalizeText(usageStats?.reason);
    const protocolHint = window.location.protocol === "file:"
        ? " Open page via local server (http://localhost), not file://."
        : "";
    const authHint = usageStats?.reasonCode === "auth_required"
        ? " Lichess Opening Explorer now requires authentication token."
        : "";

    if (reason) {
        return `Online data unavailable (${reason}).${authHint}${protocolHint}`.trim();
    }

    return `Online data is unavailable now, fallback range is shown.${authHint}${protocolHint}`.trim();
}

function createEloNoStatsCard(message = "") {
    const wrapper = document.createElement("div");
    wrapper.className = "elo-suitability elo-suitability--empty";

    const label = document.createElement("div");
    label.className = "elo-suitability__label";
    label.textContent = "Opening usage by Elo";

    const status = document.createElement("div");
    status.className = "elo-suitability__status elo-suitability__status--centered";
    status.textContent = normalizeText(message, "Statistics for this opening are not available yet.");

    wrapper.appendChild(label);
    wrapper.appendChild(status);
    return wrapper;
}

function createEloLoadingCard() {
    const wrapper = document.createElement("div");
    wrapper.className = "elo-suitability elo-suitability--loading";

    const label = document.createElement("div");
    label.className = "elo-suitability__label";
    label.textContent = "Opening usage by Elo";

    const status = document.createElement("div");
    status.className = "elo-suitability__status";
    status.textContent = "Loading online statistics...";

    const loadingBar = document.createElement("div");
    loadingBar.className = "elo-suitability__loading-bar";

    wrapper.appendChild(label);
    wrapper.appendChild(status);
    wrapper.appendChild(loadingBar);
    return wrapper;
}

async function renderEloUsagePanel(opening) {
    if (!elements.openingEloSuitability) return;

    const requestId = ++latestEloRenderRequest;
    elements.openingEloSuitability.innerHTML = "";
    elements.openingEloSuitability.appendChild(createEloLoadingCard());

    const usageStats = await fetchOpeningEloUsageStats(opening);
    if (requestId !== latestEloRenderRequest || !elements.openingEloSuitability) return;

    elements.openingEloSuitability.innerHTML = "";
    if (usageStats?.ok) {
        elements.openingEloSuitability.appendChild(createEloUsageChart(opening, usageStats));
        return;
    }

    if (usageStats?.reasonCode === "no_stats") {
        elements.openingEloSuitability.appendChild(createEloNoStatsCard(usageStats.reason));
        return;
    }

    const hasToken = Boolean(getOpeningExplorerToken());
    const showTokenAction = usageStats?.reasonCode === "auth_required";

    elements.openingEloSuitability.appendChild(
        createEloRangeFallbackBar(opening, buildEloFallbackMessage(opening, usageStats), {
            showTokenAction,
            tokenActionLabel: hasToken ? "Update token" : "Add token",
            onTokenAction: () => {
                const currentToken = getOpeningExplorerToken();
                const value = window.prompt(
                    "Paste your Lichess API token for Opening Explorer.\nLeave empty to remove token.",
                    currentToken
                );
                if (value === null) return;

                setOpeningExplorerToken(value);
                explorerCountCache.clear();
                openingEloUsageCache.clear();
                void renderEloUsagePanel(opening);
            }
        })
    );
}

function setHeroTone(level) {
    if (!elements.openingHeroCard) return;
    for (let index = 1; index <= 5; index += 1) {
        elements.openingHeroCard.classList.remove(`opening-hero-card--lvl-${index}`);
        elements.openingHeroCard.classList.remove(`opening-hero-shell--lvl-${index}`);
    }
    const toneLevel = clamp(level, 1, 5);
    elements.openingHeroCard.classList.add(`opening-hero-card--lvl-${toneLevel}`);
    elements.openingHeroCard.classList.add(`opening-hero-shell--lvl-${toneLevel}`);
}

function normalizeTipText(text) {
    const normalized = normalizeText(text)
        .replace(/\s+/g, " ")
        .replace(/[.!?]+$/g, "")
        .trim();

    if (!normalized) return "";
    if (normalized.length <= 56) return normalized;
    return `${normalized.slice(0, 53).trimEnd()}...`;
}

function countPlies(moves) {
    const moveText = normalizeText(moves)
        .replace(/\d+\.(\.\.)?/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (!moveText) return 0;
    return moveText.split(" ").filter(Boolean).length;
}

function buildMainLineTip(mainLineMoves) {
    const plies = countPlies(mainLineMoves);
    if (plies >= 10) return "Know first 10 half-moves before improvising";
    if (plies >= 8) return "Know first 8 half-moves before improvising";
    if (plies >= 6) return "Know first 6 half-moves before improvising";
    return "Know the core move order before improvising";
}

function getDifficultyTier(level) {
    if (level <= 2) return "basic";
    if (level === 3) return "intermediate";
    return "advanced";
}

function getAdvancedSquareTip(opening) {
    if (opening.firstMoveType === "king-pawn") {
        if (opening.side === "white") return "Control d5 and pressure f7 with piece coordination";
        return "Undermine e4 with ...d5 or ...c5 and contest c4";
    }

    if (opening.firstMoveType === "queen-pawn") {
        if (opening.side === "white") return "Fight for c5 and e5 before opening the center";
        return "Challenge c4 with ...c5 and pressure d4 base";
    }

    if (opening.firstMoveType === "flank") {
        if (opening.side === "white") return "Pressure d5 from c4 or f4 before wing expansion";
        return "Break in the center with ...d5 or ...e5 before flank play";
    }

    return "Claim c4-d4-e4 squares before tactical operations";
}

function getAdvancedWingTip(opening) {
    if (opening.side === "white") return "Start kingside attack only after center is stabilized";
    if (opening.side === "black") return "Build queenside counterplay against kingside attacks";
    return "Switch attack flank only when central tension is resolved";
}

function buildOpeningTips(opening, details) {
    const tips = [];

    const addTip = (icon, text) => {
        const normalized = normalizeTipText(text);
        if (!normalized) return;
        const exists = tips.some((item) => item.text.toLowerCase() === normalized.toLowerCase());
        if (exists) return;
        tips.push({ icon, text: normalized });
    };

    const tier = getDifficultyTier(opening.difficultyLevel);

    if (tier === "basic") {
        addTip("center", opening.side === "black"
            ? "Challenge white center from the first moves"
            : "Fight for the center from the first moves");
        addTip("develop", "Develop minor pieces before pawn storms");
        addTip("queen", "Do not bring the queen out too early");
        addTip("king", "Castle early and keep king safety first");
        addTip("safety", "Avoid pawn grabs when development is behind");
    } else if (tier === "intermediate") {
        addTip("center", "Control center tension before opening files");
        addTip("tension", opening.firstMoveType === "flank"
            ? "Use central breaks to punish passive wing setups"
            : "Time pawn breaks only with full piece support");
        addTip("develop", "Complete development before deep tactics");
        addTip("tempo", "Play with tempo and deny easy counterplay");
        addTip("safety", opening.side === "black"
            ? "Do not weaken king before counterplay is ready"
            : "Keep king safe while shifting to active play");
    } else {
        addTip("square", getAdvancedSquareTip(opening));
        addTip("flank", getAdvancedWingTip(opening));
        addTip("tension", opening.side === "black"
            ? "Choose ...d5 or ...c5 break only at tactical moments"
            : "Prepare c4/f4 breaks only when center is secured");
        addTip("tempo", "Keep move-order precision to avoid transposition traps");
        addTip("safety", opening.side === "black"
            ? "Activate queenside play before committing to king attack"
            : "Launch kingside initiative only with stable king cover");
    }

    if (details.mainLineMoves) {
        addTip("memory", buildMainLineTip(details.mainLineMoves));
    }

    (details.keyIdeas || []).forEach((idea) => {
        addTip("develop", idea);
    });

    const fallbackTips = [
        { icon: "center", text: "Take central space and keep it coordinated" },
        { icon: "develop", text: "Finish development before tactical operations" },
        { icon: "king", text: "Do not delay castling without concrete reason" },
        { icon: "tempo", text: "Avoid slow moves that lose initiative" },
        { icon: "safety", text: "Trade into endgame only with structural edge" }
    ];

    fallbackTips.forEach((tip) => addTip(tip.icon, tip.text));

    return tips.slice(0, 5).map((tip) => ({
        icon: tip.icon || "center",
        text: tip.text
    }));
}

function renderTips(opening, details) {
    if (!elements.openingTips) return;
    elements.openingTips.innerHTML = "";

    const tips = buildOpeningTips(opening, details);
    tips.forEach((tip) => {
        const item = document.createElement("li");
        item.className = "opening-tip";

        const icon = document.createElement("span");
        icon.className = "opening-tip__icon";
        icon.innerHTML = TIP_ICON_SVGS[tip.icon] || TIP_ICON_SVGS.center;
        icon.setAttribute("aria-hidden", "true");

        const text = document.createElement("span");
        text.className = "opening-tip__text";
        text.textContent = tip.text;

        item.appendChild(icon);
        item.appendChild(text);
        elements.openingTips.appendChild(item);
    });
}

function renderHero(opening, details) {
    if (elements.breadcrumbCurrent) {
        elements.breadcrumbCurrent.textContent = opening.name;
    }

    if (elements.openingTitle) {
        elements.openingTitle.textContent = opening.name;
    }

    setHeroTone(opening.difficultyLevel);

    if (elements.openingMetaGrid) {
        elements.openingMetaGrid.innerHTML = "";
        elements.openingMetaGrid.appendChild(
            createMetaItem(
                "First move",
                createIconTextValue(getFirstMoveIcon(opening.firstMoveType), getFirstMoveLabel(opening.firstMoveType))
            )
        );
        elements.openingMetaGrid.appendChild(
            createMetaItem(
                "Side",
                createIconTextValue(getSideIcon(opening.side), getSideLabel(opening.side), "meta-side")
            )
        );
        elements.openingMetaGrid.appendChild(
            createMetaItem(
                "Difficulty",
                createDifficultyScale(opening.difficultyLevel, `Difficulty ${opening.difficultyLevel} out of 5`)
            )
        );
        elements.openingMetaGrid.appendChild(
            createMetaItem(
                "Popularity",
                createPopularityScale(opening.popularityLevel, opening.difficultyLevel)
            )
        );
    }

    if (elements.openingEloSuitability) {
        elements.openingEloSuitability.innerHTML = "";
    }
    if (elements.openingTips) {
        elements.openingTips.innerHTML = "";
        elements.openingTips.hidden = true;
    }

    // Tips are intentionally hidden for now; keeping generation logic for future reuse.
    // renderTips(opening, details);
}

function buildExplorerUrl(openingId, options = {}) {
    const params = new URLSearchParams();
    params.set("opening", openingId);

    if (options.variation) {
        params.set("variation", options.variation);
    }

    if (options.line) {
        params.set("line", options.line);
    }

    return `${EXPLORER_URL}?${params.toString()}`;
}

function buildYouTubeUrl(openingName) {
    const query = normalizeText(openingName);
    if (!query) return "";
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} chess opening`)}`;
}

function renderActions(opening) {
    if (elements.openExplorerButton) {
        elements.openExplorerButton.disabled = false;
        elements.openExplorerButton.dataset.state = "blocked";
        elements.openExplorerButton.setAttribute("aria-disabled", "true");
        elements.openExplorerButton.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };
        elements.openExplorerButton.onkeydown = (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
            }
        };
    }

    if (elements.openYoutubeButton) {
        const youtubeUrl = buildYouTubeUrl(opening.name);
        if (!youtubeUrl) {
            elements.openYoutubeButton.hidden = true;
            elements.openYoutubeButton.removeAttribute("href");
            return;
        }

        elements.openYoutubeButton.hidden = false;
        elements.openYoutubeButton.href = youtubeUrl;
        elements.openYoutubeButton.setAttribute("aria-label", `Watch ${opening.name} on YouTube`);
    }
}

function createStackedVariationTitle(name) {
    const title = document.createElement("h3");
    title.className = "variation-name";

    const words = normalizeText(name).split(/\s+/).filter(Boolean);
    if (!words.length) {
        title.textContent = "Variation";
        return title;
    }

    words.forEach((word, index) => {
        const wordNode = document.createElement("span");
        wordNode.className = "variation-name__word";
        wordNode.textContent = word;
        wordNode.style.setProperty("--word-shift", `${Math.min(index * 7, 28)}px`);
        title.appendChild(wordNode);
    });

    return title;
}

function createVariationPositionPreview(opening, variation) {
    const previewWrap = document.createElement("div");
    previewWrap.className = "variation-position";

    const board = document.createElement("div");
    board.className = "variation-preview";
    board.setAttribute("role", "img");
    board.setAttribute("aria-label", `Position preview for ${variation.name}`);

    const variationFen = calculateVariationFen(variation.moves) || opening.fen;
    renderFenBoard(board, variationFen, opening.side, {
        squareBaseClass: "variation-square",
        lightClass: "light",
        darkClass: "dark",
        pieceClass: "variation-piece",
        animatedPieces: false
    });

    previewWrap.appendChild(board);
    return previewWrap;
}

function createVariationCard(opening, variation, index) {
    const card = document.createElement("article");
    card.className = "variation-card";
    card.classList.add(`variation-card--lvl-${variation.difficultyLevel}`);
    card.style.setProperty("--variation-enter-delay", `${Math.min(320 + (index * 70), 980)}ms`);
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `Open ${variation.name} in Explorer`);

    const openVariation = () => {
        navigateTo(buildExplorerUrl(opening.id, { variation: variation.id }));
    };

    card.addEventListener("click", () => {
        openVariation();
    });

    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openVariation();
        }
    });

    const head = document.createElement("div");
    head.className = "variation-card__head";

    const indexBadge = document.createElement("span");
    indexBadge.className = "variation-index";
    indexBadge.textContent = `#${String(index + 1).padStart(2, "0")}`;

    const difficultyPill = document.createElement("span");
    difficultyPill.className = "variation-pill";
    difficultyPill.textContent = variation.difficultyLabel;

    head.appendChild(indexBadge);
    head.appendChild(difficultyPill);

    const title = createStackedVariationTitle(variation.name);
    const preview = createVariationPositionPreview(opening, variation);

    const footer = document.createElement("div");
    footer.className = "variation-card__footer";

    const difficultyWrap = document.createElement("div");
    difficultyWrap.className = "variation-difficulty";

    const difficultyLabel = document.createElement("span");
    difficultyLabel.className = "variation-difficulty__label";
    difficultyLabel.textContent = "Difficulty";

    const difficultyScale = createDifficultyScale(
        variation.difficultyLevel,
        `Variation difficulty ${variation.difficultyLevel} out of 5`
    );

    difficultyWrap.appendChild(difficultyLabel);
    difficultyWrap.appendChild(difficultyScale);

    footer.appendChild(difficultyWrap);

    card.appendChild(head);
    card.appendChild(title);
    card.appendChild(preview);
    card.appendChild(footer);
    return card;
}

function renderVariations(opening, details) {
    if (!elements.variationsList || !elements.variationsEmpty) return;

    elements.variationsList.innerHTML = "";
    if (!details.variations.length) {
        elements.variationsEmpty.hidden = false;
        return;
    }

    elements.variationsEmpty.hidden = true;
    const sortedVariations = [...details.variations].sort((a, b) => {
        if (a.difficultyLevel !== b.difficultyLevel) return a.difficultyLevel - b.difficultyLevel;
        return a.name.localeCompare(b.name);
    });

    sortedVariations.forEach((variation, index) => {
        elements.variationsList.appendChild(createVariationCard(opening, variation, index));
    });
}

function syncTopbarOffset() {
    const topbar = document.querySelector(".topbar");
    const offset = topbar ? Math.ceil(topbar.getBoundingClientRect().height) : 84;
    document.documentElement.style.setProperty("--topbar-offset", `${offset}px`);
}

function renderOpeningPage(opening, detailsMap) {
    const details = detailsMap[opening.id] || {
        eco: "",
        keyIdeas: [],
        mainLineMoves: "",
        variations: []
    };

    document.title = `${opening.name} - ChessTree`;
    renderHero(opening, details);
    void renderEloUsagePanel(opening);
    renderBoardPreview(opening.fen, opening.side, opening.name);
    renderActions(opening);
    renderVariations(opening, details);
}

function renderUnavailable(message) {
    latestEloRenderRequest += 1;
    if (elements.breadcrumbCurrent) elements.breadcrumbCurrent.textContent = "Opening";
    if (elements.openingTitle) elements.openingTitle.textContent = "Opening unavailable";
    if (elements.openingMetaGrid) elements.openingMetaGrid.innerHTML = "";
    if (elements.openingEloSuitability) elements.openingEloSuitability.innerHTML = "";
    if (elements.openingTips) {
        elements.openingTips.innerHTML = "";
        elements.openingTips.hidden = true;
    }

    if (elements.variationsList) elements.variationsList.innerHTML = "";
    if (elements.variationsEmpty) {
        elements.variationsEmpty.hidden = false;
        elements.variationsEmpty.textContent = message;
    }

    if (elements.openExplorerButton) {
        elements.openExplorerButton.disabled = true;
        elements.openExplorerButton.onclick = null;
    }

    if (elements.openYoutubeButton) {
        elements.openYoutubeButton.hidden = true;
        elements.openYoutubeButton.removeAttribute("href");
    }

    if (elements.openingHeroCard) {
        for (let index = 1; index <= 5; index += 1) {
            elements.openingHeroCard.classList.remove(`opening-hero-card--lvl-${index}`);
            elements.openingHeroCard.classList.remove(`opening-hero-shell--lvl-${index}`);
        }
    }

    renderBoardPreview("", "", "Opening");
}

async function init() {
    syncTopbarOffset();
    const [metadataById, detailsMap, lichessStats] = await Promise.all([
        loadLibraryMetadata(),
        loadDetails(),
        loadOpeningStats()
    ]);
    const openings = await loadOpenings(metadataById, lichessStats.byId, {
        sourceName: lichessStats.sourceName,
        sourceUrl: lichessStats.sourceUrl
    });

    if (!openings.length) {
        renderUnavailable("Unable to load opening data. Start a local server and reload this page.");
        return;
    }

    const requestedId = getRequestedOpeningId();
    const opening = findOpening(openings, requestedId);
    if (!opening) {
        renderUnavailable("Opening is unavailable.");
        return;
    }

    renderOpeningPage(opening, detailsMap);
}

window.addEventListener("resize", syncTopbarOffset, { passive: true });
window.addEventListener("orientationchange", syncTopbarOffset);

init();
