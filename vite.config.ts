import { defineConfig } from "vite";
import monkey, { cdn } from "vite-plugin-monkey";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    build: {
        minify: "terser",
        terserOptions: {
            compress: {
                hoist_funs: true,
                hoist_vars: false,
                passes: 2,
                pure_getters: true,
                toplevel: true,
                unsafe_arrows: true,
            },
            mangle: false,
            format: {
                comments: false,
            },
        },
    },
    plugins: [
        monkey({
            entry: "src/main.ts",
            userscript: {
                name: "Bilibili 账号已注销修正",
                namespace: "http://tampermonkey.net/",
                license: "MIT",
                description: "修正Bilibili 账户已注销的主页链接，修改为 https://www.bilibili.com/list/$UID",
                author: "Kaesinol",
                match: ["https://*.bilibili.com/*"],
                grant: ["GM_registerMenuCommand", "GM_getValue", "GM_setValue"],
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
            },
        }),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    }
});
