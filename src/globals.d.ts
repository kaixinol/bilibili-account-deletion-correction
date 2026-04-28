declare global {
    // 基础接口：强制包含 shadowRoot 且继承 HTMLElement
    interface BiliCustomElement extends HTMLElement {
        readonly shadowRoot: ShadowRoot;
    }

    interface BiliCommentsElement extends BiliCustomElement { }

    interface BiliCommentThreadRendererElement extends BiliCustomElement {
        // 激进重构版用到了 data-processed，这里显式声明可以增加代码可读性
        dataset: DOMStringMap & { processed?: string };
    }

    interface BiliCommentRendererElement extends BiliCustomElement { }

    // 关键：扩展原生标签映射，这样 querySelectorAll("bili-comments") 会直接返回 NodeListOf<BiliCommentsElement>
    interface HTMLElementTagNameMap {
        "bili-comments": BiliCommentsElement;
        "bili-comment-thread-renderer": BiliCommentThreadRendererElement;
        "bili-comment-replies-renderer": BiliCommentRepliesRendererElement;
    }
    interface Window {
        __INITIAL_STATE__?: {
            detail?: {
                basic?: {
                    uid?: string | number | bigint;
                };
                modules?: Array<{
                    module_author?: {
                        mid?: string | number | bigint;
                    };
                }>;
            };
        };
    }

}
export {};
