import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
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
const OUTPUT_FILE = "data/openings/lichess-opening-stats.json";
const API_URLS = [
    "https://explorer.lichess.ovh/lichess",
    "https://explorer.lichess.org/lichess"
];
const SPEEDS = "blitz,rapid,classical";
const SINCE = `${Math.max(2000, new Date().getUTCFullYear() - 3)}-01`;
const RATING_BUCKETS = [100, 400, 700, 1000, 1300, 1600, 1900, 2200, 2500];
const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const ELO_MIN_BOUND = 100;
const ELO_MAX_BOUND = 2400;
const REQUEST_DELAY_MS = 90;

const token = process.env.LICHESS_API_TOKEN || process.env.LICHESS_TOKEN || "";

if (!token) {
    console.error("Missing API token. Set LICHESS_API_TOKEN and rerun.");
    process.exit(1);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function round(value, precision = 4) {
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
}

function toAbsolute(relPath) {
    return path.resolve(ROOT, relPath);
}

async function readJson(relPath) {
    const content = await fs.readFile(toAbsolute(relPath), "utf8");
    return JSON.parse(content);
}

function buildUrl(baseUrl, fen, rating) {
    const params = new URLSearchParams();
    params.set("variant", "standard");
    params.set("speeds", SPEEDS);
    params.set("ratings", String(rating));
    params.set("since", SINCE);
    params.set("fen", fen);
    return `${baseUrl}?${params.toString()}`;
}

function sumGames(payload) {
    const white = Number(payload?.white) || 0;
    const draws = Number(payload?.draws) || 0;
    const black = Number(payload?.black) || 0;
    return white + draws + black;
}

async function fetchCount(baseUrl, fen, rating) {
    const url = buildUrl(baseUrl, fen, rating);
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        return {
            ok: false,
            error: `${new URL(baseUrl).host} HTTP ${response.status}`
        };
    }

    const payload = await response.json();
    return {
        ok: true,
        count: sumGames(payload),
        sourceUrl: baseUrl
    };
}

async function fetchCountWithFallback(fen, rating, cache) {
    const key = `${fen}::${rating}`;
    if (cache.has(key)) return cache.get(key);

    const promise = (async () => {
        const errors = [];

        for (const baseUrl of API_URLS) {
            for (let attempt = 0; attempt < 3; attempt += 1) {
                const result = await fetchCount(baseUrl, fen, rating);
                if (result.ok) return result;

                if (String(result.error).includes("HTTP 429") && attempt < 2) {
                    await wait(700 * (attempt + 1));
                    continue;
                }

                errors.push(result.error);
                break;
            }
        }

        return {
            ok: false,
            count: null,
            sourceUrl: "",
            error: errors.join("; ") || "network"
        };
    })();

    cache.set(key, promise);
    return promise;
}

function normalizeRange(min, max, fallbackMin, fallbackMax) {
    const safeMin = Number.isFinite(min) ? min : fallbackMin;
    const safeMax = Number.isFinite(max) ? max : fallbackMax;
    const roundedMin = clamp(Math.round(safeMin / 100) * 100, ELO_MIN_BOUND, ELO_MAX_BOUND);
    const roundedMax = clamp(Math.round(safeMax / 100) * 100, ELO_MIN_BOUND, ELO_MAX_BOUND);
    if (roundedMin <= roundedMax) return { min: roundedMin, max: roundedMax };
    return { min: roundedMax, max: roundedMin };
}

function computeRecommendedRange(points, fallbackMin, fallbackMax) {
    const nonZero = points.filter((point) => point.percent > 0 && point.openingGames > 0);
    if (nonZero.length < 2) return normalizeRange(null, null, fallbackMin, fallbackMax);

    const maxPercent = Math.max(...nonZero.map((point) => point.percent));
    const active = nonZero.filter((point) => point.percent >= maxPercent * 0.35);
    const min = Math.min(...active.map((point) => Math.min(point.elo, ELO_MAX_BOUND)));
    const max = Math.max(...active.map((point) => Math.min(point.elo, ELO_MAX_BOUND)));
    return normalizeRange(min, max, fallbackMin, fallbackMax);
}

function assignPopularityLevels(items) {
    const candidates = items
        .filter((item) => item.hasPopularityStats)
        .sort((a, b) => a.popularityRaw - b.popularityRaw);
    const size = candidates.length;
    if (!size) return;

    candidates.forEach((item, index) => {
        const percentile = (index + 1) / size;
        item.popularityLevel = clamp(Math.ceil(percentile * 5), 1, 5);
    });
}

async function main() {
    const metadata = await readJson(LIBRARY_METADATA_FILE);
    const openings = await Promise.all(OPENING_FILES.map((file) => readJson(file)));
    const cache = new Map();
    const results = [];
    let defaultSourceUrl = "";

    for (const opening of openings) {
        const id = String(opening?.id || "").trim();
        const name = String(opening?.name || "").trim();
        const fen = String(opening?.fen || "").trim();
        if (!id || !name || !fen) continue;

        const fallbackMin = Number(metadata?.[id]?.recommendedEloMin) || Number(opening?.recommendedEloMin) || 100;
        const fallbackMax = Number(metadata?.[id]?.recommendedEloMax) || Number(opening?.recommendedEloMax) || 2400;
        const fallbackPopularity = Number(opening?.popularityLevel ?? opening?.popularity) || 3;

        const points = [];
        const errors = [];
        let sumOpeningGames = 0;
        let sumTotalGames = 0;
        let sourceUrl = "";

        for (const rating of RATING_BUCKETS) {
            const [openingResult, totalResult] = await Promise.all([
                fetchCountWithFallback(fen, rating, cache),
                fetchCountWithFallback(INITIAL_FEN, rating, cache)
            ]);

            await wait(REQUEST_DELAY_MS);

            if (!sourceUrl) {
                sourceUrl = openingResult.sourceUrl || totalResult.sourceUrl || "";
            }

            if (!openingResult.ok || !totalResult.ok) {
                if (openingResult.error) errors.push(openingResult.error);
                if (totalResult.error) errors.push(totalResult.error);
                continue;
            }

            const openingGames = Number(openingResult.count) || 0;
            const totalGames = Number(totalResult.count) || 0;
            if (totalGames <= 0) continue;

            sumOpeningGames += Math.max(0, openingGames);
            sumTotalGames += totalGames;
            if (openingGames <= 0) continue;

            const percent = (openingGames / totalGames) * 100;
            points.push({
                elo: rating,
                label: String(rating),
                percent: round(percent, 4),
                openingGames,
                totalGames
            });

        }

        const hasUsageStats = points.length >= 2;
        const hasPopularityStats = sumTotalGames > 0;
        const recommended = computeRecommendedRange(points, fallbackMin, fallbackMax);
        const popularityRaw = sumTotalGames > 0 ? (sumOpeningGames / sumTotalGames) : 0;

        results.push({
            id,
            name,
            sourceUrl,
            hasUsageStats,
            hasPopularityStats,
            reason: hasUsageStats ? "" : (errors[0] || "No reliable statistics for this opening yet"),
            usageByElo: points,
            recommendedEloMin: recommended.min,
            recommendedEloMax: recommended.max,
            popularityRaw,
            popularityLevel: clamp(fallbackPopularity, 1, 5)
        });

        if (!defaultSourceUrl && sourceUrl) {
            defaultSourceUrl = sourceUrl;
        }
    }

    assignPopularityLevels(results);

    const output = {
        _meta: {
            sourceName: "Lichess Opening Explorer",
            sourceUrl: defaultSourceUrl || API_URLS[0],
            generatedAt: new Date().toISOString(),
            since: SINCE,
            speeds: SPEEDS,
            ratingBuckets: RATING_BUCKETS
        },
        openings: {}
    };

    results.forEach((item) => {
        output.openings[item.id] = {
            hasUsageStats: item.hasUsageStats,
            reason: item.reason,
            usageByElo: item.usageByElo,
            popularityLevel: item.popularityLevel,
            popularityRaw: round(item.popularityRaw * 100, 6),
            recommendedEloMin: item.recommendedEloMin,
            recommendedEloMax: item.recommendedEloMax
        };
    });

    await fs.writeFile(toAbsolute(OUTPUT_FILE), `${JSON.stringify(output, null, 2)}\n`, "utf8");
    console.log(`Saved ${OUTPUT_FILE}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
