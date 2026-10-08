/**
 * 构建期区域环境单点（B2 单源双区；契约见 docs/positioning/23 执行�?§2-B1，与 B1 web 同源机制）�? *
 * 两区�?*同一份源**构建：com（en�? cn（zh）各自在 Vercel 项目侧注�? * REGION / SITE_URL / DEFAULT_LANG / FALLBACK_LANG / CDN_HOST�? * astro.config.mjs 读取 process.env 后经 vite.define 内联�?import.meta.env.PUBLIC_*�? * 因此本模块在 .astro frontmatter（构建期）与客户端脚本读到的值一致，且不依赖任何运行时探测�? * 本地 dev �?env 时兜�?cn 值（与迁移前 cn 基线一致）�? *
 * 禁止在本文件之外散落区域字面量（站点域名 / CDN / 兄弟�?/ GitHub 口径）�? */

export type Region = 'cn' | 'com';
export type Lang = 'zh' | 'en';

export const REGION: Region = (import.meta.env.PUBLIC_REGION as Region) ?? 'cn';
export const SITE_URL: string = import.meta.env.PUBLIC_SITE_URL ?? 'https://docs.autional.cn';
export const DEFAULT_LANG: Lang = (import.meta.env.PUBLIC_DEFAULT_LANG as Lang) ?? 'zh';
export const FALLBACK_LANG: Lang = (import.meta.env.PUBLIC_FALLBACK_LANG as Lang) ?? DEFAULT_LANG;
export const CDN_HOST: string = import.meta.env.PUBLIC_CDN_HOST ?? 'https://cdn.autional.cn';

/** CDN 资产�?pin —�?与迁移前 cn 基线同值（B2 卡片：pin 保持 de498ca0 不变）�?*/
export const CDN_PIN = 'v0.1.0-rc.f0db1b97';

/** CDN 资产 URL 拼接：cdnAsset('icons/favicon.svg')�?*/
export const cdnAsset = (path: string): string => `${CDN_HOST}/ui/${CDN_PIN}/${path}`;

/** 站点 host（docs.autional.cn）去掉首个标签得根域（autional.cn）——兄弟站链接由此派生�?*/
export const SITE_HOST: string = new URL(SITE_URL).host;
export const SITE_ROOT_DOMAIN: string =
  SITE_HOST.split('.').length > 2 ? SITE_HOST.split('.').slice(1).join('.') : SITE_HOST;

/** 兄弟站链接：brotherUrl('developer') �?https://developer.autional.cn（随本区根域派生）�?*/
export const brotherUrl = (sub: string): string => `https://${sub}.${SITE_ROOT_DOMAIN}`;

/** GitHub 口径（W6 用户裁定：统一组织 github.com/autional + 本仓 docs）�?*/
export const GITHUB_REPO_URL = 'https://github.com/autional/docs';
export const GITHUB_ORG_URL = 'https://github.com/autional';

/** BCP-47 locale（zh→zh-CN / en→en-US）�?*/
export const LOCALE: string = DEFAULT_LANG === 'zh' ? 'zh-CN' : 'en-US';

