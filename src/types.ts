export interface ProcessableElement extends HTMLElement {
    href?: string;
    text?: string;
}

export type UidValue = string | number | bigint;
export type ElementTextGetter = (tag: ProcessableElement) => string;
export type RuleUidGetter = (
    tag: ProcessableElement,
) => UidValue | undefined;
export type ElementHandleFunc = (
    tag: ProcessableElement,
    textGetter?: ElementTextGetter,
    uidGetter?: RuleUidGetter,
) => void;

export interface RuleConfig {
    query: string | string[];
    handleFunc?: ElementHandleFunc;
    textGetter?: ElementTextGetter;
    uidGetter?: RuleUidGetter;
}

export interface RangeRule {
    min: bigint;
    max: bigint;
    date: string;
}
