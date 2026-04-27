export function makeLinkPreview(el: HTMLElement, url: string): void {
    const datasetEl = el as HTMLElement & { dataset: DOMStringMap };

    if (datasetEl.dataset.linkPreview === "1") return;
    datasetEl.dataset.linkPreview = "1";

    const proxy = document.createElement("span");

    Object.assign(proxy.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        display: "block",
        cursor: "pointer",
        zIndex: "10",
    });

    if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
    }

    proxy.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, "_blank", "noopener,noreferrer");
    });

    el.appendChild(proxy);
}
