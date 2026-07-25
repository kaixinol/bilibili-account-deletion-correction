import { handleInterceptElement, handleOverrideProcessElement, handleSearchElement } from "./features/handle-element";
import type { RuleConfig } from "./types";
import { getFirstSegmentMatchText } from "./utils/text";
import { getHrefUidFromParent, getOpusStateUid } from "./utils/uid";

export const LINK_RULES: Record<string, RuleConfig> = {
    "space.bilibili.com/\\d+/favlist": {
        query: "div.bili-video-card__subtitle a",
        textGetter: getFirstSegmentMatchText,
    },
    "space.bilibili.com/\\d+/relation/*": {
        query: "a.relation-card-info__uname",
        textGetter: getFirstSegmentMatchText,
    },
    "www.bilibili.com/(video|list)/": {
        handleFunc: handleInterceptElement,
        query: [
            ".up-detail-top a",
            "a.staff-name",
            "div.basic-desc-info a.mention-user",
        ],
        requirePolling: true,
    },
    "search.bilibili.com": {
        handleFunc: handleSearchElement,
        query: ".bili-video-card__info--author",
        textGetter: getFirstSegmentMatchText,
        uidGetter: getHrefUidFromParent,
    },
    "www.bilibili.com/opus/\\d+": {
        handleFunc: handleOverrideProcessElement,
        query: ".opus-module-author:not([data-bilifix-processed])",
        textGetter: getFirstSegmentMatchText,
        uidGetter: getOpusStateUid,
    },
};
