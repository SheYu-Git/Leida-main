import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';
import BiddingItem from '../models/BiddingItem.js';
import BiddingDailyStat from '../models/BiddingDailyStat.js';
import BiddingSyncState from '../models/BiddingSyncState.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheDir = path.join(__dirname, '..', 'cache');
const listCacheDir = path.join(cacheDir, 'list');
const dailyCacheDir = path.join(cacheDir, 'daily');

const pad2 = (n: number) => String(n).padStart(2, '0');

export const CST_OFFSET_MS = 8 * 60 * 60 * 1000;

export const getCstStartOfDayMs = (tsMs: number) => {
  const d = new Date(tsMs + CST_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  return Date.UTC(y, m, day) - CST_OFFSET_MS;
};

export const getCstDayKey = (tsMs: number) => {
  const d = new Date(tsMs + CST_OFFSET_MS);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
};

const escapeHtml = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCst = (tsMs: number) => {
  const d = new Date(tsMs + CST_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  const hh = pad2(d.getUTCHours());
  const mm = pad2(d.getUTCMinutes());
  const ss = pad2(d.getUTCSeconds());
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
};

export const writeHomeCachePage = async () => {
  await fs.mkdir(cacheDir, { recursive: true });

  const now = Date.now();
  const startOfToday = getCstStartOfDayMs(now);
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const dateKey = getCstDayKey(startOfYesterday);
  let items: any[] = [];
  let stat: any = null;
  let state: any = null;
  try {
    items = await BiddingItem.findAll({
      attributes: ['id', 'title', 'datetime', 'bid_price', 'bid_price_yuan', 'city', 'types', 'txt', 'class', 'datetime_ts'],
      order: [['datetime_ts', 'DESC'], ['id', 'DESC']],
      limit: 30,
    });
    stat = await BiddingDailyStat.findOne({ where: { date_key: dateKey, scope_type: 'country', scope_value: '' } });
    state = await BiddingSyncState.findByPk(1);
  } catch (e) {}

  const statText = stat ? `昨日新增 ${Number((stat as any).count || 0)} 条，商机 ${(stat as any).total_yi || '0.00'} 亿+` : '昨日统计生成中';
  const syncAt = Number((state as any)?.last_success_at || 0);

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>招投标雷达 · 缓存页</title>
  <style>
    body{margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial; background:#f6f7fb;color:#111}
    .wrap{max-width:860px;margin:0 auto;padding:14px 12px 28px}
    .bar{display:flex;gap:10px;align-items:center;justify-content:space-between;margin:8px 0 12px}
    .pill{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:#fff;border:1px solid #e8ebf2;font-size:13px}
    .hint{color:#666;font-size:12px}
    .card{background:#fff;border:1px solid #e8ebf2;border-radius:14px;padding:12px 14px;margin:10px 0}
    .t{font-weight:700;font-size:15px;line-height:1.35;margin:0 0 8px}
    .m{display:flex;gap:10px;flex-wrap:wrap;color:#555;font-size:12px}
    .tag{display:inline-flex;padding:2px 8px;border-radius:999px;background:#f1f5ff;color:#2457ff}
    a{color:inherit;text-decoration:none}
    a:active{opacity:.85}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="bar">
      <div class="pill">缓存页 · ${escapeHtml(statText)}</div>
      <div class="hint">同步：${syncAt ? escapeHtml(formatCst(syncAt)) : '-'} · 生成：${escapeHtml(formatCst(now))}</div>
    </div>
    ${items
      .map((it: any) => {
        const title = escapeHtml(it.title);
        const city = escapeHtml(it.city || '全国');
        const dt = escapeHtml(it.datetime || '');
        const price = escapeHtml(it.bid_price || '');
        const types = escapeHtml(it.types || '');
        return `<div class="card">
          <div class="t">${title}</div>
          <div class="m">
            <span class="tag">${city}</span>
            <span>${dt}</span>
            <span>${types}</span>
            <span>${price}</span>
          </div>
        </div>`;
      })
      .join('')}
  </div>
</body>
</html>`;

  const json = {
    code: 1,
    msg: 'success',
    data: items,
    total: items.length,
    syncMeta: {
      actionAt: Number((state as any)?.last_attempt_at || 0),
      successAt: Number((state as any)?.last_success_at || 0),
    },
    statsMeta: stat
      ? {
          date: (stat as any).date_key,
          count: Number((stat as any).count || 0),
          totalYi: String((stat as any).total_yi || '0.00'),
          text: statText,
        }
      : null,
    generatedAt: now,
  };

  await fs.writeFile(path.join(cacheDir, 'home.html'), html, 'utf8');
  await fs.writeFile(path.join(cacheDir, 'home.json'), JSON.stringify(json), 'utf8');
};

export const writeDailyReportSnapshot = async () => {
  await fs.mkdir(dailyCacheDir, { recursive: true });
  const now = Date.now();
  const startOfToday = getCstStartOfDayMs(now);
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const dateKey = getCstDayKey(startOfYesterday);
  const rows = await BiddingDailyStat.findAll({ where: { date_key: dateKey } as any });
  const countryRow = (rows || []).find((r: any) => String((r as any).scope_type || '') === 'country');
  const country = {
    count: Number((countryRow as any)?.count || 0),
    totalYi: String((countryRow as any)?.total_yi || '0.00'),
  };
  const cities: Record<string, { count: number; totalYi: string }> = {};
  for (const r of rows || []) {
    const scopeType = String((r as any).scope_type || '');
    const scopeValue = String((r as any).scope_value || '').trim();
    if (scopeType !== 'city' || !scopeValue) continue;
    cities[scopeValue] = {
      count: Number((r as any).count || 0),
      totalYi: String((r as any).total_yi || '0.00'),
    };
  }
  const payload = {
    version: 1,
    date: dateKey,
    generatedAt: now,
    country,
    cities,
  };
  await fs.writeFile(path.join(dailyCacheDir, `${dateKey}.json`), JSON.stringify(payload), 'utf8');
  await fs.writeFile(path.join(dailyCacheDir, 'latest.json'), JSON.stringify(payload), 'utf8');
};

const readSyncMeta = async () => {
  const state = await BiddingSyncState.findByPk(1);
  return {
    actionAt: Number((state as any)?.last_attempt_at || 0),
    successAt: Number((state as any)?.last_success_at || 0),
  };
};

const readCountryStatsMeta = async () => {
  const now = Date.now();
  const startOfToday = getCstStartOfDayMs(now);
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const dateKey = getCstDayKey(startOfYesterday);
  const stat = await BiddingDailyStat.findOne({ where: { date_key: dateKey, scope_type: 'country', scope_value: '' } });
  if (!stat) return null;
  return {
    date: (stat as any).date_key,
    count: Number((stat as any).count || 0),
    totalYi: String((stat as any).total_yi || '0.00'),
    text: `昨日新增 ${Number((stat as any).count || 0)} 条，商机 ${String((stat as any).total_yi || '0.00')} 亿+`,
  };
};

const getTopCities = async (limit: number) => {
  const rows = await BiddingItem.findAll({
    attributes: ['city'],
    order: [['datetime_ts', 'DESC'], ['id', 'DESC']],
    limit: Math.max(3000, limit * 80),
    raw: true as any,
  });
  const counter = new Map<string, number>();
  for (const r of rows || []) {
    const city = String((r as any).city || '').trim();
    if (!city) continue;
    counter.set(city, (counter.get(city) || 0) + 1);
  }
  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([city]) => city);
};

const writeListSnapshot = async (scopeType: 'country' | 'city', scopeValue: string, page: number, pageSize: number, syncMeta: any, statsMeta: any) => {
  const where: any = {};
  if (scopeType === 'city' && scopeValue) where.city = { [Op.like]: `%${scopeValue}%` };
  const total = await BiddingItem.count({ where });
  const data = await BiddingItem.findAll({
    attributes: { exclude: ['detail_text'] },
    where,
    order: [['datetime_ts', 'DESC'], ['id', 'DESC']],
    offset: page * pageSize,
    limit: pageSize,
  });
  const payload = {
    code: 1,
    msg: 'success',
    data,
    total,
    syncMeta,
    statsMeta: scopeType === 'country' ? statsMeta : null,
    generatedAt: Date.now(),
    cacheScope: { type: scopeType, value: scopeValue, page, pageSize },
  };
  const scopeDirs = scopeType === 'country'
    ? [path.join(listCacheDir, 'country')]
    : Array.from(new Set([
        path.join(listCacheDir, 'city', scopeValue),
        path.join(listCacheDir, 'city', encodeURIComponent(scopeValue)),
      ]));
  for (const dir of scopeDirs) {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `page-${page}.json`), JSON.stringify(payload), 'utf8');
  }
};

export const writeStaticListSnapshots = async () => {
  await fs.mkdir(listCacheDir, { recursive: true });
  const pages = Math.max(1, Math.min(10, Number(process.env.STATIC_LIST_PAGES || 3)));
  const cityLimit = Math.max(0, Math.min(200, Number(process.env.STATIC_CITY_LIMIT || 80)));
  const syncMeta = await readSyncMeta();
  const statsMeta = await readCountryStatsMeta();
  for (let page = 0; page < pages; page++) {
    const pageSize = page === 0 ? 10 : 20;
    await writeListSnapshot('country', '', page, pageSize, syncMeta, statsMeta);
  }
  if (cityLimit <= 0) return;
  const cities = await getTopCities(cityLimit);
  for (const city of cities) {
    for (let page = 0; page < pages; page++) {
      const pageSize = page === 0 ? 10 : 20;
      await writeListSnapshot('city', city, page, pageSize, syncMeta, null);
    }
  }
};
