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
function throttle<T extends (...args: any[]) => void>(
    fn: T,
    delay = 1000
): (...args: Parameters<T>) => void {
    let lastTime = 0;

    return function (this: any, ...args: Parameters<T>) {
        const now = Date.now();
        if (now - lastTime >= delay) {
            lastTime = now;
            fn.apply(this, args);
        }
    };
}

const throttledProcess = throttle(() =>  {setTimeout(processComments, 200)}, 2000);
window.addEventListener("pointermove", throttledProcess);
window.addEventListener("scroll", throttledProcess);
setInterval(processComments, 5000);