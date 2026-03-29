import express, { type Request, type Response } from 'express';
import axios from 'axios';
import { Op } from 'sequelize';
import BiddingItem from '../models/BiddingItem.js';
import BiddingDailyStat from '../models/BiddingDailyStat.js';
import BiddingSyncState from '../models/BiddingSyncState.js';
import { getCstDayKey, getCstStartOfDayMs } from '../services/cachePage.js';

const router = express.Router();
const escapeHtml = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const fetchUpstreamDetailById = async (id: number) => {
  const infoApi = String(process.env.BIDDING_INFO_URL || 'https://server.bookinge.com/cggg/wxapp/newinfo').trim();
  const primary = String(process.env.BIDDING_DETAIL_URL || 'https://server.bookinge.com/cggg/wxapp/article').trim();
  const fallback = String(process.env.BIDDING_DETAIL_FALLBACK_URL || 'https://zhaobiao.agecms.com/api/detail').trim();
  const urls = [`${infoApi}?id=${encodeURIComponent(String(id))}`, `${primary}?id=${encodeURIComponent(String(id))}`];
  if (fallback) urls.push(`${fallback}?id=${encodeURIComponent(String(id))}`);
  const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.2(0x18000236) NetType/WIFI Language/zh_CN',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
  };
  let bestText = '';
  let bestUrl = '';
  for (const upstream of urls) {
    try {
      const r = await axios.get(upstream, { headers, timeout: 15000, validateStatus: () => true });
      if (!(r.status >= 200 && r.status < 300 && r.data && r.data.code === 1 && r.data.data)) continue;
      const data = r.data.data;
      const text = typeof data.text === 'string' ? data.text : '';
      const url = (typeof data.weburl === 'string' && data.weburl) || (typeof data.url === 'string' && data.url) || '';
      if (text && !bestText) bestText = text;
      if (url && !bestUrl) bestUrl = url;
      if (bestText && bestUrl) return { text: bestText, url: bestUrl };
    } catch (e) {}
  }
  if (bestText || bestUrl) return { text: bestText, url: bestUrl };
  return null;
};

router.get('/list', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const page = Math.max(0, parseInt(String(req.query.page || '0'), 10) || 0);
  const pageSize = Math.max(1, Math.min(50, parseInt(String(req.query.pageSize || '20'), 10) || 20));
  const city = String(req.query.city || '').trim();
  const keyword = String(req.query.keyword || '').trim();

  const where: any = {};
  if (city && city !== '全国') where.city = { [Op.like]: `%${city}%` };
  if (keyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${keyword}%` } },
      { purchaser: { [Op.like]: `%${keyword}%` } },
    ];
  }

  const total = await BiddingItem.count({ where });
  const data = await BiddingItem.findAll({
    attributes: { exclude: ['detail_text'] },
    where,
    order: [['datetime_ts', 'DESC'], ['id', 'DESC']],
    offset: page * pageSize,
    limit: pageSize,
  });
  const latestItem = data && data[0] ? (data[0] as any) : null;
  const latestDataAt = Number((latestItem && latestItem.datetime_ts) || 0);

  const state = await BiddingSyncState.findByPk(1);
  const lagAlertMin = Math.max(1, Number(process.env.BIDDING_SYNC_ALERT_LAG_MIN || 15));
  const staleAlertHours = Math.max(1, Number(process.env.BIDDING_DATA_STALE_HOURS || 24));
  const successAt = Number((state as any)?.last_success_at || 0);
  const actionAt = Number((state as any)?.last_attempt_at || 0);
  const lagMin = successAt ? Math.max(0, Math.floor((Date.now() - successAt) / 60000)) : -1;
  const latestDataLagMin = latestDataAt ? Math.max(0, Math.floor((Date.now() - latestDataAt) / 60000)) : -1;
  const staleAlertMin = staleAlertHours * 60;
  const dataStale = !latestDataAt || latestDataLagMin >= staleAlertMin;
  const lastError = String((state as any)?.last_error || '').trim();
  const alertActive = !successAt || !!lastError || (lagMin >= lagAlertMin) || dataStale;
  const alertReason = !successAt
    ? '未检测到成功同步'
    : (lastError
      ? `同步异常：${lastError}`
      : (lagMin >= lagAlertMin
        ? `同步延迟超过${lagAlertMin}分钟`
        : (dataStale ? `数据未更新超过${staleAlertHours}小时` : '')));
  const nowMs = Date.now();
  const startOfToday = getCstStartOfDayMs(nowMs);
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const dateKey = getCstDayKey(startOfYesterday);
  const statWhere: any = { date_key: dateKey, scope_type: 'country', scope_value: '' };
  if (city && city !== '全国') {
    statWhere.scope_type = 'city';
    statWhere.scope_value = city;
  }
  let stat = await BiddingDailyStat.findOne({ where: statWhere });
  if (!stat && city && city !== '全国') {
    stat = await BiddingDailyStat.findOne({ where: { date_key: dateKey, scope_type: 'city', scope_value: { [Op.like]: `%${city}%` } } as any });
  }
  res.json({
    code: 1,
    msg: 'success',
    data,
    total,
    syncMeta: {
      actionAt,
      successAt,
      lagMin,
      latestDataLagMin,
      dataStale,
      staleAlertHours,
      alertActive,
      alertReason,
      latestDataAt,
    },
    statsMeta: stat ? {
      date: (stat as any).date_key,
      count: Number((stat as any).count || 0),
      totalYi: String((stat as any).total_yi || '0.00'),
      text: `昨日新增 ${Number((stat as any).count || 0)} 条，商机 ${String((stat as any).total_yi || '0.00')} 亿+`,
    } : null,
  });
});

router.get('/detail', async (req: Request, res: Response) => {
  const id = parseInt(String(req.query.id || ''), 10);
  if (!id) {
    res.status(400).json({ code: 0, msg: 'Missing ID' });
    return;
  }
  const item = await BiddingItem.findByPk(id);
  if (!item) {
    res.status(404).json({ code: 0, msg: 'Not found' });
    return;
  }
  const curText = String((item as any).detail_text || '');
  const curUrl = String((item as any).url || '');
  if (!curText || !curUrl) {
    const up = await fetchUpstreamDetailById(id);
    if (up && (up.text || up.url)) {
      const nextText = up.text || curText || '';
      const nextUrl = up.url || curUrl || '';
      if (nextText || nextUrl) await item.update({ detail_text: nextText, url: nextUrl } as any);
    }
  }
  res.json({
    code: 1,
    msg: 'success',
    data: {
      id: item.id,
      text: (item as any).detail_text || '',
      url: (item as any).url || '',
      weburl: (item as any).url || '',
    },
  });
});

router.get('/detail-view', async (req: Request, res: Response) => {
  const id = parseInt(String(req.query.id || ''), 10);
  if (!id) {
    res.status(400).type('html').send('<h3>Missing ID</h3>');
    return;
  }
  const item = await BiddingItem.findByPk(id);
  if (!item) {
    res.status(404).type('html').send('<h3>Not found</h3>');
    return;
  }
  let text = String((item as any).detail_text || '');
  let sourceUrl = String((item as any).url || '');
  if (!text || !sourceUrl) {
    const up = await fetchUpstreamDetailById(id);
    if (up && (up.text || up.url)) {
      await item.update({ detail_text: up.text || text, url: up.url || sourceUrl } as any);
      text = up.text || text;
      sourceUrl = up.url || sourceUrl;
    }
  }
  const title = escapeHtml((item as any).title || `招标详情 ${id}`);
  const dt = escapeHtml((item as any).datetime || '');
  const city = escapeHtml((item as any).city || '');
  const purchaser = escapeHtml((item as any).purchaser || '');
  const bidPrice = escapeHtml((item as any).bid_price || '');
  const urlHtml = /^https?:\/\//i.test(sourceUrl)
    ? `<div style="margin:14px 0 0;"><a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">打开上游原文</a></div>`
    : '';
  const body = text && String(text).trim()
    ? String(text)
    : `<div style="padding:18px;color:#666;">暂无正文内容，ID: ${id}</div>`;
  res.type('html').send(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;color:#222}.wrap{max-width:900px;margin:0 auto;padding:14px}.card{background:#fff;border-radius:12px;padding:14px 16px;box-shadow:0 1px 8px rgba(0,0,0,.06)}.meta{font-size:12px;color:#777;display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}</style></head><body><div class="wrap"><div class="card"><h2 style="margin:0 0 8px;line-height:1.45;">${title}</h2><div class="meta"><span>${dt}</span><span>${city}</span><span>${purchaser}</span><span>${bidPrice}</span></div>${urlHtml}</div><div class="card" style="margin-top:12px;line-height:1.65;">${body}</div></div></body></html>`);
});

export default router;
