import { handleInterceptElement, handleOverrideProcessElement, handleSearchElement } from "./features/handle-element";
import type { RuleConfig } from "./types";
import { getFirstSegmentMatchText } from "./utils/text";
import { getHrefUidFromParent, getOpusStateUid } from "./utils/uid";
const VIDEO_CARD = {
    handleFunc: handleSearchElement,
    query: ".bili-video-card__info--author",
    textGetter: getFirstSegmentMatchText,
    uidGetter: getHrefUidFromParent,
    requirePolling: true,
}
export const LINK_RULES: Record<string, RuleConfig> = {
    "space.bilibili.com/\\d+/favlist": {
        query: "div.bili-video-card__subtitle a",
        textGetter: getFirstSegmentMatchText,
        requirePolling: true,
    },
    "space.bilibili.com/\\d+/relation/*": {
        query: "a.relation-card-info__uname",
        textGetter: getFirstSegmentMatchText,
        requirePolling: true,
    },
    "www.bilibili.com/(video|list)/": {
        handleFunc: handleInterceptElement,
        query: [
            ".up-detail-top a",// UP名字
            "a.staff-name", // 多人投稿
            "div.basic-desc-info a.mention-user", // 简介AT
        ],
    },
    "search.bilibili.com": VIDEO_CARD,
    "www.bilibili.com/opus/\\d+": {
        handleFunc: handleOverrideProcessElement,
        query: ".opus-module-author:not([data-bilifix-processed])",
        textGetter: getFirstSegmentMatchText,
        uidGetter: getOpusStateUid,
    },
    "www.bilibili.com/history": {
        ...VIDEO_CARD,
        query: ".bili-video-card__author span",
    },
};
