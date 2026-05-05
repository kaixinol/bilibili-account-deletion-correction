import { makeLinkPreview } from "./link-preview";
import type {
    ElementHandleFunc,
    ElementTextGetter,
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
    tag: HTMLAnchorElement,
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

function applyOverflowFallback(tag: HTMLAnchorElement): void {
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

function attachRegisterTime(tag: HTMLAnchorElement, time: string): void {
    if (tag.title.includes("注册时间推测")) {
        return;
    }

    tag.title = tag.title
        ? `${tag.title}\n注册时间推测: ${time}`
        : `注册时间推测: ${time}`;
}

export function annotateElements(elements: Iterable<HTMLAnchorElement>): void {
    for (const tag of elements) {
        annotateElement(tag);
    }
}

function annotateElement(
    tag: HTMLAnchorElement,
    matchText = getLegacyText(tag).trim(),
    uidGetter: RuleUidGetter = getHrefUid,
): void {
    const uid = uidGetter(tag);
    if (!uid) return;

    appendShortId(tag, matchText, uidToShortId(uid));
    applyOverflowFallback(tag);
    attachRegisterTime(tag, estimateRegisterTime(uid));
    processNormalElement(tag, uid);
}

function annotateElementsWithMatchText(
    elements: Iterable<HTMLAnchorElement>,
    matchText: string,
    uidGetter: RuleUidGetter = getHrefUid,
): void {
    for (const tag of elements) {
        annotateElement(tag, matchText, uidGetter);
    }
}

function handleOverrideElement(
    tag: HTMLAnchorElement,
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

    tag.setAttribute("data-bilifix-processed", "true");
}

function processNormalElement(tag: HTMLAnchorElement, uid: UidValue): void {
    tag.href = `https://www.bilibili.com/list/${uid}`;
}

/**
 * 处理视频/列表页面的"账号已注销"用户链接
 * 使用代理元素拦截点击，而非直接修改 href（避免被 B 站重置）
 * 效果：点击"账号已注销"文本会打开 https://www.bilibili.com/list/{uid}
 */
export const handleInterceptElement: ElementHandleFunc = (
    tag,
    textGetter = getDefaultMatchText,
    uidGetter = getHrefUid,
) => {
    tag.classList.remove("up-name"); // 不暂时删除很快会被B站改回原名
    const text = textGetter(tag);
    const str = text.trim();
    if (!isDeadUsername(str)) return;

    tag.style.fontStyle = "italic";

    const uid = uidGetter(tag);
    if (!uid) return;
    annotateElementsWithMatchText([tag], str, uidGetter);
    makeLinkPreview(tag, `https://www.bilibili.com/list/${uid}`);
    tag.classList.add("up-name");

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
    tag: HTMLAnchorElement,
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

}