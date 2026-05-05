/**
 * 创建点击代理元素
 * 不直接修改 href 是为了避免被 B 站脚本检测并重置
 * 通过覆盖点击事件跳转到目标 URL
 */
export function makeLinkPreview(el: HTMLElement, url: string): void {
    // 直接暴力设置，不读取。写入属性虽然也可能触发重绘，但比先读后写（Reflow）快得多
    el.style.position = "relative";

    const proxy = document.createElement("span");
    // 使用 style.cssText 一次性写入，减少 DOM 操作次数
    proxy.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;cursor:pointer;zIndex:10;";

    proxy.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, "_blank", "noopener,noreferrer");
    });

    el.appendChild(proxy);
}