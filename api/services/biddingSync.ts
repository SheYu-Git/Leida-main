import axios from 'axios';
import { Op } from 'sequelize';
import BiddingItem from '../models/BiddingItem.js';
import BiddingDailyStat from '../models/BiddingDailyStat.js';
import BiddingSyncState from '../models/BiddingSyncState.js';
import { CST_OFFSET_MS, getCstDayKey, getCstStartOfDayMs, writeDailyReportSnapshot, writeHomeCachePage, writeStaticListSnapshots } from './cachePage.js';

const LIST_URL = String(process.env.BIDDING_LIST_URL || 'https://server.bookinge.com/cggg/wxapp/newlist').trim();
const INFO_URL = String(process.env.BIDDING_INFO_URL || 'https://server.bookinge.com/cggg/wxapp/newinfo').trim();
const DETAIL_URL = String(process.env.BIDDING_DETAIL_URL || 'https://server.bookinge.com/cggg/wxapp/article').trim();
const DETAIL_FALLBACK_URL = String(process.env.BIDDING_DETAIL_FALLBACK_URL || 'https://zhaobiao.agecms.com/api/detail').trim();

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.2(0x18000236) NetType/WIFI Language/zh_CN',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9',
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const parseAmountToYuan = (amountText: unknown) => {
  if (!amountText || typeof amountText !== 'string') return 0;
  const text = amountText.replace(/,/g, '').trim();
  const m = text.match(/(\d+(\.\d+)?)/);
  if (!m) return 0;
  const value = parseFloat(m[1]);
  if (Number.isNaN(value)) return 0;
  if (text.includes('亿')) return Math.round(value * 100000000);
  if (text.includes('万')) return Math.round(value * 10000);
  return Math.round(value);
};

const parseDateVal = (str: unknown) => {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  if (typeof str === 'string' && /^\d+$/.test(str)) {
    let ts = parseInt(str, 10);
    if (ts < 10000000000) ts *= 1000;
    return ts;
  }
  if (typeof str !== 'string') return 0;
  const s = str.trim();
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(s)) return new Date(s).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (s.includes('今天') || s.includes('昨天') || s.includes('前天')) {
    const base = new Date(today);
    if (s.includes('昨天')) base.setDate(base.getDate() - 1);
    else if (s.includes('前天')) base.setDate(base.getDate() - 2);
    const timeMatch = s.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) base.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
    return base.getTime();
  }
  const safe = s.replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '').replace(/\//g, '-');
  const ts = new Date(safe).getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

const extractExactDatetimeFromText = (text: string) => {
  const m = text.match(/(\d{4}[年-]\d{1,2}[月-]\d{1,2}[日\s]*\s+\d{1,2}:\d{2})/);
  if (!m) return '';
  return m[1].replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '').trim();
};

const extractPurchaserFromText = (text: string) => {
  if (!text) return '';
  const m =
    text.match(/采购单位<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/) ||
    text.match(/采购人<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/) ||
    text.match(/采购单位[:：]\s*<\/?(?:span|div|p)[^>]*>([\s\S]*?)<\/(?:span|div|p)>/);
  if (!m || !m[1]) return '';
  return String(m[1])
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
};

const pickFirstString = (...vals: any[]) => {
  for (const v of vals) {
    const s = String(v ?? '').trim();
    if (s) return s;
  }
  return '';
};

const extractListRows = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.list)) return payload.data.list;
  if (payload.data && Array.isArray(payload.data.rows)) return payload.data.rows;
  if (Array.isArray(payload.list)) return payload.list;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.result)) return payload.result;
  return [];
};

const fetchWithRetry = async <T>(fn: () => Promise<T>, tries = 3) => {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      await sleep(300 + i * 450);
    }
  }
  throw lastErr;
};

const fetchListPage = async (page: number) => {
  const ts = Math.floor(Date.now() / 1000);
  const urlObj = new URL(LIST_URL);
  const useNewList = /\/newlist$/i.test(urlObj.pathname);
  urlObj.searchParams.set('page', String(page));
  if (useNewList) {
    const province = String(process.env.BIDDING_LIST_PROVINCE || '').trim();
    const city = String(process.env.BIDDING_LIST_CITY || '').trim();
    if (province) urlObj.searchParams.set('province', province);
    if (city) urlObj.searchParams.set('city', city);
  } else {
    urlObj.searchParams.set('uid', '1');
    urlObj.searchParams.set('timestamp', String(ts));
  }
  const url = urlObj.toString();
  const res = await axios.get(url, { headers: HEADERS, timeout: 15000, validateStatus: () => true });
  if (res.status < 200 || res.status >= 300) throw new Error(`REMOTE_HTTP_${res.status}`);
  const rows = extractListRows(res.data);
  if (!rows.length) throw new Error('REMOTE_INVALID_DATA');
  return rows as any[];
};

const fetchInfo = async (id: number) => {
  const url = `${INFO_URL}?id=${encodeURIComponent(String(id))}`;
  const res = await axios.get(url, { headers: HEADERS, timeout: 15000, validateStatus: () => true });
  if (res.status < 200 || res.status >= 300) throw new Error(`REMOTE_HTTP_${res.status}`);
  if (!(res.data && res.data.code === 1 && res.data.data)) throw new Error('REMOTE_INVALID_DATA');
  return res.data.data as any;
};

const fetchArticle = async (id: number) => {
  const urls = [`${DETAIL_URL}?id=${encodeURIComponent(String(id))}`];
  if (DETAIL_FALLBACK_URL) urls.push(`${DETAIL_FALLBACK_URL}?id=${encodeURIComponent(String(id))}`);
  let lastErr: any = null;
  for (const url of urls) {
    try {
      const res = await axios.get(url, { headers: HEADERS, timeout: 15000, validateStatus: () => true });
      if (res.status < 200 || res.status >= 300) throw new Error(`REMOTE_HTTP_${res.status}`);
      if (!(res.data && res.data.code === 1 && res.data.data)) throw new Error('REMOTE_INVALID_DATA');
      const data = res.data.data;
      const text = typeof data.text === 'string' ? data.text : '';
      const u = (typeof data.weburl === 'string' && data.weburl) || (typeof data.url === 'string' && data.url) || '';
      if (text || u) return { text, url: u };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('REMOTE_INVALID_DATA');
};

const upsertItems = async (items: any[]) => {
  const rows = items
    .filter((x) => x && (x.id != null || x.article_id != null || x.info_id != null))
    .map((x) => {
      const id = Number(x.id ?? x.article_id ?? x.info_id);
      const datetime = pickFirstString(x.datetime, x.time, x.publish_time, x.pub_time, x.addtime);
      const datetimeTs = parseDateVal(x.datetime_ts ?? datetime);
      const bidPrice = pickFirstString(x.bid_price, x.bidPrice, x.price, x.amount);
      const bidPriceYuan = parseAmountToYuan(bidPrice);
      const url = pickFirstString(x.weburl, x.url, x.link, x.content_url);
      return {
        id,
        title: pickFirstString(x.title, x.name),
        datetime,
        datetime_ts: datetimeTs || null,
        bid_price: bidPrice,
        bid_price_yuan: bidPriceYuan || 0,
        url,
        city: pickFirstString(x.city, x.area_city),
        province: pickFirstString(x.province, x.area_province),
        purchaser: pickFirstString(x.purchaser, x.buyer, x.company),
        types: pickFirstString(x.types, x.type),
        txt: pickFirstString(x.txt, x.summary, x.desc),
        class: pickFirstString(x.class, x.source, x.channel),
      };
    })
    .filter((x) => Number.isFinite(x.id) && x.id > 0);
  if (!rows.length) return;
  await BiddingItem.bulkCreate(rows as any, { updateOnDuplicate: ['title', 'datetime', 'datetime_ts', 'bid_price', 'bid_price_yuan', 'url', 'city', 'province', 'purchaser', 'types', 'txt', 'class', 'updated_at'] });
};

const enrichDetails = async (maxCount = 30) => {
  const need = await BiddingItem.findAll({
    where: { [Op.or]: [{ detail_text: null as any }, { detail_text: '' }, { url: null as any }, { url: '' }, { purchaser: null as any }, { purchaser: '' }, { datetime_ts: null as any }] } as any,
    order: [['datetime_ts', 'DESC'], ['updated_at', 'DESC']],
    limit: maxCount,
  });
  for (const item of need) {
    try {
      const info = await fetchWithRetry(() => fetchInfo(Number(item.id)), 3).catch(() => null);
      const article = await fetchWithRetry(() => fetchArticle(Number(item.id)), 3).catch(() => null);
      const text = pickFirstString(article && article.text, (item as any).detail_text);
      const articleUrl = pickFirstString(article && article.url);
      const infoUrl = pickFirstString(info && info.weburl, info && info.url, info && info.link);
      const url = pickFirstString(infoUrl, articleUrl, (item as any).url);
      const exact = text ? extractExactDatetimeFromText(text) : '';
      const nextDatetime = pickFirstString(
        exact,
        info && info.datetime,
        info && info.time,
        info && info.publish_time,
        info && info.pub_time,
        info && info.addtime,
        (item as any).datetime
      );
      const nextTs = parseDateVal((info && (info.datetime_ts || info.time_ts)) || nextDatetime) || (item as any).datetime_ts || null;
      const extractedPurchaser = text ? extractPurchaserFromText(text) : '';
      const nextPurchaser = pickFirstString(info && info.purchaser, info && info.buyer, extractedPurchaser, (item as any).purchaser);
      const nextBidPrice = pickFirstString(info && info.bid_price, info && info.bidPrice, info && info.price, info && info.amount, (item as any).bid_price);
      const nextBidPriceYuan = parseAmountToYuan(nextBidPrice) || Number((item as any).bid_price_yuan || 0);
      const nextCity = pickFirstString(info && info.city, info && info.area_city, (item as any).city);
      const nextProvince = pickFirstString(info && info.province, info && info.area_province, (item as any).province);
      const nextTypes = pickFirstString(info && info.types, info && info.type, (item as any).types);
      const nextTxt = pickFirstString(info && info.txt, info && info.summary, info && info.desc, (item as any).txt);
      const nextClass = pickFirstString(info && info.class, info && info.source, info && info.channel, (item as any).class);
      const nextTitle = pickFirstString(info && info.title, info && info.name, (item as any).title);
      await item.update({
        title: nextTitle,
        datetime: nextDatetime,
        datetime_ts: nextTs,
        bid_price: nextBidPrice,
        bid_price_yuan: nextBidPriceYuan,
        city: nextCity,
        province: nextProvince,
        purchaser: nextPurchaser,
        types: nextTypes,
        txt: nextTxt,
        class: nextClass,
        detail_text: text || '',
        url: url || '',
      });
    } catch (e) {
      await item.update({ detail_text: null as any });
    }
    await sleep(80);
  }
};

const computeYesterdayStats = async () => {
  const nowMs = Date.now();
  const startOfToday = getCstStartOfDayMs(nowMs);
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const dateKey = getCstDayKey(startOfYesterday);

  const items = await BiddingItem.findAll({
    attributes: ['city', 'bid_price_yuan', 'datetime_ts'],
    where: {
      datetime_ts: {
        [Op.gte]: startOfYesterday,
        [Op.lt]: startOfToday,
      },
    },
  });

  let totalCount = 0;
  let totalYuan = 0;
  const cityMap = new Map<string, { count: number; totalYuan: number }>();
  for (const it of items) {
    totalCount += 1;
    totalYuan += Number((it as any).bid_price_yuan || 0);
    const city = String((it as any).city || '').trim();
    if (city) {
      const prev = cityMap.get(city) || { count: 0, totalYuan: 0 };
      prev.count += 1;
      prev.totalYuan += Number((it as any).bid_price_yuan || 0);
      cityMap.set(city, prev);
    }
  }
  const totalYi = (totalYuan / 100000000).toFixed(2);
  await BiddingDailyStat.upsert({
    date_key: dateKey,
    scope_type: 'country',
    scope_value: '',
    count: totalCount,
    total_yuan: totalYuan,
    total_yi: totalYi,
  } as any);

  for (const [city, stat] of cityMap.entries()) {
    const yi = (stat.totalYuan / 100000000).toFixed(2);
    await BiddingDailyStat.upsert({
      date_key: dateKey,
      scope_type: 'city',
      scope_value: city,
      count: stat.count,
      total_yuan: stat.totalYuan,
      total_yi: yi,
    } as any);
  }
};

export const runBiddingSyncOnce = async () => {
  const state = (await BiddingSyncState.findByPk(1)) || (await BiddingSyncState.create({ id: 1 } as any));
  await state.update({ last_attempt_at: Date.now(), last_error: '' });

  const maxPages = Number(process.env.BIDDING_SYNC_PAGES || 60);
  const pages: number[] = [];
  for (let p = 0; p < maxPages; p++) pages.push(p);

  const concurrency = Number(process.env.BIDDING_SYNC_CONCURRENCY || 4);
  let idx = 0;
  const allItems: any[] = [];
  const runOne = async () => {
    while (idx < pages.length) {
      const p = pages[idx++];
      try {
        const items = await fetchWithRetry(() => fetchListPage(p), 3);
        if (Array.isArray(items) && items.length) allItems.push(...items);
        await state.update({ last_page: p });
      } catch (e) {}
      await sleep(120);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, runOne));

  await upsertItems(allItems);
  await enrichDetails(Number(process.env.BIDDING_DETAIL_PER_RUN || 200));
  try {
    await computeYesterdayStats();
  } catch (e) {}

  await state.update({ last_success_at: Date.now(), last_error: '' });
  try {
    await writeDailyReportSnapshot();
    await writeHomeCachePage();
    await writeStaticListSnapshots();
  } catch (e) {}
};

export const runBiddingSyncRecentDays = async (days = 15) => {
  const state = (await BiddingSyncState.findByPk(1)) || (await BiddingSyncState.create({ id: 1 } as any));
  await state.update({ last_attempt_at: Date.now(), last_error: '' });

  const now = Date.now();
  const cutoffMs = now - Math.max(1, Number(days || 15)) * 24 * 60 * 60 * 1000;
  const maxPages = Number(process.env.BIDDING_SYNC_PAGES || 120);
  const allItems: any[] = [];

  for (let p = 0; p < maxPages; p++) {
    let items: any[] = [];
    try {
      items = await fetchWithRetry(() => fetchListPage(p), 3);
    } catch (e) {
      await state.update({ last_page: p });
      continue;
    }
    if (Array.isArray(items) && items.length) allItems.push(...items);
    await state.update({ last_page: p });

    const tsList = (items || []).map((x) => parseDateVal(x && x.datetime)).filter((x) => x && typeof x === 'number') as number[];
    const minTs = tsList.length ? Math.min(...tsList) : 0;
    if (minTs && minTs < cutoffMs) {
      const allOlder = tsList.length && tsList.every((t) => t < cutoffMs);
      if (allOlder) break;
    }
    await sleep(220);
  }

  const filtered = allItems.filter((x) => {
    const ts = parseDateVal(x && x.datetime);
    if (!ts) return true;
    return ts >= cutoffMs;
  });

  await upsertItems(filtered);
  await enrichDetails(Number(process.env.BIDDING_DETAIL_PER_RUN || 400));
  try {
    await computeYesterdayStats();
  } catch (e) {}
  await state.update({ last_success_at: Date.now(), last_error: '' });
  try {
    await writeDailyReportSnapshot();
    await writeHomeCachePage();
    await writeStaticListSnapshots();
  } catch (e) {}
};

export const startBiddingSync = () => {
  const intervalMs = Number(process.env.BIDDING_SYNC_INTERVAL_MS || 600000);
  const startHour = Number(process.env.BIDDING_SYNC_START_HOUR || 7);
  const endHour = Number(process.env.BIDDING_SYNC_END_HOUR || 1);
  const pauseStartText = String(process.env.BIDDING_SYNC_PAUSE_START || '00:10').trim();
  const pauseEndText = String(process.env.BIDDING_SYNC_PAUSE_END || '08:00').trim();
  const parseHm = (s: string) => {
    const m = String(s || '').match(/^(\d{1,2}):(\d{1,2})$/);
    if (!m) return -1;
    const hh = Math.max(0, Math.min(23, Number(m[1])));
    const mm = Math.max(0, Math.min(59, Number(m[2])));
    return hh * 60 + mm;
  };
  const pauseStartMin = parseHm(pauseStartText);
  const pauseEndMin = parseHm(pauseEndText);
  let running = false;
  const isInPauseWindow = () => {
    if (pauseStartMin < 0 || pauseEndMin < 0) return false;
    const cst = new Date(Date.now() + CST_OFFSET_MS);
    const cur = cst.getUTCHours() * 60 + cst.getUTCMinutes();
    if (pauseStartMin === pauseEndMin) return false;
    if (pauseStartMin < pauseEndMin) return cur >= pauseStartMin && cur < pauseEndMin;
    return cur >= pauseStartMin || cur < pauseEndMin;
  };
  const isInWindow = () => {
    const now = Date.now();
    const cst = new Date(now + CST_OFFSET_MS);
    const hh = cst.getUTCHours();
    if (startHour === endHour) return true;
    if (startHour < endHour) return hh >= startHour && hh < endHour;
    return hh >= startHour || hh < endHour;
  };
  const tick = async () => {
    if (running) return;
    if (!isInWindow()) return;
    if (isInPauseWindow()) return;
    running = true;
    try {
      await runBiddingSyncOnce();
    } catch (e) {
      const state = (await BiddingSyncState.findByPk(1)) || null;
      if (state) await state.update({ last_error: String((e as any)?.message || e) });
    } finally {
      running = false;
    }
  };
  const schedule = () => {
    const now = Date.now();
    const cst = new Date(now + CST_OFFSET_MS);
    const mm = cst.getUTCMinutes();
    const ss = cst.getUTCSeconds();
    const ms = cst.getUTCMilliseconds();
    const nextMin = (Math.floor(mm / 10) + 1) * 10;
    let addMin = nextMin - mm;
    if (addMin <= 0) addMin += 10;
    const delay = addMin * 60 * 1000 - ss * 1000 - ms;
    setTimeout(async () => {
      await tick();
      setInterval(tick, intervalMs);
    }, Math.max(1000, delay));
  };
  setTimeout(() => {
    tick();
  }, 1200);
  schedule();
};

export const startDailyStatsJob = () => {
  const minute = 60 * 1000;
  let lastDateKey = '';
  const maybeRun = async () => {
    const now = Date.now();
    const cst = new Date(now + CST_OFFSET_MS);
    const hh = cst.getUTCHours();
    const mm = cst.getUTCMinutes();
    const startOfToday = getCstStartOfDayMs(now);
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const dateKey = getCstDayKey(startOfYesterday);
    if (dateKey === lastDateKey) return;
    if (hh !== 1 || mm > 20) return;
    lastDateKey = dateKey;
    try {
      await computeYesterdayStats();
      await writeDailyReportSnapshot();
      await writeHomeCachePage();
      await writeStaticListSnapshots();
    } catch (e) {}
  };
  maybeRun();
  setInterval(maybeRun, minute);
};
