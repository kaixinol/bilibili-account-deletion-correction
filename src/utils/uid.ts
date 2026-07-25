import type {  RuleUidGetter } from "../types";
import { REG_TIME_RANGES, SHORT_ID_CHARS } from "../shared/uid-data";

export function uidToShortId(n: string | number | bigint): string {
    let value = BigInt(n);
    let result = "";

    while (value > 0n) {
        result = SHORT_ID_CHARS[Number(value % 64n)] + result;
        value /= 64n;
    }

    return result || "A";
}

export function estimateRegisterTime(uid: string | number | bigint): string {
    const uidStr = String(uid);
    const n = BigInt(uidStr);
    const len = uidStr.length;

    if (len === 15 || len === 16) {
        return "≈ 2022-03-21 之后（15/16位UID时代）";
    }

    if (len === 10) {
        return "≈ 2020-10-29 之后（10位UID时代）";
    }

    for (const [min, max, date] of REG_TIME_RANGES) {
        if (n >= min && n <= max) {
            return date;
        }
    }

    return "未知时间";
}

export const getHrefUid: RuleUidGetter = (tag: HTMLAnchorElement) => {
    const uidMatch = tag.href?.match(/\/(\d+)\??/) ?? null;
    return uidMatch?.[1];
};

export const getHrefUidFromParent: RuleUidGetter = (tag: HTMLAnchorElement) => {
    const parent = tag.closest("a") as HTMLAnchorElement | null;
    if (!parent) return undefined;
    const uidMatch = parent.href?.match(/\/(\d+)\??/) ?? null;
    return uidMatch?.[1];
};

export const getOpusStateUid: RuleUidGetter = () => {
    const state = window.__INITIAL_STATE__?.detail;

    return (
        state?.basic?.uid ??
        state?.modules?.find((m) => m.module_author)?.module_author?.mid
    );
};
