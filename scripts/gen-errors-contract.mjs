#!/usr/bin/env node
/**
 * gen-errors-contract.mjs — 错误语义契约的**漂移门禁**（docs 站）。
 *
 * 背景：ProblemDetails.type 指向 `https://<domain>/errors/<code>`；本仓提供这些页面。
 * 页面数据来自 service-core 的契约（contracts/errors.semantics.json 镜像）。
 * 若镜像被手改而无 meta 更新，页面会与后端语义分叉 —— 故 fail-closed。
 *
 * 用法：
 *   node scripts/gen-errors-contract.mjs --check   # 校验镜像与 meta 一致（prebuild 钩子）
 *   node scripts/gen-errors-contract.mjs           # 同上 + 打印规模
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const CONTRACT = join(root, 'contracts/errors.semantics.json');
const META = join(root, 'contracts/errors.semantics.meta.json');

if (!existsSync(CONTRACT) || !existsSync(META)) {
  console.error(`[errors-contract] 契约或元数据缺失：${CONTRACT} / ${META}\n请先从 service-core 同步（见 meta.source）。`);
  process.exit(1);
}

const raw = readFileSync(CONTRACT);
const sha = createHash('sha256').update(raw).digest('hex');
const rows = JSON.parse(raw.toString('utf8'));
const meta = JSON.parse(readFileSync(META, 'utf8'));

if (!Array.isArray(rows) || rows.length === 0) {
  console.error('[errors-contract] 契约内容非法：不是非空数组');
  process.exit(1);
}
if (meta.sourceSha256 !== sha) {
  console.error(
    `[errors-contract] 镜像与元数据不一致：\n  meta.sourceSha256 = ${meta.sourceSha256}\n  实际 sha256      = ${sha}\n` +
      '请从 service-core 重新同步并更新 meta（勿手改镜像）。',
  );
  process.exit(1);
}
if (meta.rows !== rows.length) {
  console.error(`[errors-contract] 行数与元数据不一致：meta.rows=${meta.rows}, 实际=${rows.length}`);
  process.exit(1);
}
// 失败要响：页面渲染依赖这些字段
for (const r of rows) {
  if (typeof r.code !== 'number' || typeof r.http_status !== 'number' || !r.class || !r.ui_observation) {
    console.error(`[errors-contract] code=${r.code} 字段缺失（code/http_status/class/ui_observation 必填）`);
    process.exit(1);
  }
}

console.log(`[errors-contract] OK rows=${rows.length} sha256=${sha.slice(0, 16)}`);
