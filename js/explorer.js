const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const OPENING_DETAILS_FILE = "data/openings/opening-details.json";
const EXPLORER_STATE_KEY = "chess_tree_explorer_state_v2";
const LEGACY_EXPLORER_STATE_KEY = "explorer_current_opening";
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

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

const DIFFICULTY_PALETTES = {
    1: { accent: "#34d399", rgb: "52, 211, 153" },
    2: { accent: "#22c55e", rgb: "34, 197, 94" },
    3: { accent: "#f59e0b", rgb: "245, 158, 11" },
    4: { accent: "#f97316", rgb: "249, 115, 22" },
    5: { accent: "#ef4444", rgb: "239, 68, 68" }
};

const elements = {
    explorerStage: document.getElementById("explorerStage"),
    explorerEyebrow: document.getElementById("explorerEyebrow"),
    openingTitle: document.getElementById("openingTitle"),
    openingSubtitle: document.getElementById("openingSubtitle"),
    treeViewport: document.getElementById("treeViewport"),
    treeConnections: document.getElementById("treeConnections"),
    treeConnectionsGroup: document.getElementById("treeConnectionsGroup"),
    treeNodesLayer: document.getElementById("treeNodesLayer"),
    currentLineMoves: document.getElementById("currentLineMoves"),
    treeStatus: document.getElementById("treeStatus"),
    focusActiveNodeBtn: document.getElementById("focusActiveNodeBtn"),
    resumeLastOpeningBtn: document.getElementById("resumeLastOpeningBtn"),
    boardPanel: document.getElementById("boardPanel"),
    boardDragHandle: document.getElementById("boardDragHandle"),
    boardSourceLabel: document.getElementById("boardSourceLabel"),
    boardContextTitle: document.getElementById("boardContextTitle"),
    chessboard: document.getElementById("chessboard"),
    difficultyBadge: document.getElementById("difficultyBadge"),
    lineBadge: document.getElementById("lineBadge"),
    positionDescription: document.getElementById("positionDescription")
};

const state = {
    currentContext: null,
    savedContext: null,
    selectedLineId: "",
    hoveredNodeId: "",
    boardPanel: {
        x: 24,
        y: 24,
        isDragging: false,
        pointerId: null,
        offsetX: 0,
        offsetY: 0
    },
    tree: {
        nodes: [],
        edges: [],
        root: null,
        activeNode: null,
        draggedNode: null,
        camera: {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0
        },
        animationFrameId: 0,
        lastTimestamp: 0
    }
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function normalizeText(value, fallback = "") {
    if (typeof value !== "string") return fallback;
    const normalized = value.trim();
    return normalized || fallback;
}

function slugify(value) {
    return normalizeText(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function navigateTo(url) {
    if (typeof window.navigateWithTransition === "function") {
        window.navigateWithTransition(url);
        return;
    }
    window.location.href = url;
}

function buildExplorerUrl(openingId, options = {}) {
    const params = new URLSearchParams();
    if (openingId) params.set("opening", openingId);
    if (options.variation) params.set("variation", options.variation);
    if (options.source) params.set("source", options.source);
    return `explorer.html${params.toString() ? `?${params.toString()}` : ""}`;
}

function mapDifficultyLabelToLevel(rawLabel) {
    const normalized = normalizeText(rawLabel).toLowerCase();
    if (!normalized) return 3;
    if (normalized.includes("beginner")) return 1;
    if (normalized.includes("basic")) return 2;
    if (normalized.includes("intermediate")) return 3;
    if (normalized.includes("advanced")) return 4;
    if (normalized.includes("expert")) return 5;
    return 3;
}

function normalizeDifficultyLevel(rawLevel, rawLabel = "") {
    const numeric = Number.parseInt(rawLevel, 10);
    if (Number.isFinite(numeric)) return clamp(numeric, 1, 5);
    return clamp(mapDifficultyLabelToLevel(rawLabel), 1, 5);
}

function getDifficultyLabel(level) {
    if (level <= 1) return "Beginner";
    if (level <= 2) return "Basic";
    if (level <= 3) return "Intermediate";
    if (level <= 4) return "Advanced";
    return "Expert";
}

function normalizeSide(rawSide) {
    return normalizeText(rawSide).toLowerCase() === "black" ? "black" : "white";
}

function applyTone(level) {
    const palette = DIFFICULTY_PALETTES[clamp(level || 2, 1, 5)] || DIFFICULTY_PALETTES[2];
    if (!elements.explorerStage) return;
    elements.explorerStage.style.setProperty("--explorer-accent", palette.accent);
    elements.explorerStage.style.setProperty("--explorer-accent-rgb", palette.rgb);
    elements.explorerStage.style.setProperty("--explorer-accent-soft", `rgba(${palette.rgb}, 0.18)`);
    elements.explorerStage.style.setProperty("--explorer-line-strong", `rgba(${palette.rgb}, 0.58)`);
}

function parseFen(fen) {
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
            const middleRow = fromRow + direction;
            return !board[middleRow]?.[fromCol];
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
        board: parseFen(boardPart),
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

function calculateFenFromMoves(movesText) {
    const tokens = extractSanMoves(movesText);
    if (!tokens.length) return "";

    const position = createPositionFromFen(INITIAL_FEN);
    for (const token of tokens) {
        if (!applySanMove(position, token)) break;
    }

    return serializePositionToFen(position);
}

function buildLineSnapshots(movesText) {
    const tokens = extractSanMoves(movesText);
    const position = createPositionFromFen(INITIAL_FEN);
    const snapshots = [];

    tokens.forEach((token, index) => {
        const sideBeforeMove = position.sideToMove;
        if (!applySanMove(position, token)) return;

        const ply = index + 1;
        const moveNumber = Math.ceil(ply / 2);
        snapshots.push({
            san: token,
            fen: serializePositionToFen(position),
            sideBeforeMove,
            ply,
            moveNumber,
            moveLabel: sideBeforeMove === "white"
                ? `${moveNumber}. ${token}`
                : `${moveNumber}... ${token}`
        });
    });

    return snapshots;
}

function renderChessboard(fen, perspectiveSide = "white") {
    if (!elements.chessboard) return;

    elements.chessboard.innerHTML = "";
    const matrix = parseFen(fen || INITIAL_FEN);
    const isBlackPerspective = perspectiveSide === "black";

    for (let displayRow = 0; displayRow < 8; displayRow += 1) {
        for (let displayCol = 0; displayCol < 8; displayCol += 1) {
            const sourceRow = isBlackPerspective ? 7 - displayRow : displayRow;
            const sourceCol = isBlackPerspective ? 7 - displayCol : displayCol;

            const square = document.createElement("div");
            const isLight = (displayRow + displayCol) % 2 === 1;
            square.className = `board-square ${isLight ? "board-square--light" : "board-square--dark"}`;
            square.dataset.square = squareFromCoords(sourceRow, sourceCol);

            const pieceCode = matrix[sourceRow]?.[sourceCol];
            if (pieceCode && PIECE_IMAGES[pieceCode]) {
                const image = document.createElement("img");
                image.className = "board-piece";
                image.src = PIECE_IMAGES[pieceCode];
                image.alt = "";
                image.loading = "eager";
                image.decoding = "async";
                square.dataset.piece = pieceCode;
                square.appendChild(image);
            }

            elements.chessboard.appendChild(square);
        }
    }
}

async function readJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Unable to load ${url}: ${response.status}`);
    }
    return response.json();
}

function normalizeOpening(rawOpening, openingId) {
    return {
        id: normalizeText(rawOpening?.id, openingId),
        name: normalizeText(rawOpening?.name, "Opening"),
        tagline: normalizeText(rawOpening?.tagline),
        description: normalizeText(rawOpening?.description),
        fen: normalizeText(rawOpening?.fen, INITIAL_FEN),
        side: normalizeSide(rawOpening?.side),
        difficultyLevel: normalizeDifficultyLevel(rawOpening?.difficulty, rawOpening?.difficultyLabel),
        difficultyLabel: normalizeText(rawOpening?.difficultyLabel, getDifficultyLabel(normalizeDifficultyLevel(rawOpening?.difficulty, rawOpening?.difficultyLabel)))
    };
}

function normalizeVariation(rawVariation) {
    const name = normalizeText(rawVariation?.name, "Variation");
    const difficultyLevel = normalizeDifficultyLevel(rawVariation?.difficultyLevel, rawVariation?.difficulty);
    return {
        id: normalizeText(rawVariation?.id, slugify(name)),
        name,
        moves: normalizeText(rawVariation?.moves),
        description: normalizeText(rawVariation?.description),
        difficultyLevel,
        difficultyLabel: getDifficultyLabel(difficultyLevel)
    };
}

function normalizeDetails(rawDetails) {
    return {
        mainLineMoves: normalizeText(rawDetails?.mainLineMoves),
        variations: Array.isArray(rawDetails?.variations)
            ? rawDetails.variations.map(normalizeVariation).filter(Boolean)
            : []
    };
}

function createLineMeta(id, kind, name, moves, description, difficultyLevel) {
    return { id, kind, name, moves, description, difficultyLevel };
}

function buildExplorerTree(opening, details) {
    const root = {
        id: "root",
        san: "",
        moveLabel: "Start",
        fen: INITIAL_FEN,
        difficultyLevel: opening.difficultyLevel,
        descriptor: opening.name,
        children: [],
        parent: null,
        depth: 0,
        x: 0,
        y: 0,
        anchorX: 0,
        anchorY: 0,
        vx: 0,
        vy: 0,
        width: 128,
        height: 78,
        lineRefs: []
    };

    const lines = [];
    const nodes = [root];
    const edges = [];
    const nodesById = new Map([[root.id, root]]);
    const lineTerminals = new Map();
    let nodeCounter = 1;

    const mainLine = createLineMeta(
        "main-line",
        "main",
        `${opening.name} Main Line`,
        details.mainLineMoves,
        opening.tagline || opening.description,
        opening.difficultyLevel
    );
    if (mainLine.moves) lines.push(mainLine);

    details.variations.forEach((variation) => {
        lines.push(createLineMeta(
            `variation:${variation.id}`,
            "variation",
            variation.name,
            variation.moves,
            variation.description,
            variation.difficultyLevel
        ));
    });

    lines.forEach((line) => {
        let parent = root;
        const snapshots = buildLineSnapshots(line.moves);
        snapshots.forEach((snapshot, index) => {
            let child = parent.children.find((candidate) => candidate.san === snapshot.san && candidate.fen === snapshot.fen);
            if (!child) {
                child = {
                    id: `node-${nodeCounter}`,
                    san: snapshot.san,
                    moveLabel: snapshot.moveLabel,
                    fen: snapshot.fen,
                    difficultyLevel: line.difficultyLevel,
                    descriptor: line.name,
                    children: [],
                    parent,
                    depth: parent.depth + 1,
                    x: parent.x + 160,
                    y: parent.y,
                    anchorX: 0,
                    anchorY: 0,
                    vx: 0,
                    vy: 0,
                    width: 140,
                    height: 84,
                    lineRefs: []
                };
                nodeCounter += 1;
                parent.children.push(child);
                nodes.push(child);
                nodesById.set(child.id, child);
                edges.push({
                    id: `edge-${parent.id}-${child.id}`,
                    from: parent,
                    to: child,
                    lineIds: new Set([line.id])
                });
            } else {
                child.difficultyLevel = Math.max(child.difficultyLevel, line.difficultyLevel);
                child.descriptor = child.descriptor || line.name;
                const edge = edges.find((candidate) => candidate.from === parent && candidate.to === child);
                if (edge) edge.lineIds.add(line.id);
            }

            if (!child.lineRefs.some((ref) => ref.id === line.id)) {
                child.lineRefs.push({
                    id: line.id,
                    kind: line.kind,
                    name: line.name,
                    description: line.description,
                    difficultyLevel: line.difficultyLevel,
                    terminal: index === snapshots.length - 1
                });
            }

            parent = child;
        });

        if (parent !== root) {
            lineTerminals.set(line.id, parent);
        }
    });

    applyInitialTreeLayout(root);
    return { root, nodes, edges, nodesById, lines, lineTerminals };
}

function applyInitialTreeLayout(root) {
    const leafState = { index: 0 };

    function assignOrder(node) {
        if (!node.children.length) {
            node.order = leafState.index;
            leafState.index += 1;
            return node.order;
        }

        const orders = node.children.map(assignOrder);
        node.order = orders.reduce((sum, value) => sum + value, 0) / orders.length;
        return node.order;
    }

    assignOrder(root);
    const centerOrder = leafState.index > 0 ? (leafState.index - 1) / 2 : 0;

    function place(node) {
        node.anchorX = node.depth * 180;
        node.anchorY = (node.order - centerOrder) * 120;
        node.x = node.anchorX + (node.depth === 0 ? 0 : ((node.order % 2 === 0) ? -8 : 8));
        node.y = node.anchorY;
        node.children.forEach(place);
    }

    place(root);
    root.x = 0;
    root.y = 0;
    root.anchorX = 0;
    root.anchorY = 0;
}

function getSavedExplorerState() {
    try {
        const parsed = JSON.parse(localStorage.getItem(EXPLORER_STATE_KEY) || "null");
        if (parsed && parsed.openingId) return parsed;
    } catch (_error) {
        // Ignore invalid state and continue with a safe fallback.
    }

    try {
        const legacy = JSON.parse(localStorage.getItem(LEGACY_EXPLORER_STATE_KEY) || "null");
        if (legacy && legacy.id) {
            return {
                openingId: legacy.id,
                variationId: normalizeText(legacy.variation),
                openingName: "",
                variationName: ""
            };
        }
    } catch (_error) {
        // Ignore invalid legacy state.
    }

    return null;
}

function saveExplorerState(context) {
    if (!context?.openingId) return;

    const payload = {
        openingId: context.openingId,
        openingName: context.openingName,
        variationId: context.variationId || "",
        variationName: context.variationName || "",
        source: context.source,
        savedAt: new Date().toISOString()
    };

    localStorage.setItem(EXPLORER_STATE_KEY, JSON.stringify(payload));
}

function getSourceLabel(source) {
    if (source === "variation") return "Variation preview";
    if (source === "opening") return "Opening preview";
    if (source === "restored") return "Restored tree";
    return "Toolbar entry";
}

function createDefaultContext(savedState) {
    const opening = {
        id: "",
        name: "Starting Position",
        tagline: "",
        description: "Open the Explorer from an opening page or a variation card to inspect a saved structure.",
        fen: INITIAL_FEN,
        side: "white",
        difficultyLevel: 2,
        difficultyLabel: "Basic"
    };
    const tree = buildExplorerTree(opening, { mainLineMoves: "", variations: [] });

    return {
        source: "toolbar",
        openingId: "",
        openingName: opening.name,
        variationId: "",
        variationName: "",
        openingDescription: opening.description,
        boardFen: INITIAL_FEN,
        boardPerspective: "white",
        boardTitle: opening.name,
        boardSourceLabel: getSourceLabel("toolbar"),
        title: "Starting Position",
        subtitle: savedState?.openingId
            ? "Default toolbar view. Use Resume Last Tree to jump back into the last opening you explored."
            : "Default toolbar view. Open an opening or variation to load a specific tree.",
        description: opening.description,
        difficultyLevel: opening.difficultyLevel,
        difficultyLabel: opening.difficultyLabel,
        selectedLineId: "",
        tree,
        activeNode: tree.root
    };
}

function findBestNodeByFen(tree, targetFen, preferredLineId = "") {
    const exactMatches = tree.nodes.filter((node) => node.fen === targetFen);
    if (exactMatches.length) {
        return exactMatches.find((node) => node.lineRefs.some((ref) => ref.id === preferredLineId)) || exactMatches[0];
    }

    if (preferredLineId && tree.lineTerminals.has(preferredLineId)) {
        return tree.lineTerminals.get(preferredLineId);
    }

    return tree.root;
}

async function loadOpeningContext(openingId, variationId = "", source = "opening") {
    const [rawOpening, allDetails] = await Promise.all([
        readJson(`data/openings/${openingId}.json`),
        readJson(OPENING_DETAILS_FILE)
    ]);

    const opening = normalizeOpening(rawOpening, openingId);
    const details = normalizeDetails(allDetails?.[openingId]);
    const variation = details.variations.find((candidate) => candidate.id === variationId) || null;
    const tree = buildExplorerTree(opening, details);

    const selectedLineId = variation ? `variation:${variation.id}` : "main-line";
    const boardFen = variation
        ? calculateFenFromMoves(variation.moves) || opening.fen
        : opening.fen || calculateFenFromMoves(details.mainLineMoves) || INITIAL_FEN;
    const activeNode = findBestNodeByFen(tree, boardFen, selectedLineId);
    const boardTitle = variation ? variation.name : opening.name;
    const subtitle = variation
        ? `${opening.name}. Variation selected from the opening page.`
        : opening.tagline || opening.description || `${opening.name} preview.`;
    const description = variation?.description || opening.description || opening.tagline || "Opening tree preview.";
    const difficultyLevel = variation ? variation.difficultyLevel : opening.difficultyLevel;
    const difficultyLabel = variation ? variation.difficultyLabel : opening.difficultyLabel;

    return {
        source,
        openingId: opening.id,
        openingName: opening.name,
        variationId: variation?.id || "",
        variationName: variation?.name || "",
        openingDescription: opening.description,
        boardFen,
        boardPerspective: opening.side,
        boardTitle,
        boardSourceLabel: getSourceLabel(source),
        title: opening.name,
        subtitle,
        description,
        difficultyLevel,
        difficultyLabel,
        selectedLineId,
        tree,
        activeNode
    };
}

function updateResumeButton() {
    const saved = state.savedContext;
    if (!elements.resumeLastOpeningBtn) return;

    if (!saved?.openingId || state.currentContext?.openingId === saved.openingId) {
        elements.resumeLastOpeningBtn.hidden = true;
        elements.resumeLastOpeningBtn.textContent = "Resume Last Tree";
        return;
    }

    elements.resumeLastOpeningBtn.hidden = false;
    elements.resumeLastOpeningBtn.textContent = `Resume ${saved.openingName || saved.openingId}`;
}

function getNodeDisplayMeta(node) {
    if (!node || node === state.tree.root) {
        return { tone: "Root", label: "Initial position" };
    }

    const lineRef = resolveLineRefForNode(node);
    const tone = lineRef?.kind === "variation" ? "Variation" : "Main line";
    const label = lineRef?.terminal
        ? lineRef.name
        : node.moveLabel;

    return { tone, label };
}

function createNodeElement(node) {
    const element = document.createElement("button");
    element.type = "button";
    element.className = "tree-node";
    element.dataset.nodeId = node.id;
    element.dataset.tone = String(clamp(node.difficultyLevel || 2, 1, 5));

    const { tone, label } = getNodeDisplayMeta(node);

    const toneTag = document.createElement("span");
    toneTag.className = "tree-node__tone";
    toneTag.textContent = tone;

    const move = document.createElement("span");
    move.className = "tree-node__move";
    move.textContent = node === state.tree.root ? "Start" : node.san;

    const descriptor = document.createElement("span");
    descriptor.className = "tree-node__label";
    descriptor.textContent = node === state.tree.root ? (state.currentContext?.openingName || "Initial position") : label;

    element.appendChild(toneTag);
    element.appendChild(move);
    element.appendChild(descriptor);
    node.element = element;

    element.addEventListener("pointerdown", (event) => startNodeDrag(event, node));
    return element;
}

function rebuildTreeScene(tree) {
    state.tree.nodes = tree.nodes;
    state.tree.edges = tree.edges;
    state.tree.root = tree.root;
    state.tree.activeNode = tree.activeNode || tree.root;

    if (!elements.treeNodesLayer || !elements.treeConnectionsGroup) return;

    elements.treeNodesLayer.innerHTML = "";
    elements.treeConnectionsGroup.innerHTML = "";

    tree.nodes.forEach((node) => {
        const nodeElement = createNodeElement(node);
        elements.treeNodesLayer.appendChild(nodeElement);
    });

    tree.edges.forEach((edge) => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.classList.add("tree-edge");
        edge.element = path;
        elements.treeConnectionsGroup.appendChild(path);
    });

    refreshNodeMetrics();
    markActivePath(state.tree.activeNode);
    syncTreeViewportMetrics();
    focusActiveNode(true);
    renderTreeFrame();
}

function refreshNodeMetrics() {
    state.tree.nodes.forEach((node) => {
        if (!node.element) return;
        node.width = node.element.offsetWidth || node.width || 140;
        node.height = node.element.offsetHeight || node.height || 84;
    });
}

function syncTreeViewportMetrics() {
    if (!elements.treeViewport || !elements.treeConnections) return;
    const width = elements.treeViewport.clientWidth || 1200;
    const height = elements.treeViewport.clientHeight || 760;
    elements.treeConnections.setAttribute("viewBox", `0 0 ${width} ${height}`);
}

function resolveLineRefForNode(node) {
    if (!node?.lineRefs?.length) return null;
    return node.lineRefs.find((ref) => ref.id === state.selectedLineId)
        || node.lineRefs.find((ref) => ref.terminal)
        || node.lineRefs[0];
}

function getNodePathText(node) {
    const segments = [];
    let cursor = node;

    while (cursor && cursor.parent) {
        segments.unshift(cursor.moveLabel);
        cursor = cursor.parent;
    }

    return segments.length ? segments.join(" ") : "Start position";
}

function updateContextPanels(node) {
    const activeNode = node || state.tree.activeNode || state.tree.root;
    const lineRef = resolveLineRefForNode(activeNode);
    const context = state.currentContext;

    if (elements.currentLineMoves) {
        elements.currentLineMoves.textContent = getNodePathText(activeNode);
    }

    if (elements.treeStatus) {
        const nodeCount = context?.tree?.nodes?.length || state.tree.nodes.length;
        const variationCount = context?.tree?.lines?.filter((line) => line.kind === "variation").length || 0;
        elements.treeStatus.textContent = `${nodeCount} nodes loaded. Drag nodes to refine the layout. ${variationCount ? `${variationCount} variation branches available.` : "Main line only for this view."}`;
    }

    if (elements.lineBadge) {
        if (!lineRef) {
            elements.lineBadge.textContent = "Start position";
        } else if (lineRef.kind === "variation") {
            elements.lineBadge.textContent = lineRef.name;
        } else {
            elements.lineBadge.textContent = "Main line";
        }
    }

    if (elements.positionDescription) {
        elements.positionDescription.textContent = lineRef?.description || context?.description || "Opening tree preview.";
    }

    if (elements.difficultyBadge) {
        const level = lineRef?.difficultyLevel || context?.difficultyLevel || 2;
        elements.difficultyBadge.textContent = getDifficultyLabel(level);
    }

    if (elements.boardContextTitle) {
        elements.boardContextTitle.textContent = lineRef?.kind === "variation"
            ? lineRef.name
            : (context?.boardTitle || "Starting Position");
    }
}

function markActivePath(activeNode) {
    state.tree.nodes.forEach((node) => {
        node.isActive = false;
        node.isOnPath = false;
    });

    state.tree.edges.forEach((edge) => {
        edge.isOnPath = false;
    });

    let cursor = activeNode;
    while (cursor) {
        cursor.isOnPath = true;
        if (cursor.parent) {
            const edge = state.tree.edges.find((candidate) => candidate.from === cursor.parent && candidate.to === cursor);
            if (edge) edge.isOnPath = true;
        }
        cursor = cursor.parent;
    }

    if (activeNode) activeNode.isActive = true;
}

function setActiveNode(node, options = {}) {
    if (!node) return;
    state.tree.activeNode = node;
    state.selectedLineId = resolveLineRefForNode(node)?.id || state.currentContext?.selectedLineId || "";
    markActivePath(node);
    renderChessboard(node.fen || state.currentContext?.boardFen || INITIAL_FEN, state.currentContext?.boardPerspective || "white");
    updateContextPanels(node);
    if (options.center !== false) {
        focusActiveNode(options.immediate === true);
    }
    renderTreeFrame();
}

function getBoardRectWithinViewport() {
    if (!elements.treeViewport || !elements.boardPanel || window.innerWidth <= 860) {
        return null;
    }

    const viewportRect = elements.treeViewport.getBoundingClientRect();
    const boardRect = elements.boardPanel.getBoundingClientRect();

    return {
        left: clamp(boardRect.left - viewportRect.left, 0, viewportRect.width),
        top: clamp(boardRect.top - viewportRect.top, 0, viewportRect.height),
        right: clamp(boardRect.right - viewportRect.left, 0, viewportRect.width),
        bottom: clamp(boardRect.bottom - viewportRect.top, 0, viewportRect.height),
        width: boardRect.width,
        height: boardRect.height
    };
}

function getPreferredTreeCenter() {
    if (!elements.treeViewport) return { x: 0, y: 0 };

    const width = elements.treeViewport.clientWidth || 0;
    const height = elements.treeViewport.clientHeight || 0;
    const boardRect = getBoardRectWithinViewport();

    if (!boardRect) {
        return { x: width / 2, y: height / 2 };
    }

    const margin = 28;
    const candidates = [
        {
            area: Math.max(0, boardRect.left - margin) * Math.max(0, height - margin * 2),
            center: { x: Math.max(margin, boardRect.left / 2), y: height / 2 }
        },
        {
            area: Math.max(0, width - boardRect.right - margin) * Math.max(0, height - margin * 2),
            center: { x: boardRect.right + Math.max(0, width - boardRect.right - margin) / 2, y: height / 2 }
        },
        {
            area: Math.max(0, height - boardRect.bottom - margin) * Math.max(0, width - margin * 2),
            center: { x: width / 2, y: boardRect.bottom + Math.max(0, height - boardRect.bottom - margin) / 2 }
        },
        {
            area: Math.max(0, boardRect.top - margin) * Math.max(0, width - margin * 2),
            center: { x: width / 2, y: Math.max(margin, boardRect.top / 2) }
        }
    ];

    candidates.sort((a, b) => b.area - a.area);
    return candidates[0]?.center || { x: width / 2, y: height / 2 };
}

function focusActiveNode(immediate = false) {
    const activeNode = state.tree.activeNode || state.tree.root;
    if (!activeNode || !elements.treeViewport) return;

    const center = getPreferredTreeCenter();
    state.tree.camera.targetX = center.x - activeNode.x - (activeNode.width / 2);
    state.tree.camera.targetY = center.y - activeNode.y - (activeNode.height / 2);

    if (immediate) {
        state.tree.camera.x = state.tree.camera.targetX;
        state.tree.camera.y = state.tree.camera.targetY;
    }
}

function renderTreeFrame() {
    const camera = state.tree.camera;

    if (elements.treeNodesLayer) {
        elements.treeNodesLayer.style.transform = `translate(${camera.x}px, ${camera.y}px)`;
    }

    if (elements.treeConnectionsGroup) {
        elements.treeConnectionsGroup.setAttribute("transform", `translate(${camera.x} ${camera.y})`);
    }

    state.tree.nodes.forEach((node) => {
        if (!node.element) return;
        node.element.style.left = `${node.x}px`;
        node.element.style.top = `${node.y}px`;
        node.element.classList.toggle("is-active", Boolean(node.isActive));
        node.element.classList.toggle("is-on-path", Boolean(node.isOnPath));
        node.element.classList.toggle("is-dragging", state.tree.draggedNode === node);
    });

    state.tree.edges.forEach((edge) => {
        if (!edge.element) return;
        const fromX = edge.from.x + (edge.from.width / 2);
        const fromY = edge.from.y + (edge.from.height / 2);
        const toX = edge.to.x + (edge.to.width / 2);
        const toY = edge.to.y + (edge.to.height / 2);
        const direction = toX >= fromX ? 1 : -1;
        const curve = Math.max(40, Math.abs(toX - fromX) * 0.42);
        edge.element.setAttribute(
            "d",
            `M ${fromX} ${fromY} C ${fromX + (curve * direction)} ${fromY}, ${toX - (curve * direction)} ${toY}, ${toX} ${toY}`
        );
        edge.element.classList.toggle("is-on-path", Boolean(edge.isOnPath));
    });
}

function applyPhysicsStep(deltaTime) {
    const nodes = state.tree.nodes;
    if (!nodes.length) return;

    const dt = clamp(deltaTime / 16.67, 0.65, 1.5);
    const forces = new Map(nodes.map((node) => [node.id, { x: 0, y: 0 }]));

    for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        for (let inner = index + 1; inner < nodes.length; inner += 1) {
            const other = nodes[inner];
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const distance = Math.max(18, Math.sqrt((dx * dx) + (dy * dy)));
            if (distance > 280) continue;

            const strength = 4200 / (distance * distance);
            const pushX = (dx / distance) * strength;
            const pushY = (dy / distance) * strength;

            forces.get(node.id).x -= pushX;
            forces.get(node.id).y -= pushY;
            forces.get(other.id).x += pushX;
            forces.get(other.id).y += pushY;
        }
    }

    state.tree.edges.forEach((edge) => {
        const dx = edge.to.x - edge.from.x;
        const dy = edge.to.y - edge.from.y;
        const distance = Math.max(1, Math.sqrt((dx * dx) + (dy * dy)));
        const targetDistance = 170;
        const spring = (distance - targetDistance) * 0.022;
        const pullX = (dx / distance) * spring;
        const pullY = (dy / distance) * spring;

        forces.get(edge.from.id).x += pullX;
        forces.get(edge.from.id).y += pullY;
        forces.get(edge.to.id).x -= pullX;
        forces.get(edge.to.id).y -= pullY;
    });

    nodes.forEach((node) => {
        const force = forces.get(node.id);
        force.x += (node.anchorX - node.x) * (node === state.tree.root ? 0.14 : 0.032);
        force.y += (node.anchorY - node.y) * (node === state.tree.root ? 0.14 : 0.032);
    });

    nodes.forEach((node) => {
        if (node === state.tree.root) {
            node.x += (node.anchorX - node.x) * 0.24 * dt;
            node.y += (node.anchorY - node.y) * 0.24 * dt;
            node.vx = 0;
            node.vy = 0;
            return;
        }

        if (state.tree.draggedNode === node) {
            node.vx = 0;
            node.vy = 0;
            return;
        }

        const force = forces.get(node.id);
        node.vx = (node.vx + (force.x * dt)) * 0.82;
        node.vy = (node.vy + (force.y * dt)) * 0.82;

        node.vx = clamp(node.vx, -11, 11);
        node.vy = clamp(node.vy, -11, 11);

        node.x += node.vx * dt;
        node.y += node.vy * dt;
    });
}

function animateExplorer(timestamp) {
    if (!state.tree.lastTimestamp) {
        state.tree.lastTimestamp = timestamp;
    }

    const delta = timestamp - state.tree.lastTimestamp;
    state.tree.lastTimestamp = timestamp;

    applyPhysicsStep(delta);

    const camera = state.tree.camera;
    camera.x += (camera.targetX - camera.x) * 0.12;
    camera.y += (camera.targetY - camera.y) * 0.12;

    renderTreeFrame();
    state.tree.animationFrameId = window.requestAnimationFrame(animateExplorer);
}

function ensureAnimationLoop() {
    if (state.tree.animationFrameId) return;
    state.tree.animationFrameId = window.requestAnimationFrame(animateExplorer);
}

function screenToWorld(clientX, clientY) {
    const viewportRect = elements.treeViewport.getBoundingClientRect();
    return {
        x: clientX - viewportRect.left - state.tree.camera.x,
        y: clientY - viewportRect.top - state.tree.camera.y
    };
}

function startNodeDrag(event, node) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    state.tree.draggedNode = node;
    node.dragStartWorld = screenToWorld(event.clientX, event.clientY);
    node.dragOffsetX = node.dragStartWorld.x - node.x;
    node.dragOffsetY = node.dragStartWorld.y - node.y;
    node.dragMoved = false;
    node.element?.setPointerCapture?.(event.pointerId);
}

function handleNodePointerMove(event) {
    const node = state.tree.draggedNode;
    if (!node) return;

    const world = screenToWorld(event.clientX, event.clientY);
    const nextX = world.x - node.dragOffsetX;
    const nextY = world.y - node.dragOffsetY;
    node.dragMoved = node.dragMoved
        || Math.abs(nextX - node.x) > 1.5
        || Math.abs(nextY - node.y) > 1.5;
    node.x = nextX;
    node.y = nextY;
    node.vx = 0;
    node.vy = 0;
    renderTreeFrame();
}

function handleNodePointerUp(event) {
    const node = state.tree.draggedNode;
    if (!node) return;

    node.element?.releasePointerCapture?.(event.pointerId);
    state.tree.draggedNode = null;

    if (!node.dragMoved) {
        setActiveNode(node, { immediate: false });
    }
}

function syncBoardPanelPosition() {
    if (!elements.explorerStage || !elements.boardPanel || window.innerWidth <= 860) return;

    const stageRect = elements.explorerStage.getBoundingClientRect();
    const panelWidth = elements.boardPanel.offsetWidth;
    const panelHeight = elements.boardPanel.offsetHeight;
    const maxX = Math.max(24, stageRect.width - panelWidth - 24);
    const maxY = Math.max(24, stageRect.height - panelHeight - 24);

    state.boardPanel.x = clamp(state.boardPanel.x, 24, maxX);
    state.boardPanel.y = clamp(state.boardPanel.y, 24, maxY);
    elements.boardPanel.style.left = `${state.boardPanel.x}px`;
    elements.boardPanel.style.top = `${state.boardPanel.y}px`;
}

function startBoardDrag(event) {
    if (window.innerWidth <= 860 || event.button !== 0 || !elements.explorerStage) return;

    const stageRect = elements.explorerStage.getBoundingClientRect();
    const panelRect = elements.boardPanel.getBoundingClientRect();
    state.boardPanel.isDragging = true;
    state.boardPanel.pointerId = event.pointerId;
    state.boardPanel.offsetX = event.clientX - panelRect.left;
    state.boardPanel.offsetY = event.clientY - panelRect.top;
    elements.boardPanel.classList.add("is-dragging");
    elements.boardDragHandle?.setPointerCapture?.(event.pointerId);
}

function handleBoardPointerMove(event) {
    if (!state.boardPanel.isDragging || !elements.explorerStage || !elements.boardPanel) return;

    const stageRect = elements.explorerStage.getBoundingClientRect();
    const width = elements.boardPanel.offsetWidth;
    const height = elements.boardPanel.offsetHeight;
    const rawX = event.clientX - stageRect.left - state.boardPanel.offsetX;
    const rawY = event.clientY - stageRect.top - state.boardPanel.offsetY;
    const maxX = Math.max(24, stageRect.width - width - 24);
    const maxY = Math.max(24, stageRect.height - height - 24);

    state.boardPanel.x = clamp(rawX, 24, maxX);
    state.boardPanel.y = clamp(rawY, 24, maxY);
    elements.boardPanel.style.left = `${state.boardPanel.x}px`;
    elements.boardPanel.style.top = `${state.boardPanel.y}px`;
    focusActiveNode(false);
}

function handleBoardPointerUp(event) {
    if (!state.boardPanel.isDragging) return;
    state.boardPanel.isDragging = false;
    elements.boardPanel?.classList.remove("is-dragging");
    elements.boardDragHandle?.releasePointerCapture?.(state.boardPanel.pointerId || event.pointerId);
    state.boardPanel.pointerId = null;
}

function renderContext(context) {
    state.currentContext = context;
    state.selectedLineId = context.selectedLineId || "";

    applyTone(context.difficultyLevel);

    if (elements.explorerEyebrow) {
        elements.explorerEyebrow.textContent = context.boardSourceLabel;
    }
    if (elements.openingTitle) {
        elements.openingTitle.textContent = context.title;
    }
    if (elements.openingSubtitle) {
        elements.openingSubtitle.textContent = context.subtitle;
    }
    if (elements.boardSourceLabel) {
        elements.boardSourceLabel.textContent = context.boardSourceLabel;
    }
    if (elements.boardContextTitle) {
        elements.boardContextTitle.textContent = context.boardTitle;
    }
    if (elements.positionDescription) {
        elements.positionDescription.textContent = context.description;
    }
    if (elements.difficultyBadge) {
        elements.difficultyBadge.textContent = context.difficultyLabel;
    }
    if (elements.lineBadge) {
        elements.lineBadge.textContent = context.variationName || (context.selectedLineId === "main-line" ? "Main line" : "Start position");
    }

    renderChessboard(context.boardFen, context.boardPerspective);
    rebuildTreeScene(context.tree);
    setActiveNode(context.activeNode || context.tree.root, { immediate: true });
    syncBoardPanelPosition();
    focusActiveNode(true);
    updateResumeButton();
}

async function hydrateFromRequest() {
    state.savedContext = getSavedExplorerState();

    const params = new URLSearchParams(window.location.search);
    const openingId = normalizeText(params.get("opening"));
    const variationId = normalizeText(params.get("variation"));
    const source = normalizeText(params.get("source"), openingId ? (variationId ? "variation" : "opening") : "toolbar");

    if (!openingId) {
        renderContext(createDefaultContext(state.savedContext));
        history.replaceState(null, "", buildExplorerUrl("", { source: "toolbar" }));
        return;
    }

    try {
        const context = await loadOpeningContext(openingId, variationId, source);
        renderContext(context);
        saveExplorerState(context);
        state.savedContext = getSavedExplorerState();
        updateResumeButton();
        history.replaceState(null, "", buildExplorerUrl(context.openingId, {
            variation: context.variationId,
            source
        }));
    } catch (error) {
        console.error("Explorer load failed:", error);
        const fallback = createDefaultContext(state.savedContext);
        fallback.subtitle = "The requested opening could not be loaded, so Explorer fell back to the default position.";
        renderContext(fallback);
    }
}

async function resumeSavedContext() {
    const saved = getSavedExplorerState();
    if (!saved?.openingId) return;

    const source = saved.variationId ? "restored" : "restored";
    const context = await loadOpeningContext(saved.openingId, saved.variationId, source);
    renderContext(context);
    saveExplorerState(context);
    state.savedContext = getSavedExplorerState();
    updateResumeButton();
    history.replaceState(null, "", buildExplorerUrl(context.openingId, {
        variation: context.variationId,
        source
    }));
}

function setupEventListeners() {
    elements.focusActiveNodeBtn?.addEventListener("click", () => focusActiveNode(false));
    elements.resumeLastOpeningBtn?.addEventListener("click", () => {
        resumeSavedContext().catch((error) => {
            console.error("Unable to restore explorer state:", error);
        });
    });

    elements.boardDragHandle?.addEventListener("pointerdown", startBoardDrag);
    window.addEventListener("pointermove", (event) => {
        handleBoardPointerMove(event);
        handleNodePointerMove(event);
    });
    window.addEventListener("pointerup", (event) => {
        handleBoardPointerUp(event);
        handleNodePointerUp(event);
    });
    window.addEventListener("resize", () => {
        syncBoardPanelPosition();
        syncTreeViewportMetrics();
        refreshNodeMetrics();
        focusActiveNode(true);
    });
}

function initializeExplorer() {
    setupEventListeners();
    hydrateFromRequest();
    ensureAnimationLoop();
}

window.ExplorerAPI = {
    loadOpening: async (openingId, variationId = "") => {
        const context = await loadOpeningContext(openingId, variationId, variationId ? "variation" : "opening");
        renderContext(context);
        saveExplorerState(context);
        state.savedContext = getSavedExplorerState();
        updateResumeButton();
        history.replaceState(null, "", buildExplorerUrl(context.openingId, {
            variation: context.variationId,
            source: context.source
        }));
    },
    resumeLast: resumeSavedContext
};

document.addEventListener("DOMContentLoaded", initializeExplorer);
