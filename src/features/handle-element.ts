import { makeLinkPreview } from "./link-preview";
import type {
    ElementHandleFunc,
    ElementTextGetter,
    ProcessableElement,
    RuleUidGetter,
    UidValue,
} from "../types";
import {
    getDefaultMatchText,
    getLegacyText,
    isDeadUsername,
    setLegacyText,
} from "../utils/text";
import {
    estimateRegisterTime,
    getHrefUid,
    uidToShortId,
} from "../utils/uid";

function appendShortId(
    tag: ProcessableElement,
    matchText: string,
    shortId: string,
): void {
    const originalText = getLegacyText(tag);

    if (originalText.includes(matchText)) {
        setLegacyText(tag, originalText.replace(matchText, matchText + shortId));
        return;
    }

    setLegacyText(tag, originalText.trim() + shortId);
}

function applyOverflowFallback(tag: ProcessableElement): void {
    if (tag.scrollWidth <= tag.clientWidth && tag.scrollHeight <= tag.clientHeight) {
        return;
    }

    tag.title = tag.textContent ?? "";

    if ((tag.textContent ?? "").includes(" · ")) {
        tag.textContent = (tag.textContent ?? "").replace(
            / · 收藏于\d+-\d+-\d+$/,
            "",
        );
    }
}

function attachRegisterTime(tag: ProcessableElement, time: string): void {
    const datasetTag = tag as HTMLElement & {
        dataset: DOMStringMap;
    };

    if (datasetTag.dataset.regTimeAdded) {
        return;
    }

    tag.setAttribute("data-reg-time", time);
    tag.title = tag.title
        ? `${tag.title}\n注册时间推测: ${time}`
        : `注册时间推测: ${time}`;
    datasetTag.dataset.regTimeAdded = "1";
}

export function annotateElements(elements: Iterable<ProcessableElement>): void {
    for (const tag of elements) {
        annotateElement(tag);
    }
}

function annotateElement(
    tag: ProcessableElement,
    matchText = getLegacyText(tag).trim(),
    uidGetter: RuleUidGetter = getHrefUid,
): void {
    const uid = uidGetter(tag);
    if (!uid) return;

    appendShortId(tag, matchText, uidToShortId(uid));
    applyOverflowFallback(tag);
    attachRegisterTime(tag, estimateRegisterTime(uid));
}

function annotateElementsWithMatchText(
    elements: Iterable<ProcessableElement>,
    matchText: string,
    uidGetter: RuleUidGetter = getHrefUid,
): void {
    for (const tag of elements) {
        annotateElement(tag, matchText, uidGetter);
    }
}

function handleOverrideElement(
    tag: ProcessableElement,
    displayText: string,
    uidGetter: RuleUidGetter = getHrefUid,
): void {
    const uid = uidGetter(tag);
    if (!uid) return;

    const targetUrl = `https://www.bilibili.com/list/${uid}`;
    makeLinkPreview(tag, targetUrl);

    tag.addEventListener(
        "click",
        (e) => {
            e.preventDefault();
            window.open(targetUrl, "_blank");
        },
        { capture: true },
    );

    const nameEl = tag.querySelector(".opus-module-author__name") as
        | (HTMLElement & { text?: string })
        | null;

    if (nameEl) {
        const newText = displayText + uidToShortId(uid);
        nameEl.text = newText;
        nameEl.textContent = newText;
    }

    tag.setAttribute("data-processed", "true");
}

function processNormalElement(tag: ProcessableElement, uid: UidValue): void {
    tag.href = `https://www.bilibili.com/list/${uid}`;
}

export const handleInterceptElement: ElementHandleFunc = (
    tag,
    textGetter = getDefaultMatchText,
    uidGetter = getHrefUid,
) => {
    const text = textGetter(tag);
    const str = text.trim();
    if (!isDeadUsername(str)) return;

    tag.style.fontStyle = "italic";

    const uid = uidGetter(tag);
    if (!uid) return;

    annotateElementsWithMatchText([tag], str, uidGetter);
    makeLinkPreview(tag, `https://www.bilibili.com/list/${uid}`);
};

export const handleOverrideProcessElement: ElementHandleFunc = (
    tag,
    textGetter = getDefaultMatchText,
    uidGetter = getHrefUid,
) => {
    const text = textGetter(tag);
    const str = text.trim();

    if (!isDeadUsername(str)) return;

    tag.style.fontStyle = "italic";

    handleOverrideElement(tag, str, uidGetter);
};

export function handleElement(
    tag: ProcessableElement,
    handleFunc?: ElementHandleFunc,
    textGetter: ElementTextGetter = getDefaultMatchText,
    uidGetter: RuleUidGetter = getHrefUid,
): void {
    if (handleFunc) {
        handleFunc(tag, textGetter, uidGetter);
        return;
    }

    const text = textGetter(tag);
    const str = text.trim();

    if (!isDeadUsername(str)) return;

    tag.style.fontStyle = "italic";

    const uid = uidGetter(tag);
    if (!uid) return;

    annotateElementsWithMatchText([tag], str, uidGetter);
    processNormalElement(tag, uid);
}
