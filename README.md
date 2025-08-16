# AI Chat (React + Vite + Ant Design)

一个使用 React + TypeScript + Vite 搭建的前端项目，集成 Ant Design，实现可与 AI（Mock 或外部 API）对话的简易聊天界面。支持部署到 GitHub Pages，并配置自定义域名 `www.weihe-life`。

## 开发

- 安装依赖：
  - `npm i` 或 `pnpm i` 或 `yarn`
- 本地运行：
  - `npm run dev`
- 构建产物：
  - `npm run build`

> 本仓库在无网络环境下已生成代码结构；首次开发请联网安装依赖。

## 功能

- Ant Design UI，内置明暗主题切换
- 聊天对话，输入框支持 Enter 发送 / Shift+Enter 换行
- 内置 Mock 回复；可配置外部 API 代理
- 本地持久化历史记录（localStorage）

## AI 服务对接

默认使用 Mock 回复。若有后端代理，可设置一个无鉴权的 HTTPS 端点给前端调用（不在前端暴露任何私密 Key）。本项目支持两种接入方式：GraphQL（推荐，适配 Cloudflare Workers 方案）与简单 REST（向下兼容）。

- 环境变量（在 `.env` 或构建时注入）：
  - GraphQL（优先使用，若存在则走 GraphQL）：
    - `VITE_GRAPHQL_API_URL`：GraphQL 端点，例如 `http://127.0.0.1:8787/aichat/graphql`
    - `VITE_CHAT_PROVIDER`：模型提供方，默认 `DEEPSEEK`；可选 `OPENAI`/`DEEPSEEK`
    - `VITE_CHAT_MODEL`：模型名，默认 `deepseek-chat`（如使用 OpenAI 可设为 `gpt-4o-mini` 等）
    - `VITE_CHAT_TEMPERATURE`：温度，可选，数字
  - REST（备选回退）：
    - `VITE_CHAT_API_URL`：你的后端聊天接口地址（POST）

- GraphQL 请求/响应约定（Cloudflare Workers 参考）：
  - Mutation：`chat(input: { provider, model, messages, temperature? }) { content reasoning }`
  - 由前端传参的 `messages` 结构：`Array<{ role: 'user'|'assistant'|'system', content: string }>`
  - 前端取 `data.chat.content` 作为回复文本

- REST 请求/响应约定（向后兼容）：
  - 请求：`POST { messages: Array<{ id, role: 'user'|'assistant'|'system', content }> }`
  - 响应：`{ reply: string }`

示例 Node/Express 伪代码（REST，若不使用 GraphQL）：

```
import express from 'express'
const app = express()
app.use(express.json())

app.post('/chat', async (req, res) => {
  const { messages } = req.body
  // TODO: 调你的大模型（请在服务端使用私密 KEY）
  const reply = '服务端来自模型的回复'
  res.json({ reply })
})

app.listen(3000)
```

## GitHub Pages 部署

本项目已内置 GH Pages 所需配置：

- `public/CNAME`：自定义域名 `www.weihe-life`
- `package.json`：
  - `build`：构建并复制 `index.html` 为 `404.html` 用于 SPA 路由回退
  - `deploy`：使用 `gh-pages` 将 `dist` 推送到 `gh-pages` 分支

步骤：

1. 初始化仓库并推送：
   - `git init && git add . && git commit -m "init"`
   - `git remote add origin <你的 GitHub 仓库地址>`
   - `git push -u origin main`
2. 安装依赖并构建部署：
   - `npm i`
   - `npm run build`
   - `npm run deploy`
3. 在 GitHub 仓库设置中启用 Pages：
   - Source 选择 `gh-pages` 分支（root）
4. 绑定自定义域名：
   - 在仓库 Pages 设置里填入 `www.weihe-life`
   - 确保你的域名 DNS 添加 CNAME 记录：
     - 主机记录：`www`
     - 记录值：`<你的 GitHub 用户名>.github.io`
   - 等待 DNS 生效（通常几分钟到 24 小时）

> 若未来不使用自定义域名而是仓库路径（`https://user.github.io/repo`），请将 `vite.config.ts` 的 `base` 设置为 `'/repo/'`。

## CI/CD

本仓库内置两份工作流：

- `.github/workflows/pages.yml`：
  - 触发：`push` 到 `main` 或手动 `workflow_dispatch`
  - 操作：安装依赖 → `npm run build` → 上传 `dist` 工件 → `actions/deploy-pages` 部署到 GitHub Pages 环境
  - 权限：`pages: write`、`id-token: write`
- `.github/workflows/ci.yml`：
  - 触发：PR 指向 `main`，或 `push` 到 `main`
  - 操作：安装依赖 → `npm run typecheck`（存在则执行）→ `npm run build`

注意事项：

- 仓库 Settings → Pages → Source 选择“GitHub Actions”。
- 自定义域名在 Settings → Pages 中填写 `www.weihe-life`，并在 DNS 配置 CNAME 指向 `iceberg211.github.io`。
- 等域名生效后，在 Pages 设置里启用 Enforce HTTPS。

## 目录结构

```
.
├─ public/
│  ├─ CNAME
│  └─ favicon.svg
├─ src/
│  ├─ components/
│  │  ├─ Chat.tsx
│  │  └─ MessageBubble.tsx
│  ├─ services/
│  │  └─ ai.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ styles.css
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```

## 常见问题

- 前端能直接调用 OpenAI 吗？
  - 不建议。前端公开的代码会暴露 API Key。最佳实践是：在你控制的服务端使用私钥，前端仅调用你暴露的安全端点。
- GitHub Pages 打不开或 404？
  - 确认 `dist/404.html` 已存在（`npm run build` 已复制）。
  - 若使用自定义域名，确认 DNS CNAME 正确、生效。
- 如何清空聊天记录？
  - 界面右上角“清空”按钮，或浏览器清理站点数据。
