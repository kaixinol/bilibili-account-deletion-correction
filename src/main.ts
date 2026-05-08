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
const runPollingTasks = () => {
    processComments();
    processLinks(true); // 传入 true，只执行需要轮询的主页规则
};
setInterval(runPollingTasks, 2000);