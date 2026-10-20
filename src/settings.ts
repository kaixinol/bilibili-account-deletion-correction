import {
    GM_getValue,
    GM_registerMenuCommand,
    GM_setValue,
} from "$";

// 404cache 原先是无过期、无上限的单键累积写入，这里补上 TTL 与硬上限。
// 过期/超量条目的清理只在初始化时做一次，避免读取路径触发额外回写。
const CACHE_KEY = "404cache";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 10000;

type CacheEntry = [is404: boolean, expireAt: number];

function pruneCache(cache: Record<string, CacheEntry>, now: number): void {
    for (const [uid, entry] of Object.entries(cache)) {
        if (entry[1] <= now) delete cache[uid];
    }
    const uids = Object.keys(cache);
    if (uids.length > CACHE_MAX_ENTRIES) {
        uids.sort((a, b) => cache[a][1] - cache[b][1]);
        for (const uid of uids.slice(0, -CACHE_MAX_ENTRIES)) delete cache[uid];
    }
}

function loadCache(): Record<string, CacheEntry> {
    const raw = GM_getValue<Record<string, unknown>>(CACHE_KEY, {});
    const now = Date.now();
    const cache: Record<string, CacheEntry> = {};
    for (const [uid, entry] of Object.entries(raw)) {
        if (Array.isArray(entry) && typeof entry[0] === "boolean" && typeof entry[1] === "number") {
            cache[uid] = entry as CacheEntry;
        } else if (typeof entry === "boolean") {
            // 旧格式（裸布尔值）迁移：按全新 TTL 重新计时
            cache[uid] = [entry, now + CACHE_TTL_MS];
        }
    }
    pruneCache(cache, now);
    GM_setValue(CACHE_KEY, cache);
    return cache;
}

let check404 = GM_getValue<boolean>("check404", false);
let cache = loadCache();

function registerMenu(): void {
    GM_registerMenuCommand(
        check404
            ? "✓ 检测无投稿用户 (已开启)"
            : "✗ 检测无投稿用户 (已关闭)",
        () => {
            check404 = !check404;
            GM_setValue("check404", check404);
            registerMenu();
        },
    );
}

registerMenu();

export function isCheck404Enabled(): boolean {
    return check404;
}

export function getCached404(uid: string): boolean | undefined {
    const entry = cache[uid];
    if (!entry || entry[1] <= Date.now()) return undefined;
    return entry[0];
}

export function setCached404(uid: string, is404: boolean): void {
    const now = Date.now();
    const entry = cache[uid];
    if (entry && entry[0] === is404 && entry[1] > now) return;
    cache[uid] = [is404, now + CACHE_TTL_MS];
    GM_setValue(CACHE_KEY, cache);
}
