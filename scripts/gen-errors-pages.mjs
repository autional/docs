#!/usr/bin/env node
/**
 * gen-errors-pages.mjs — 从错误语义契约生成 `/errors/<code>` 与 `/errors` 静态页（构建前）。
 *
 * 为什么用"生成静态页"而不是 Astro 动态路由 getStaticPaths：
 *   本仓既有约定就是「prebuild 生成产物」（见 gen-static.mjs）；生成静态文件不依赖打包器
 *   的 JSON 内联行为，784 页的构建也最稳。产物已 gitignore（勿手改、勿入库）。
 *
 * 数据源：contracts/errors.semantics.json（镜像 service-core，漂移由 gen-errors-contract.mjs 把关）。
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const rows = JSON.parse(readFileSync(join(root, 'contracts/errors.semantics.json'), 'utf8'));

const ABSENCE_LABEL = {
  entity: '按标识寻址的实体不存在',
  unprovisioned: '用户级单例尚未初始化（客户端应渲染空态，不是错误）',
};
const UI_LABEL = {
  empty_state: '空态（正常但暂无内容）',
  not_found_page: '未找到页',
  form_error: '表单 / 入参错误',
  expired: '已过期 → 重新获取 / 重新发起',
  reauth_required: '需重新认证 / 二次验证 → 引导登录或补验证',
  captcha_required: '需完成人机验证 → 渲染/刷新验证码区（不进通用错误横幅）',
  credential_mismatch: '凭据不匹配（表单可修正）→ 提示重输，非会话过期',
  action_required: '非故障但需用户动作（未配置 / 额度已达）→ 中性提示 + CTA',
  session_expired: '会话过期 → 引导重新登录',
  forbidden: '无权限',
  conflict: '冲突 → 提示刷新或重试操作',
  rate_limited: '限流 → 可退避重试',
  transient: '暂时不可用 → 可退避重试',
  unexpected: '未预期错误',
};

const dir = join(root, 'src/pages/errors');
rmSync(dir, { recursive: true, force: true }); // 幂等：每次重建
mkdirSync(dir, { recursive: true });

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

let n = 0;
for (const r of rows.sort((a, b) => a.code - b.code)) {
  const absenceRow = r.absence
    ? `\t\t\t<tr><th>缺失性质 absence</th><td class="font-mono">${esc(r.absence)} —— ${esc(ABSENCE_LABEL[r.absence] ?? '-')}</td></tr>\n`
    : '';
  const body = `---
// GENERATED — DO NOT EDIT. 由 scripts/gen-errors-pages.mjs 从 contracts/errors.semantics.json 生成。
import DocLayout from '../../layouts/DocLayout.astro';
---

<DocLayout
	title="错误码 ${r.code}"
	description="错误码 ${r.code}：HTTP ${r.http_status}，class=${esc(r.class)}，客户端行为=${esc(r.ui_observation)}。"
>
	<h1 class="text-3xl font-bold mb-2 font-mono">${r.code}</h1>
	<p class="text-neutral-600 dark:text-neutral-300 mb-8">
		本页由后端「错误语义契约」在构建期生成 —— 它是该错误码的唯一权威说明（客户端不得按错误码手写分支）。
	</p>
	<table class="w-full text-sm border-collapse">
		<tbody>
			<tr><th>HTTP 状态</th><td class="font-mono">${r.http_status}</td></tr>
			<tr><th>语义分类 class</th><td class="font-mono">${esc(r.class)}</td></tr>
${absenceRow}\t\t\t<tr><th>客户端行为 ui_observation</th><td class="font-mono">${esc(r.ui_observation)} —— ${esc(UI_LABEL[r.ui_observation] ?? '-')}</td></tr>
			<tr><th>可重试</th><td>${r.retryable ? '可重试（瞬时故障）' : '不可重试（终态，重试不会改变结果）'}</td></tr>
		</tbody>
	</table>
	<p class="mt-8 text-sm text-neutral-600 dark:text-neutral-300">
		<a href="/errors" class="text-primary-600 hover:underline">← 全部错误码</a>
	</p>
</DocLayout>
`;
  writeFileSync(join(dir, `${r.code}.astro`), body);
  n++;
}

// 总览页
const byClass = rows.reduce((m, r) => ((m[r.class] = (m[r.class] ?? 0) + 1), m), {});
writeFileSync(
  join(dir, 'index.astro'),
  `---
// GENERATED — DO NOT EDIT. 由 scripts/gen-errors-pages.mjs 生成。
import DocLayout from '../../layouts/DocLayout.astro';
const total = ${rows.length};
const byClass: Record<string, number> = ${JSON.stringify(byClass)};
const rows: Array<{ code: number; http: number; cls: string; ui: string }> = [
${rows.map((r) => `\t{ code: ${r.code}, http: ${r.http_status}, cls: '${r.class}', ui: '${r.ui_observation}' },`).join('\n')}
];
---

<DocLayout title="错误码总览" description="平台错误码 → HTTP 状态 / 语义分类 / 客户端行为；由后端错误语义契约构建期生成。">
	<h1 class="text-3xl font-bold mb-4">错误码总览</h1>
	<p class="text-neutral-600 dark:text-neutral-300 mb-6">
		共 <span class="font-mono">{total}</span> 个错误码，全部来自后端「错误语义契约」—— 错误码含义与客户端行为的唯一真源。
	</p>
	<ul class="mb-8 text-sm text-neutral-600 dark:text-neutral-300">
		{Object.entries(byClass).sort().map(([cls, n]) => (
			<li class="inline-block mr-4"><span class="font-mono">{cls}</span>: {n}</li>
		))}
	</ul>
	<table class="w-full text-sm border-collapse">
		<thead>
			<tr class="border-b border-neutral-200">
				<th class="text-left font-medium py-2">错误码</th>
				<th class="text-left font-medium py-2">HTTP</th>
				<th class="text-left font-medium py-2">class</th>
				<th class="text-left font-medium py-2">客户端行为</th>
			</tr>
		</thead>
		<tbody>
			{rows.map((r) => (
				<tr class="border-b border-neutral-100">
					<td class="py-2 font-mono"><a href={\`/errors/\${r.code}\`} class="text-primary-600 hover:underline">{r.code}</a></td>
					<td class="py-2 font-mono">{r.http}</td>
					<td class="py-2 font-mono">{r.cls}</td>
					<td class="py-2 font-mono">{r.ui}</td>
				</tr>
			))}
		</tbody>
	</table>
</DocLayout>
`,
);

console.log(`[gen-errors-pages] 生成 ${n} 个 /errors/<code> 页 + /errors 总览（行数=${rows.length}）`);
