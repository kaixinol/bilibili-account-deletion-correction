import { querySelectorAllDeep } from "query-selector-shadow-dom";
import { DEAD_USERNAME } from "../shared/dead-username";
import { handleElement } from "./handle-element";

// 1. 缓存目标字符串，避免在深层循环中反复分配内存和触发 GC
const TARGET_MENTION = `@${DEAD_USERNAME}`;

export function processComments(
    startElements: NodeListOf<BiliCommentsElement> = document.querySelectorAll("bili-comments"),
): number {
    let hitCount = 0;
    for (const startElement of startElements) {
        const threads = querySelectorAllDeep(
            "bili-comment-thread-renderer:not([data-bilifix-processed])",
            startElement,
        ) as BiliCommentThreadRendererElement[];

        for (const thread of threads) {
            // 3. 核心降维打击：将原本 N 次的 Shadow DOM 穿透查询合并为 1 次！
            // 原逻辑：查 user -> 查 mention -> 查 replies -> N次查 reply user -> N次查 reply mention
            // 新逻辑：一次全量查出所有需要的节点，彻底消除反复穿越 Shadow root 的巨大开销
            const targets = querySelectorAllDeep(
                '#user-name a, a[data-type="mention"], bili-comment-replies-renderer, a#user-avatar',
                thread
            );

            let repliesRenderer: Element | null = null;

            // 4. 一遍遍历完成所有的状态派发
            for (let k = 0; k < targets.length; k++) {
                const node = targets[k] as HTMLElement;
                const nodeName = node.nodeName; // 大写 'A' 或 'BILI-COMMENT-REPLIES-RENDERER'

                if (nodeName === 'A') {
                    hitCount++;
                    // 5. getAttribute 较慢，改用 dataset (DOMStringMap) 直读
                    if (node.dataset.type === 'mention') {
                        const text = node.textContent;
                        // 6. 微优化：先用最廉价的 .includes 过滤，再执行会产生新字符串的 .trim()
                        if (text && text.includes(DEAD_USERNAME) && text.trim() === TARGET_MENTION) {
                            handleElement(node as HTMLAnchorElement);
                        }
                    } else {
                        // 必定是 '#user-name a' 命中的节点
                        handleElement(node as HTMLAnchorElement);
                    }
                } else if (nodeName === 'BILI-COMMENT-REPLIES-RENDERER') {
                    repliesRenderer = node;
                }
            }

            // 原有逻辑：如果回复区实质为空，则标记为已处理
            if (repliesRenderer && !repliesRenderer.shadowRoot!.textContent?.trim()) {
                thread.setAttribute("data-bilifix-processed", "true");
            }
        }
    }
    return hitCount;
}