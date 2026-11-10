# Autional Docs

> 🚨 **2026-11-10 托管变更**：`*.autional.cn` **已迁出 Vercel** —— 改为 mf01 构建（node:24-alpine + 钉版 pnpm）→ 香港自建托管。
> `.cn` 的构建 env 由 workspace `shared/infra-ops/sites/sites.manifest.json` 注入；push 后由 mf01 cron（约 10 分钟）构建发布，不经 Vercel。
> `*.autional.com` 仍在 Vercel —— 本文中涉及 Vercel 的构建/部署描述对 `.com` 仍然成立。
> 现行口径：workspace `docs/AUTIONAL-CN-SITES-SELF-HOST.md`。

**Sites**: [docs.autional.com](https://docs.autional.com) (com) / [docs.autional.cn](https://docs.autional.cn) (cn)
**Stack**: Astro 5 + Tailwind 3.4
**Repository**: [github.com/autional/docs](https://github.com/autional/docs)

Documentation site for [Autional](https://www.autional.com) — Enterprise Identity & Access Management.

Single source, dual-region build: one repo serves both regions. Regional differences (site URL, default/fallback language, CDN host, brother-site links) are injected at build time via env — `REGION` / `SITE_URL` / `DEFAULT_LANG` / `FALLBACK_LANG` / `CDN_HOST`（读取单点 `scripts/env.mjs`；落点见 `astro.config.mjs` 的 `vite.define` 与 `src/lib/site-env.ts`）。默认语言 zh 兜底为本区（cn）。文案双语化（`src/i18n/{en-US,zh-CN}.json` 单键空间，`scripts/check-i18n.mjs` 门禁）；语言切换为客户端行为（localStorage 键 `autional-lang`），静态页始终是区域默认语言。

## Development

```bash
pnpm install
pnpm dev      # http://localhost:4432（无 env 时兜底 cn 值）
pnpm build    # 产物 dist/；prebuild 生成 public/robots.txt + 跑 check-i18n
```

双区本地构建：

```bash
REGION=cn SITE_URL=https://docs.autional.cn DEFAULT_LANG=zh FALLBACK_LANG=zh CDN_HOST=https://cdn.autional.cn pnpm build
REGION=com SITE_URL=https://docs.autional.com DEFAULT_LANG=en FALLBACK_LANG=en CDN_HOST=https://cdn.autional.com pnpm build
```

## Deploy

Push to `main` — `.com` 由 Vercel 自动部署（项目 ``docs``）；`.cn` 由 mf01 cron 构建发布（约 10 分钟，不经 Vercel）。env 按区分别注入。
