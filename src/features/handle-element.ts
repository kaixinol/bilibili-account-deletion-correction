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
import {
    isCheck404Enabled,
    getCached404,
    setCached404,
} from "../settings";

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
    if (!tag.title.includes("注册时间推测"))
        tag.title = tag.title
            ? `${tag.title}\n注册时间推测: ${time}`
            : `注册时间推测: ${time}`;
}

async function checkNoVideos(uid: UidValue, tag: HTMLElement): Promise<void> {
    const uidStr = String(uid);

    const cached = getCached404(uidStr);
    if (cached === true) {
        tag.title = tag.title ? `${tag.title}\n该用户没有任何视频投稿` : "该用户没有任何视频投稿";
        return;
    }
    if (cached === false) return;

    try {
        const resp = await fetch(
            `https://api.bilibili.com/x/v2/medialist/resource/list?out_referer=&mobi_app=web&type=1&biz_id=${uidStr}`,
            { credentials: "include" },
        );
        if (!resp.ok) return;
        const data = await resp.json();
        const hasVideo = !!(data?.data?.media_list?.length);
        if (!hasVideo) {
            setCached404(uidStr, true);
            tag.title = tag.title ? `${tag.title}\n该用户没有任何视频投稿` : "该用户没有任何视频投稿";
        } else {
            setCached404(uidStr, false);
        }
    } catch {
        // network error — silently ignore
    }
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
    modifyHref = true,
): void {
    const uid = uidGetter(tag);
    if (!uid) return;

    appendShortId(tag, matchText, uidToShortId(uid));
    applyOverflowFallback(tag);
    attachRegisterTime(tag, estimateRegisterTime(uid));
    if (modifyHref) {
        processNormalElement(tag, uid);
    }
    if (isCheck404Enabled()) {
        checkNoVideos(uid, tag);
    }
}

function annotateElementsWithMatchText(
    elements: Iterable<HTMLAnchorElement>,
    matchText: string,
    uidGetter: RuleUidGetter = getHrefUid,
    modifyHref = true,
): void {
    for (const tag of elements) {
        annotateElement(tag, matchText, uidGetter, modifyHref);
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

    if (isCheck404Enabled()) {
        checkNoVideos(uid, tag);
    }
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

export const handleSearchElement: ElementHandleFunc = (
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

    const anchor = tag.closest("a") as HTMLAnchorElement | null;
    if (anchor) {
        anchor.href = `https://www.bilibili.com/list/${uid}`;
    }

    annotateElementsWithMatchText([tag], str, uidGetter, false);
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