import { annotateElements } from "./features/handle-element";
import { processComments } from "./features/process-comments";
import { processLinks } from "./features/process-links";



window.addEventListener("biliFix:request-api", (e: Event) => {
    const custom = e as CustomEvent<unknown>;

    if (typeof custom.detail === "function") {
        custom.detail({ annotateElements });
    }
});
processLinks();
processComments();
setInterval(processComments, 2000);
