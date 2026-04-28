# Bilibili 账户注销修正脚本

## 项目简介

这是一个针对 Bilibili（哔哩哔哩）的用户脚本,用于修正已注销账户的显示问题。当用户账户被注销后,Bilibili 通常会将其用户名显示为"账户已注销",并将主页链接指向无效地址。本脚本会自动检测这些已注销的账户,并将其主页链接修正为 `https://www.bilibili.com/list/$UID` 格式,使得即使账户已注销,仍可通过 UID 访问其历史内容列表。

## 主要功能

- 🔍 **自动检测已注销账户**：识别页面中显示为"账户已注销"的用户名
- 🔗 **修正主页链接**：将无效链接替换为基于 UID 的内容列表链接
- 📊 **显示短 UID**：在用户名后附加简短的 UID 标识符
- ⏰ **推测注册时间**：根据 UID 估算并显示账户注册时间
- 🔄 **动态监听**：自动处理页面滚动、鼠标移动时加载的新评论和内容

## 核心 API：annotateElements

本脚本暴露了一个API `annotateElements`,允许开发者在其他脚本或应用中复用账户标注功能。

**使用方式：**
```typescript
window.dispatchEvent(
    new CustomEvent("biliFix:request-api", {
        detail: (api: { annotateElements: (els: Iterable<HTMLAnchorElement>) => void }) => {
            api.annotateElements(document.querySelectorAll(".xxx"));
        },
    })
);
```


## 安装方法

### 通过 Tampermonkey/Greasemonkey

1. 安装浏览器扩展（Tampermonkey 或 Greasemonkey）
2. 构建脚本：
   ```bash
   pnpm install
   pnpm build
   ```
3. 将生成的 `.user.js` 文件拖拽到浏览器扩展管理器中安装

### 开发模式

```bash
pnpm install
pnpm dev
```

## 技术栈

- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 现代化的前端构建工具
- **vite-plugin-monkey** - Vite 的用户脚本插件
- **query-selector-shadow-dom** - 支持 Shadow DOM 的选择器库

## 许可证

MIT License © Kaesinol

## 贡献

欢迎提交 Issue 和 Pull Request！