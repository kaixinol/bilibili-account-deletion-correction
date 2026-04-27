import { DEAD_USERNAME } from "../shared/dead-username";
import type { ElementTextGetter, ProcessableElement } from "../types";

export function getLegacyText(el: ProcessableElement): string {
    return (el.text ?? el.textContent ?? "").toString();
}

export function setLegacyText(el: ProcessableElement, value: string): void {
    el.text = value;
    el.textContent = value;
}

export const getDefaultMatchText: ElementTextGetter = (tag) => {
    return getLegacyText(tag);
};

export const getFirstSegmentMatchText: ElementTextGetter = (tag) => {
    return (
        getLegacyText(tag)
            .split(" ")
            .filter((s) => s.trim() !== "")[0] ?? ""
    );
};

export function isDeadUsername(text: string): boolean {
    const trimmed = text.trim();
    return trimmed === DEAD_USERNAME || trimmed === `@${DEAD_USERNAME}`;
}
