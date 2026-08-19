import {
    GM_getValue,
    GM_registerMenuCommand,
    GM_setValue,
} from "$";

let check404 = GM_getValue<boolean>("check404", false);
let cache = GM_getValue<Record<string, boolean>>("404cache", {});

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
    return cache[uid];
}

export function setCached404(uid: string, is404: boolean): void {
    if (cache[uid] === is404) return;
    cache[uid] = is404;
    GM_setValue("404cache", cache);
}
