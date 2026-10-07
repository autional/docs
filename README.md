# Autional Docs

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

Push to `main` — Vercel auto-deploys. Projects: `docs` (com) / `cn-docs` (cn)；env 按项目分别注入。
