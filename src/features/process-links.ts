import { LINK_RULES } from "../constants";
import type { ProcessableElement } from "../types";
import { handleElement } from "./handle-element";

export function processLinks(): void {
    for (const [host, { query, handleFunc, textGetter, uidGetter }] of Object.entries(LINK_RULES)) {
        if (!RegExp(host).test(location.href)) continue;

        const queries = Array.isArray(query) ? query : [query];

        for (const q of queries) {
            document.body.querySelector("#app")!.querySelectorAll(q).forEach((el) => {
                handleElement(
                    el as ProcessableElement,
                    handleFunc,
                    textGetter,
                    uidGetter,
                );
            });
        }
    }
}
