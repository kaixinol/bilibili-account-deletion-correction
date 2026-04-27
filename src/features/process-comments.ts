import {
    querySelectorAllDeep,
    querySelectorDeep,
} from "query-selector-shadow-dom";
import { DEAD_USERNAME } from "../shared/dead-username";
import type { ProcessableElement } from "../types";
import { handleElement } from "./handle-element";

function processRichTextLinks(richText: Element): void {
    querySelectorAllDeep('a[data-type="mention"]', richText as HTMLElement).forEach((a) => {
        if (a.textContent?.trim() === `@${DEAD_USERNAME}`) {
            handleElement(a as ProcessableElement);
        }
    });
}

function processCommentRenderers(
    elements: BiliCommentThreadRendererElement[],
): void {
    elements.forEach((renderer) => {
        const user = querySelectorDeep("#user-name a", renderer);

        if (user) handleElement(user as ProcessableElement);
        processRichTextLinks(renderer);

        const replies = querySelectorDeep("bili-comment-replies-renderer", renderer);
        if (!replies) return;

        const replyNodes = querySelectorAllDeep(
            "bili-comment-reply-renderer",
            replies,
        );

        replyNodes.forEach((reply) => {
            const rUser = querySelectorDeep("#user-name a", reply);

            if (rUser) handleElement(rUser as ProcessableElement);
            processRichTextLinks(reply);
        });

        if (!replies.textContent?.trim()) {
            renderer.setAttribute("data-processed", "true");
        }
    });
}

export function processComments(
    startElements: NodeListOf<BiliCommentsElement> = document.querySelectorAll("bili-comments"),
): void {
    startElements.forEach((startElement) => {
        const allElements = querySelectorAllDeep(
            "bili-comment-thread-renderer:not([data-processed])",
            startElement,
        ) as BiliCommentThreadRendererElement[];

        processCommentRenderers(allElements);
    });
}
