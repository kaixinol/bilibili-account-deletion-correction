import { LINK_RULES } from "../constants";
import { handleElement } from "./handle-element";

export function processLinks(isPolling = false): void {
    for (const [host, { query, handleFunc, textGetter, uidGetter, requirePolling }] of Object.entries(LINK_RULES)) {
        if (isPolling && !requirePolling) {
            continue;
        }
        if (!RegExp(host).test(location.href)) continue;

        const queries = Array.isArray(query) ? query : [query];

        for (const q of queries) {
            document.querySelectorAll(q).forEach((el) => {
                handleElement(
                    el as HTMLAnchorElement,
                    handleFunc,
                    textGetter,
                    uidGetter,
                );
            });
        }
    }
}
