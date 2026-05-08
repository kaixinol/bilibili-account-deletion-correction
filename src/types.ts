export type UidValue = string | number | bigint;
export type ElementTextGetter = (tag: HTMLAnchorElement) => string;
export type RuleUidGetter = (
    tag: HTMLAnchorElement,
) => UidValue | undefined;
export type ElementHandleFunc = (
    tag: HTMLAnchorElement,
    textGetter?: ElementTextGetter,
    uidGetter?: RuleUidGetter,
) => void;
HTMLAnchorElement
export interface RuleConfig {
    query: string | string[];
    handleFunc?: ElementHandleFunc;
    textGetter?: ElementTextGetter;
    uidGetter?: RuleUidGetter;
    requirePolling?: boolean;
}

export type RangeRule = [min: bigint, max: bigint, date: string];
