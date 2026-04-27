declare global {
    interface BiliCommentsElement extends HTMLElement {
        readonly shadowRoot: ShadowRoot;
    }

    interface BiliCommentThreadRendererElement extends HTMLElement {
        readonly shadowRoot: ShadowRoot;
    }

    interface BiliCommentRendererElement extends HTMLElement {
        readonly shadowRoot: ShadowRoot;
    }

    interface BiliCommentUserInfoElement extends HTMLElement {
        readonly shadowRoot: ShadowRoot;
    }

    interface BiliCommentRepliesRendererElement extends HTMLElement {
        readonly shadowRoot: ShadowRoot;
    }

    interface BiliCommentReplyRendererElement extends HTMLElement {
        readonly shadowRoot: ShadowRoot;
    }

    interface HTMLElementTagNameMap {
        "bili-comments": BiliCommentsElement;
        "bili-comment-thread-renderer": BiliCommentThreadRendererElement;
        "bili-comment-renderer": BiliCommentRendererElement;
        "bili-comment-user-info": BiliCommentUserInfoElement;
        "bili-comment-replies-renderer": BiliCommentRepliesRendererElement;
        "bili-comment-reply-renderer": BiliCommentReplyRendererElement;
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
