import { DEAD_USERNAME } from "../shared/dead-username";
import type { ProcessableElement } from "../types";
import { handleElement } from "./handle-element";

function processRichTextLinks(richText: Element): void {
    const root = richText.shadowRoot;
    if (!root) return;

    const inner = root.querySelector("bili-rich-text")?.shadowRoot;
    if (!inner) return;

    inner.querySelectorAll('a[data-type="mention"]').forEach((a) => {
        if (a.textContent?.trim() === `@${DEAD_USERNAME}`) {
            handleElement(a as ProcessableElement);
        }
    });
}

function processCommentRenderers(
    elements: NodeListOf<BiliCommentThreadRendererElement>,
): void {
    elements.forEach((renderer) => {
        const rendererRoot = renderer.shadowRoot;

        const bili = rendererRoot.querySelector("bili-comment-renderer")?.shadowRoot;
        if (!bili) return;

        const userInfo = bili.querySelector("bili-comment-user-info")?.shadowRoot;
        const user = userInfo?.querySelector("#user-name a");

        if (user) handleElement(user as ProcessableElement);

        processRichTextLinks(bili.host);

        const replies = rendererRoot.querySelector(
            "bili-comment-replies-renderer",
        )?.shadowRoot;

        if (!replies) return;

        const replyNodes = replies.querySelectorAll<BiliCommentReplyRendererElement>(
            "bili-comment-reply-renderer",
        );

        replyNodes.forEach((reply) => {
            const replyRoot = reply.shadowRoot;

            const rUserInfo = replyRoot.querySelector(
                "bili-comment-user-info",
            )?.shadowRoot;

            const rUser = rUserInfo?.querySelector("#user-name a");

            if (rUser) handleElement(rUser as ProcessableElement);

            processRichTextLinks(replyRoot.host);
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
        const root = startElement.shadowRoot;

        const allElements = root.querySelectorAll<BiliCommentThreadRendererElement>(
            "bili-comment-thread-renderer:not([data-processed])",
        );

        processCommentRenderers(allElements);
    });
}
