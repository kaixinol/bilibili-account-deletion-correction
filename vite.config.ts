import { defineConfig } from "vite";
import monkey, { cdn } from "vite-plugin-monkey";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    plugins: [
        monkey({
            entry: "src/main.ts",
            userscript: {
                namespace: "http://tampermonkey.net/",
                license: "MIT",
                description: "修正Bilibili 账户已注销的主页链接，修改为 https://www.bilibili.com/list/$UID",
                author: "Kaesinol",
                match: ["https://*.bilibili.com/*"],
                grant: "none",
                "run-at": "document-end",
                icon: "https://www.gstatic.com/android/keyboard/emojikitchen/20220506/u1f47b/u1f47b_u1f5d1-ufe0f.png",
            },
            build: {
                externalGlobals: {
                    "query-selector-shadow-dom": cdn.jsdelivr(
                        "querySelectorShadowDom",
                        "dist/querySelectorShadowDom.js",
                    ),
                },
            }
        })
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    }
});


