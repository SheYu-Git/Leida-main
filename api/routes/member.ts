import express, { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { AlipaySdk } from 'alipay-sdk';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import MemberPlan from '../models/MemberPlan.js';
import UserSubscription from '../models/UserSubscription.js';
import MemberActivationCode from '../models/MemberActivationCode.js';
import MemberOrder from '../models/MemberOrder.js';
import { ensureMemberSeed } from '../services/memberSeed.js';
import { bindInviterByCode, ensureInviteCode, getReferralSummary, listReferralRecords, normalizeInviteCode, settleFirstPurchaseReward } from '../services/referral.js';
import { formatVipExpireDate, normalizeVipExpireMs, readVipExpireRawMs } from '../services/vipExpire.js';
import { getPublishedConfigByKey } from '../services/configService.js';

const router = express.Router();

let memberSeeded = false;
const ensureSeedOnce = async () => {
  if (memberSeeded) return;
  await ensureMemberSeed();
  memberSeeded = true;
};

const toSubDto = (s: any) => {
  let keywords: string[] = [];
  let readItemIds: string[] = [];
  try {
    const parsed = JSON.parse(String(s.keywords_json || '[]'));
    if (Array.isArray(parsed)) keywords = parsed.map((x) => String(x)).filter(Boolean);
  } catch (e) {}
  try {
    const parsed = JSON.parse(String(s.read_item_ids_json || '[]'));
    if (Array.isArray(parsed)) readItemIds = parsed.map((x) => String(x)).filter(Boolean);
  } catch (e) {}
  return {
    id: Number(s.id),
    keywords,
    scopeType: String(s.scope_type || 'country'),
    scopeValue: String(s.scope_value || ''),
    pushEnabled: !!s.push_enabled,
    createTime: s.created_at ? new Date(s.created_at).toISOString() : new Date().toISOString(),
    updateTime: s.updated_at ? new Date(s.updated_at).toISOString() : new Date().toISOString(),
    unreadCount: Number(s.unread_count || 0),
    lastCheckTime: s.last_check_at ? new Date(s.last_check_at).getTime() : 0,
    lastReadAt: s.last_read_at ? new Date(s.last_read_at).getTime() : 0,
    readItemIds,
  };
};

const normalizeVip = (u: any) => {
  const vipLevel = String(u.vip_level || 'free');
  const vipScopeValue = String(u.vip_scope_value || '');
  const vipExpireFmt = formatVipExpireDate(u.vip_expire_at);
  const vipExpireRaw = String(u.vip_expire_at || '').trim();
  const vipExpire = vipExpireFmt || ((vipExpireRaw.match(/\d{4}-\d{2}-\d{2}/) || [])[0] || '');
  const balance = Number(u.balance_yuan || 0);
  return { vipLevel, vipScopeValue, vipExpire, vipExpireRaw, balance };
};

const PROFILE_REWARD_FREE_DAYS = 15;
const PROFILE_REWARD_PAID_DAYS = 30;

const trimText = (v: unknown) => String(v == null ? '' : v).trim();

const normalizeProfileRewardConfig = (raw: any) => {
  const freeToCityDays = Math.max(1, Math.min(60, Number((raw && raw.freeToCityDays) || PROFILE_REWARD_FREE_DAYS)));
  const paidExtendDays = Math.max(1, Math.min(60, Number((raw && raw.paidExtendDays) || PROFILE_REWARD_PAID_DAYS)));
  return { freeToCityDays, paidExtendDays };
};

const readProfileRewardConfig = async () => {
  const cfg = await getPublishedConfigByKey('profile.reward', {});
  return normalizeProfileRewardConfig(cfg);
};

const buildProfileCompletion = (u: any) => {
  const fields = {
    companyName: trimText((u as any).company_name),
    realName: trimText((u as any).real_name),
    positionTitle: trimText((u as any).position_title),
    phone: trimText((u as any).phone),
    email: trimText((u as any).email),
    wechatId: trimText((u as any).wechat_id),
  };
  const requiredKeys = Object.keys(fields);
  const completedCount = requiredKeys.filter((k) => trimText((fields as any)[k])).length;
  const isCompleted = completedCount === requiredKeys.length;
  return {
    fields,
    completedCount,
    totalRequired: requiredKeys.length,
    isCompleted,
    rewardGranted: !!(u as any).profile_reward_granted_at,
    rewardGrantedAt: (u as any).profile_reward_granted_at ? new Date((u as any).profile_reward_granted_at).toISOString() : null,
  };
};

const applyProfileRewardIfNeeded = async (user: any) => {
  if (!user) return { granted: false, msg: '', reason: 'no_user' };
  const rewardConfig = await readProfileRewardConfig();
  const completion = buildProfileCompletion(user);
  if (!completion.isCompleted) return { granted: false, msg: '', reason: 'incomplete' };
  if ((user as any).profile_reward_granted_at) return { granted: false, msg: '', reason: 'already_granted' };
  const currentLevel = String((user as any).vip_level || 'free');
  const now = Date.now();
  const currentExpire = normalizeVipExpireMs((user as any).vip_expire_at);
  let nextLevel = currentLevel;
  let nextScopeValue = String((user as any).vip_scope_value || '');
  let addDays = rewardConfig.paidExtendDays;
  if (currentLevel === 'free') {
    nextLevel = 'city';
    nextScopeValue = nextScopeValue || '全国';
    addDays = rewardConfig.freeToCityDays;
  } else if (currentLevel === 'country') {
    nextScopeValue = '全国';
  }
  const base = currentExpire > now ? currentExpire : now;
  const nextExpireMs = base + addDays * 24 * 60 * 60 * 1000;
  await (user as any).update({
    vip_level: nextLevel,
    vip_scope_value: nextScopeValue,
    vip_expire_at: nextExpireMs,
    profile_reward_granted_at: new Date(),
  });
  try {
    await MemberOrder.create({
      order_no: makeOrderNo('PRF'),
      user_id: Number((user as any).id || 0),
      plan_code: nextLevel,
      scope_value: nextScopeValue,
      amount_yuan: '0.00',
      source: 'profile_reward',
      status: 'fulfilled',
      paid_at: new Date(),
      fulfilled_at: new Date(),
      ext_json: JSON.stringify({ addDays, fromLevel: currentLevel }),
    } as any);
  } catch (e) {}
  return {
    granted: true,
    msg: currentLevel === 'free' ? `资料补全奖励已发放：城市会员权益${rewardConfig.freeToCityDays}天` : `资料补全奖励已发放：当前会员有效期延长${rewardConfig.paidExtendDays}天`,
    reason: 'granted',
  };
};

const recoverVipExpireMsFromOrders = async (uid: number, planCode: string) => {
  if (!uid || !planCode || planCode === 'free') return 0;
  const plans = await MemberPlan.findAll({ where: { is_active: true }, order: [['id', 'ASC']] }).catch(() => [] as any[]);
  const durationMap = new Map<string, number>();
  for (const p of plans as any[]) {
    const code = String((p as any).code || '').trim();
    const days = Math.max(1, Number((p as any).duration_days || 365));
    if (code) durationMap.set(code, days);
  }
  const rows = await MemberOrder.findAll({
    where: { user_id: uid, plan_code: planCode } as any,
    order: [['created_at', 'ASC']],
  }).catch(() => [] as any[]);
  let expireMs = 0;
  for (const r of rows as any[]) {
    const st = String((r as any).status || '').trim();
    if (!(st === 'fulfilled' || st === 'paid')) continue;
    const ts = normalizeVipExpireMs((r as any).fulfilled_at || (r as any).paid_at || (r as any).created_at);
    const base = Math.max(expireMs, ts || Date.now());
    let days = durationMap.get(String((r as any).plan_code || '').trim()) || 365;
    try {
      const ext = JSON.parse(String((r as any).ext_json || '{}'));
      const addDays = Number((ext as any).addDays || 0);
      if (Number.isFinite(addDays) && addDays > 0 && addDays <= 60) days = addDays;
    } catch (e) {}
    expireMs = base + days * 24 * 60 * 60 * 1000;
  }
  return normalizeVipExpireMs(expireMs);
};

const buildInviteLink = (req: Request, code: string) => {
  const host = req.get('host');
  const protocol = req.protocol || 'https';
  const base = host ? `${protocol}://${host}` : 'https://zhaobiao.agecms.com';
  return `${base}/?inviteCode=${encodeURIComponent(code)}`;
};

const makeOrderNo = (prefix: string) => {
  const ts = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}${ts}${rand}`;
};

const getAppleIapProductMap = () => ({
  city: String(process.env.APPLE_IAP_PRODUCT_CITY || '').trim(),
  province: String(process.env.APPLE_IAP_PRODUCT_PROVINCE || '').trim(),
  country: String(process.env.APPLE_IAP_PRODUCT_COUNTRY || '').trim(),
});

const makeStableAppAccountToken = (userId: number) => {
  const hex = crypto.createHash('sha256').update(`leida-user-${Number(userId) || 0}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

const findPlanCodeByAppleProductId = (productId: string) => {
  const pid = String(productId || '').trim();
  if (!pid) return '';
  const map = getAppleIapProductMap();
  if (map.city && map.city === pid) return 'city';
  if (map.province && map.province === pid) return 'province';
  if (map.country && map.country === pid) return 'country';
  return '';
};

const toHttpsBase = (req: Request) => {
  const host = String(req.get('host') || '').trim();
  if (!host) return 'https://zhaobiao.agecms.com';
  const proto = String(req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim() || 'https';
  return `${proto}://${host}`;
};

const readAlipayConfig = async () => {
  const cfg = await getPublishedConfigByKey('payment.channels', {});
  const clean = (v: unknown) => String(v || '').trim().replace(/^['"`]+|['"`]+$/g, '');
  const normalizePem = (v: unknown) => clean(v).replace(/\\n/g, '\n');
  const appId = clean(process.env.ALIPAY_APP_ID || cfg?.alipayAppId || '');
  const privateKey = normalizePem(process.env.ALIPAY_PRIVATE_KEY || '');
  const alipayPublicKey = normalizePem(process.env.ALIPAY_PUBLIC_KEY || cfg?.alipayPublicKey || '');
  const gateway = clean(process.env.ALIPAY_GATEWAY || cfg?.alipayGateway || 'https://openapi.alipay.com/gateway.do');
  const notifyUrl = clean(process.env.ALIPAY_NOTIFY_URL || cfg?.alipayNotifyUrl || '');
  const returnUrl = clean(process.env.ALIPAY_RETURN_URL || cfg?.alipayReturnUrl || '');
  return { appId, privateKey, alipayPublicKey, gateway, notifyUrl, returnUrl };
};

const createAlipayClient = (cfg: { appId: string; privateKey: string; alipayPublicKey: string; gateway: string; }) => (
  new AlipaySdk({
    appId: cfg.appId,
    privateKey: cfg.privateKey,
    alipayPublicKey: cfg.alipayPublicKey,
    gateway: cfg.gateway,
  })
);

const applyPaidMemberOrder = async (uid: number, planCode: string, scopeValue: string) => {
  const user = await User.findByPk(uid);
  if (!user) return null;
  const plan = await MemberPlan.findOne({ where: { code: planCode } as any }).catch(() => null as any);
  const durationDays = plan ? Math.max(1, Number((plan as any).duration_days || 365)) : 365;
  const now = Date.now();
  const addMs = durationDays * 24 * 60 * 60 * 1000;
  const curExpireMs = normalizeVipExpireMs((user as any).vip_expire_at);
  const base = curExpireMs > now && String((user as any).vip_level || '') === planCode ? curExpireMs : now;
  const nextScope = planCode === 'country' ? '全国' : String(scopeValue || '').trim();
  await (user as any).update({ vip_level: planCode, vip_scope_value: nextScope, vip_expire_at: base + addMs });
  return user;
};

const normalizeTrialUsage = (rows: any[]) => {
  const used = { city: false, province: false, country: false };
  for (const r of rows || []) {
    const code = String((r as any)?.plan_code || '').trim();
    if (code === 'city' || code === 'province' || code === 'country') (used as any)[code] = true;
  }
  return used;
};

router.get('/plans', async (req: Request, res: Response) => {
  try { await ensureSeedOnce(); } catch (e) {}
  const plans = await MemberPlan.findAll({ where: { is_active: true }, order: [['id', 'ASC']] });
  const productMap = getAppleIapProductMap();
  res.json({
    code: 1,
    msg: 'success',
    data: plans.map((p: any) => ({
      code: String(p.code),
      name: String(p.name || ''),
      priceYuan: Number(p.price_yuan || 0),
      durationDays: Number(p.duration_days || 0),
      appleProductId: productMap[String(p.code) as 'city' | 'province' | 'country'] || '',
      entitlements: (() => {
        try { return JSON.parse(String(p.entitlements_json || '{}')); } catch (e) { return {}; }
      })(),
    })),
  });
});

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try { await ensureSeedOnce(); } catch (e) {}
  const uid = (req as any).user?.id;
  const user = await User.findByPk(uid);
  if (!user) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const rawExpireMs = readVipExpireRawMs((user as any).vip_expire_at);
  const normExpireMs = normalizeVipExpireMs((user as any).vip_expire_at);
  const level = String((user as any).vip_level || 'free');
  let nextExpireMs = normExpireMs;
  if (level !== 'free') {
    const recoveredExpireMs = await recoverVipExpireMsFromOrders(Number(uid || 0), level);
    if (recoveredExpireMs) nextExpireMs = recoveredExpireMs;
  }
  const updates: any = {};
  if (rawExpireMs !== nextExpireMs) {
    updates.vip_expire_at = nextExpireMs || 0;
    (user as any).vip_expire_at = nextExpireMs || 0;
  }
  if (level !== 'free' && nextExpireMs && nextExpireMs < Date.now()) {
    updates.vip_level = 'free';
    updates.vip_scope_value = '';
    (user as any).vip_level = 'free';
    (user as any).vip_scope_value = '';
  }
  if (Object.keys(updates).length > 0) {
    await (user as any).update(updates);
  }
  const subs = await UserSubscription.findAll({ where: { user_id: uid }, order: [['updated_at', 'DESC']] });
  const plans = await MemberPlan.findAll({ where: { is_active: true }, order: [['id', 'ASC']] });
  const trialRows = await MemberOrder.findAll({
    where: { user_id: Number(uid || 0), source: 'trial', status: 'fulfilled' } as any,
    attributes: ['plan_code'],
  }).catch(() => [] as any[]);
  const trialUsage = normalizeTrialUsage(trialRows as any[]);
  const productMap = getAppleIapProductMap();
  const iapReferenceUuid = makeStableAppAccountToken(Number(uid || 0));
  const inviteCode = String((user as any).invite_code || '');
  const profileCompletion = buildProfileCompletion(user as any);
  const rewardCfg = await readProfileRewardConfig();
  res.json({
    code: 1,
    msg: 'success',
    data: {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar || '',
        role: user.role,
        phone: user.phone || '',
        email: (user as any).email || '',
        company_name: (user as any).company_name || '',
        real_name: (user as any).real_name || '',
        position_title: (user as any).position_title || '',
        wechat_id: user.wechat_id || '',
        inviteCode,
        invitedByUserId: Number((user as any).invited_by_user_id || 0),
        inviteRewardTotalYuan: Number((user as any).invite_reward_total_yuan || 0),
        iapReferenceUuid,
        trialUsage,
        profileRewardGrantedAt: (user as any).profile_reward_granted_at ? new Date((user as any).profile_reward_granted_at).toISOString() : null,
        ...normalizeVip(user as any),
        viewUsage: Number((user as any).view_usage || 0),
        viewHistoryJson: String((user as any).view_history_json || '[]'),
      },
      profileCompletion,
      profileRewardConfig: {
        freeToCityDays: rewardCfg.freeToCityDays,
        paidExtendDays: rewardCfg.paidExtendDays,
      },
      trialUsage,
      subscriptions: subs.map((s: any) => toSubDto(s)),
      plans: plans.map((p: any) => ({
        code: String(p.code),
        name: String(p.name || ''),
        priceYuan: Number(p.price_yuan || 0),
        durationDays: Number(p.duration_days || 0),
        appleProductId: productMap[String(p.code) as 'city' | 'province' | 'country'] || '',
        entitlements: (() => {
          try { return JSON.parse(String(p.entitlements_json || '{}')); } catch (e) { return {}; }
        })(),
      })),
    },
  });
});

router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
  const uid = Number((req as any).user?.id || 0);
  const oldPassword = String(req.body?.oldPassword || '');
  const newPassword = String(req.body?.newPassword || '');
  if (!uid || !oldPassword || !newPassword) {
    res.status(400).json({ code: 0, msg: '参数不完整' });
    return;
  }
  if (newPassword.length < 6 || newPassword.length > 64) {
    res.status(400).json({ code: 0, msg: '新密码长度需为6-64位' });
    return;
  }
  if (oldPassword === newPassword) {
    res.status(400).json({ code: 0, msg: '新密码不能与旧密码相同' });
    return;
  }
  const user = await User.findByPk(uid);
  if (!user) {
    res.status(401).json({ code: 0, msg: '未登录或会话已过期' });
    return;
  }
  const hashed = String((user as any).password || '');
  const ok = await bcrypt.compare(oldPassword, hashed).catch(() => false);
  if (!ok) {
    res.status(400).json({ code: 0, msg: '旧密码错误' });
    return;
  }
  const nextHash = await bcrypt.hash(newPassword, 10);
  await (user as any).update({ password: nextHash });
  res.json({ code: 1, msg: '密码修改成功' });
});

router.get('/subscriptions', authenticateToken, async (req: Request, res: Response) => {
  const uid = (req as any).user?.id;
  const subs = await UserSubscription.findAll({ where: { user_id: uid }, order: [['updated_at', 'DESC']] });
  res.json({ code: 1, msg: 'success', data: subs.map((s: any) => toSubDto(s)) });
});

router.post('/subscriptions', authenticateToken, async (req: Request, res: Response) => {
  const uid = (req as any).user?.id;
  const keywords = Array.isArray(req.body?.keywords) ? req.body.keywords.map((x: any) => String(x)).filter(Boolean) : [];
  const scopeType = String(req.body?.scopeType || 'country');
  const scopeValue = String(req.body?.scopeValue || '');
  const pushEnabled = req.body?.pushEnabled !== false;
  const readItemIds = Array.isArray(req.body?.readItemIds) ? req.body.readItemIds.map((x: any) => String(x)).filter(Boolean).slice(0, 1000) : [];
  if (!keywords.length) {
    res.status(400).json({ code: 0, msg: 'Missing keywords' });
    return;
  }
  if (!['city', 'province', 'country'].includes(scopeType)) {
    res.status(400).json({ code: 0, msg: 'Invalid scopeType' });
    return;
  }
  const sub = await UserSubscription.create({
    user_id: uid,
    keywords_json: JSON.stringify(keywords),
    scope_type: scopeType as any,
    scope_value: scopeValue,
    push_enabled: !!pushEnabled,
    read_item_ids_json: JSON.stringify(readItemIds),
  } as any);
  res.json({ code: 1, msg: 'success', data: toSubDto(sub) });
});

router.put('/subscriptions/:id', authenticateToken, async (req: Request, res: Response) => {
  const uid = (req as any).user?.id;
  const id = Number(req.params.id);
  const sub = await UserSubscription.findOne({ where: { id, user_id: uid } as any });
  if (!sub) {
    res.status(404).json({ code: 0, msg: 'Not found' });
    return;
  }
  const keywords = Array.isArray(req.body?.keywords) ? req.body.keywords.map((x: any) => String(x)).filter(Boolean) : null;
  const scopeType = req.body?.scopeType != null ? String(req.body.scopeType) : null;
  const scopeValue = req.body?.scopeValue != null ? String(req.body.scopeValue) : null;
  const pushEnabled = req.body?.pushEnabled != null ? !!req.body.pushEnabled : null;
  const unreadCount = req.body?.unreadCount != null ? Number(req.body.unreadCount) : null;
  const lastCheckTime = req.body?.lastCheckTime != null ? Number(req.body.lastCheckTime) : null;
  const lastReadAt = req.body?.lastReadAt != null ? Number(req.body.lastReadAt) : null;
  const readItemIds = Array.isArray(req.body?.readItemIds) ? req.body.readItemIds.map((x: any) => String(x)).filter(Boolean).slice(0, 1000) : null;
  const patch: any = {};
  if (keywords) patch.keywords_json = JSON.stringify(keywords);
  if (scopeType) patch.scope_type = scopeType;
  if (scopeValue != null) patch.scope_value = scopeValue;
  if (pushEnabled != null) patch.push_enabled = pushEnabled;
  if (unreadCount != null && Number.isFinite(unreadCount) && unreadCount >= 0) patch.unread_count = Math.floor(unreadCount);
  if (lastCheckTime != null && Number.isFinite(lastCheckTime) && lastCheckTime > 0) patch.last_check_at = new Date(lastCheckTime);
  if (lastReadAt != null && Number.isFinite(lastReadAt) && lastReadAt > 0) patch.last_read_at = new Date(lastReadAt);
  if (readItemIds != null) patch.read_item_ids_json = JSON.stringify(readItemIds);
  await (sub as any).update(patch);
  res.json({ code: 1, msg: 'success', data: toSubDto(sub) });
});

router.delete('/subscriptions/:id', authenticateToken, async (req: Request, res: Response) => {
  const uid = (req as any).user?.id;
  const id = Number(req.params.id);
  const sub = await UserSubscription.findOne({ where: { id, user_id: uid } as any });
  if (!sub) {
    res.status(404).json({ code: 0, msg: 'Not found' });
    return;
  }
  await (sub as any).destroy();
  res.json({ code: 1, msg: 'success' });
});

router.post('/activate', authenticateToken, async (req: Request, res: Response) => {
  try { await ensureSeedOnce(); } catch (e) {}
  const uid = (req as any).user?.id;
  const code = String(req.body?.code || '').trim();
  const city = String(req.body?.city || '').trim();
  const province = String(req.body?.province || '').trim();
  if (!code) {
    res.status(400).json({ code: 0, msg: 'Missing code' });
    return;
  }
  const row = await MemberActivationCode.findByPk(code);
  if (!row || !(row as any).is_active) {
    res.status(400).json({ code: 0, msg: 'Invalid code' });
    return;
  }
  const expiresAt = (row as any).expires_at ? new Date((row as any).expires_at).getTime() : 0;
  if (expiresAt && expiresAt < Date.now()) {
    res.status(400).json({ code: 0, msg: 'Code expired' });
    return;
  }
  const maxUses = Number((row as any).max_uses || 0);
  const usedCount = Number((row as any).used_count || 0);
  if (maxUses > 0 && usedCount >= maxUses) {
    res.status(400).json({ code: 0, msg: 'Code used up' });
    return;
  }
  const planCode = String((row as any).plan_code || 'country');
  const scopeMode = String((row as any).scope_mode || 'fixed');
  let scopeValue = String((row as any).scope_value || '');
  if (scopeMode === 'city') scopeValue = city;
  if (scopeMode === 'province') scopeValue = province;
  if (scopeMode === 'country') scopeValue = '全国';
  const durationDays = Number((row as any).duration_days || 365);
  const now = Date.now();
  const addMs = durationDays * 24 * 60 * 60 * 1000;
  const user = await User.findByPk(uid);
  if (!user) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const curExpireMs = normalizeVipExpireMs((user as any).vip_expire_at);
  const base = curExpireMs > now && String((user as any).vip_level || '') === planCode ? curExpireMs : now;
  await (user as any).update({ vip_level: planCode, vip_scope_value: scopeValue, vip_expire_at: base + addMs });
  await (row as any).update({ used_count: usedCount + 1 });
  await MemberOrder.create({
    order_no: makeOrderNo('ACT'),
    user_id: Number(uid),
    plan_code: planCode,
    scope_value: scopeValue,
    amount_yuan: '0.00',
    source: 'activation',
    status: 'fulfilled',
    paid_at: new Date(),
    fulfilled_at: new Date(),
    ext_json: JSON.stringify({ activationCode: code }),
  } as any);
  res.json({ code: 1, msg: 'success', data: normalizeVip(user as any) });
});

router.post('/trial/start', authenticateToken, async (req: Request, res: Response) => {
  try { await ensureSeedOnce(); } catch (e) {}
  const uid = Number((req as any).user?.id || 0);
  if (!uid) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const planCode = String(req.body?.planCode || '').trim();
  const scopeValue = String(req.body?.scopeValue || '').trim();
  if (!['city', 'province', 'country'].includes(planCode)) {
    res.status(400).json({ code: 0, msg: 'Invalid planCode' });
    return;
  }
  if (planCode !== 'country' && !scopeValue) {
    res.status(400).json({ code: 0, msg: 'scopeValue required' });
    return;
  }
  const duplicated = await MemberOrder.findOne({
    where: { user_id: uid, plan_code: planCode, source: 'trial', status: 'fulfilled' } as any,
    attributes: ['id'],
  }).catch(() => null as any);
  if (duplicated) {
    res.status(400).json({ code: 0, msg: '该会员档位仅可试用一次' });
    return;
  }
  const user = await User.findByPk(uid);
  if (!user) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const trialDays = Math.max(1, Number(process.env.MEMBER_TRIAL_DAYS || 30));
  const now = Date.now();
  const curExpireMs = normalizeVipExpireMs((user as any).vip_expire_at);
  const base = curExpireMs > now && String((user as any).vip_level || '') === planCode ? curExpireMs : now;
  const nextScope = planCode === 'country' ? '全国' : scopeValue;
  await (user as any).update({
    vip_level: planCode,
    vip_scope_value: nextScope,
    vip_expire_at: base + trialDays * 24 * 60 * 60 * 1000,
  });
  await MemberOrder.create({
    order_no: makeOrderNo('TRY'),
    user_id: Number(uid),
    plan_code: planCode,
    scope_value: nextScope,
    amount_yuan: '0.00',
    source: 'trial',
    status: 'fulfilled',
    paid_at: new Date(),
    fulfilled_at: new Date(),
    ext_json: JSON.stringify({ trial: true, trialDays }),
  } as any);
  res.json({ code: 1, msg: 'success', data: normalizeVip(user as any) });
});

router.post('/apple/verify', authenticateToken, async (req: Request, res: Response) => {
  try { await ensureSeedOnce(); } catch (e) {}
  const uid = Number((req as any).user?.id || 0);
  if (!uid) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const levelFromClient = String(req.body?.level || '').trim();
  const productId = String(req.body?.productId || '').trim();
  const txRaw = req.body?.transaction;
  if (!productId || !txRaw) {
    res.status(400).json({ code: 0, msg: 'Missing productId or transaction' });
    return;
  }
  const productPlanCode = findPlanCodeByAppleProductId(productId);
  if (!productPlanCode) {
    res.status(400).json({ code: 0, msg: '苹果内购商品未配置' });
    return;
  }
  if (levelFromClient && levelFromClient !== productPlanCode) {
    res.status(400).json({ code: 0, msg: '商品与会员等级不匹配' });
    return;
  }
  let tx: any = null;
  try {
    tx = typeof txRaw === 'string' ? JSON.parse(txRaw) : txRaw;
  } catch (e) {
    res.status(400).json({ code: 0, msg: 'Invalid transaction payload' });
    return;
  }
  const txId = String(tx?.transactionId || tx?.id || '').trim();
  const txProductId = String(tx?.productId || tx?.productID || '').trim();
  const appAccountToken = String(tx?.appAccountToken || '').trim();
  const expectedToken = makeStableAppAccountToken(uid);
  if (!txId) {
    res.status(400).json({ code: 0, msg: 'Missing transactionId' });
    return;
  }
  if (!txProductId || txProductId !== productId) {
    res.status(400).json({ code: 0, msg: 'Transaction product mismatch' });
    return;
  }
  if (appAccountToken && appAccountToken !== expectedToken) {
    res.status(400).json({ code: 0, msg: 'Transaction account token mismatch' });
    return;
  }
  const duplicated = await MemberOrder.findOne({ where: { payment_tx_no: txId } as any }).catch(() => null as any);
  if (duplicated) {
    const user = await User.findByPk(uid);
    if (!user) {
      res.status(401).json({ code: 0, msg: 'Unauthorized' });
      return;
    }
    res.json({ code: 1, msg: 'success', data: normalizeVip(user as any) });
    return;
  }
  const plan = await MemberPlan.findOne({ where: { code: productPlanCode } as any }).catch(() => null as any);
  const durationDays = plan ? Number((plan as any).duration_days || 365) : 365;
  const amountYuan = plan ? Number((plan as any).price_yuan || 0) : 0;
  const user = await User.findByPk(uid);
  if (!user) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const now = Date.now();
  const addMs = durationDays * 24 * 60 * 60 * 1000;
  const curExpireMs = normalizeVipExpireMs((user as any).vip_expire_at);
  const base = curExpireMs > now && String((user as any).vip_level || '') === productPlanCode ? curExpireMs : now;
  const nextScope = productPlanCode === 'country' ? '全国' : String(req.body?.scopeValue || '').trim();
  await (user as any).update({ vip_level: productPlanCode, vip_scope_value: nextScope, vip_expire_at: base + addMs });
  await MemberOrder.create({
    order_no: makeOrderNo('IOS'),
    user_id: Number(uid),
    plan_code: productPlanCode,
    scope_value: nextScope,
    amount_yuan: Number.isFinite(amountYuan) ? amountYuan.toFixed(2) : '0.00',
    source: 'ios_iap',
    payment_tx_no: txId,
    status: 'fulfilled',
    paid_at: new Date(),
    fulfilled_at: new Date(),
    ext_json: JSON.stringify({
      channel: 'apple_iap',
      productId,
      transactionId: txId,
      appAccountToken: appAccountToken || expectedToken,
      environment: String(tx?.environment || ''),
      purchaseDate: String(tx?.purchaseDate || ''),
      raw: tx,
    }),
  } as any);
  await settleFirstPurchaseReward(Number(uid), productPlanCode);
  res.json({ code: 1, msg: 'success', data: normalizeVip(user as any) });
});

router.post('/alipay/create', authenticateToken, async (req: Request, res: Response) => {
  try { await ensureSeedOnce(); } catch (e) {}
  const uid = Number((req as any).user?.id || 0);
  if (!uid) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const planCode = String(req.body?.planCode || '').trim();
  const scopeValue = String(req.body?.scopeValue || '').trim();
  if (!['city', 'province', 'country'].includes(planCode)) {
    res.status(400).json({ code: 0, msg: 'Invalid planCode' });
    return;
  }
  const plan = await MemberPlan.findOne({ where: { code: planCode } as any }).catch(() => null as any);
  const amountYuan = plan ? Number((plan as any).price_yuan || 0) : 0;
  if (!(Number.isFinite(amountYuan) && amountYuan > 0)) {
    res.status(400).json({ code: 0, msg: '套餐价格无效' });
    return;
  }
  const user = await User.findByPk(uid);
  if (!user) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const aliCfg = await readAlipayConfig();
  if (!aliCfg.appId || !aliCfg.privateKey || !aliCfg.alipayPublicKey) {
    res.status(500).json({ code: 0, msg: '支付宝配置缺失，请配置 ALIPAY_APP_ID / ALIPAY_PRIVATE_KEY / ALIPAY_PUBLIC_KEY' });
    return;
  }
  const alipay = createAlipayClient(aliCfg);
  const orderNo = makeOrderNo('ALI');
  const nextScope = planCode === 'country' ? '全国' : scopeValue;
  await MemberOrder.create({
    order_no: orderNo,
    user_id: Number(uid),
    plan_code: planCode,
    scope_value: nextScope,
    amount_yuan: amountYuan.toFixed(2),
    source: 'alipay',
    status: 'pending',
    ext_json: JSON.stringify({ channel: 'alipay', stage: 'created' }),
  } as any);
  const base = toHttpsBase(req);
  const notifyUrl = String(aliCfg.notifyUrl || `${base}/api/member/alipay/notify`).trim();
  const returnUrl = String(aliCfg.returnUrl || `${base}/#/member?payResult=alipay`).trim();
  const subject = `${String((plan as any)?.name || '').trim() || planCode}开通`;
  try {
    const payUrl = alipay.pageExec('alipay.trade.wap.pay', 'GET', {
      notifyUrl,
      returnUrl,
      bizContent: {
        outTradeNo: orderNo,
        productCode: 'QUICK_WAP_WAY',
        totalAmount: amountYuan.toFixed(2),
        subject,
      },
    });
    res.json({
      code: 1,
      msg: 'success',
      data: {
        orderNo,
        payUrl,
      },
    });
  } catch (e: any) {
    const errMsg = String(e?.message || '').trim();
    console.error('[alipay.create] failed:', errMsg);
    await MemberOrder.update({
      status: 'failed',
      ext_json: JSON.stringify({ channel: 'alipay', stage: 'create_failed', msg: errMsg }),
    } as any, { where: { order_no: orderNo } as any }).catch(() => null);
    res.status(500).json({ code: 0, msg: errMsg ? `支付宝下单失败：${errMsg}` : '支付宝下单失败' });
  }
});

router.post('/alipay/notify', async (req: Request, res: Response) => {
  try { await ensureSeedOnce(); } catch (e) {}
  const body: any = req.body || {};
  const outTradeNo = String(body?.out_trade_no || '').trim();
  if (!outTradeNo) {
    res.status(200).send('fail');
    return;
  }
  const aliCfg = await readAlipayConfig();
  if (!aliCfg.appId || !aliCfg.privateKey || !aliCfg.alipayPublicKey) {
    res.status(200).send('fail');
    return;
  }
  const alipay = createAlipayClient(aliCfg);
  const verified = alipay.checkNotifySignV2(body);
  if (!verified) {
    res.status(200).send('fail');
    return;
  }
  const order = await MemberOrder.findOne({ where: { order_no: outTradeNo } as any }).catch(() => null as any);
  if (!order) {
    res.status(200).send('success');
    return;
  }
  const tradeStatus = String(body?.trade_status || '').trim();
  const tradeNo = String(body?.trade_no || '').trim();
  const totalAmount = Number(body?.total_amount || 0);
  const orderAmount = Number((order as any).amount_yuan || 0);
  if (Number.isFinite(totalAmount) && Number.isFinite(orderAmount) && Math.abs(totalAmount - orderAmount) > 0.01) {
    await (order as any).update({
      status: 'failed',
      ext_json: JSON.stringify({ channel: 'alipay', stage: 'amount_mismatch', totalAmount, orderAmount }),
    });
    res.status(200).send('fail');
    return;
  }
  if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
    if (String((order as any).status || '') !== 'fulfilled') {
      const uid = Number((order as any).user_id || 0);
      const planCode = String((order as any).plan_code || '').trim();
      const scopeValue = String((order as any).scope_value || '').trim();
      const user = await applyPaidMemberOrder(uid, planCode, scopeValue);
      await (order as any).update({
        source: 'alipay',
        payment_tx_no: tradeNo || String((order as any).payment_tx_no || ''),
        status: 'fulfilled',
        paid_at: new Date(),
        fulfilled_at: new Date(),
        ext_json: JSON.stringify({ channel: 'alipay', stage: 'paid', tradeStatus, tradeNo }),
      });
      if (uid && planCode) await settleFirstPurchaseReward(uid, planCode);
      if (!user) {
        res.status(200).send('fail');
        return;
      }
    }
    res.status(200).send('success');
    return;
  }
  if (tradeStatus === 'TRADE_CLOSED') {
    await (order as any).update({
      status: 'failed',
      source: 'alipay',
      payment_tx_no: tradeNo || String((order as any).payment_tx_no || ''),
      ext_json: JSON.stringify({ channel: 'alipay', stage: 'closed', tradeStatus, tradeNo }),
    });
    res.status(200).send('success');
    return;
  }
  res.status(200).send('success');
});

router.post('/purchase', authenticateToken, async (req: Request, res: Response) => {
  try { await ensureSeedOnce(); } catch (e) {}
  const uid = (req as any).user?.id;
  const planCode = String(req.body?.planCode || '').trim();
  const scopeValue = String(req.body?.scopeValue || '').trim();
  const payMethod = String(req.body?.payMethod || 'mock').trim().toLowerCase();
  const methodMap: Record<string, string> = {
    wechat: 'wechat',
    alipay: 'alipay',
    bank_transfer: 'bank_transfer',
    mock: 'manual_mock',
  };
  const channel = methodMap[payMethod] || 'manual_mock';
  if (channel === 'alipay') {
    res.status(400).json({ code: 0, msg: '请使用支付宝下单接口' });
    return;
  }
  if (!['city', 'province', 'country'].includes(planCode)) {
    res.status(400).json({ code: 0, msg: 'Invalid planCode' });
    return;
  }
  const plan = await MemberPlan.findOne({ where: { code: planCode } as any }).catch(() => null as any);
  const durationDays = plan ? Number((plan as any).duration_days || 365) : 365;
  const amountYuan = plan ? Number((plan as any).price_yuan || 0) : 0;
  const now = Date.now();
  const addMs = durationDays * 24 * 60 * 60 * 1000;
  const user = await User.findByPk(uid);
  if (!user) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const curExpireMs = normalizeVipExpireMs((user as any).vip_expire_at);
  const base = curExpireMs > now && String((user as any).vip_level || '') === planCode ? curExpireMs : now;
  const nextScope = planCode === 'country' ? '全国' : scopeValue;
  await (user as any).update({ vip_level: planCode, vip_scope_value: nextScope, vip_expire_at: base + addMs });
  await MemberOrder.create({
    order_no: makeOrderNo('VIP'),
    user_id: Number(uid),
    plan_code: planCode,
    scope_value: nextScope,
    amount_yuan: Number.isFinite(amountYuan) ? amountYuan.toFixed(2) : '0.00',
    source: channel === 'manual_mock' ? 'purchase' : channel,
    status: 'fulfilled',
    paid_at: new Date(),
    fulfilled_at: new Date(),
    ext_json: JSON.stringify({ channel, payMethod: channel }),
  } as any);
  await settleFirstPurchaseReward(Number(uid), planCode);
  res.json({ code: 1, msg: 'success', data: normalizeVip(user as any) });
});

router.get('/orders', authenticateToken, async (req: Request, res: Response) => {
  const uid = Number((req as any).user?.id || 0);
  const page = Math.max(1, Number(req.query?.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query?.pageSize || 20)));
  const offset = (page - 1) * pageSize;
  const { rows, count } = await MemberOrder.findAndCountAll({
    where: { user_id: uid } as any,
    order: [['created_at', 'DESC']],
    limit: pageSize,
    offset,
  });
  res.json({
    code: 1,
    msg: 'success',
    data: {
      total: Number(count || 0),
      page,
      pageSize,
      rows: (rows || []).map((r: any) => ({
        id: Number(r.id),
        orderNo: String(r.order_no || ''),
        planCode: String(r.plan_code || ''),
        scopeValue: String(r.scope_value || ''),
        amountYuan: Number(r.amount_yuan || 0),
        source: String(r.source || ''),
        status: String(r.status || ''),
        extJson: (() => {
          try { return JSON.parse(String(r.ext_json || '{}')); } catch (e) { return {}; }
        })(),
        paidAt: r.paid_at ? new Date(r.paid_at).toISOString() : null,
        fulfilledAt: r.fulfilled_at ? new Date(r.fulfilled_at).toISOString() : null,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
      })),
    },
  });
});

router.get('/referral/me', authenticateToken, async (req: Request, res: Response) => {
  const uid = Number((req as any).user?.id || 0);
  const summary = await getReferralSummary(uid);
  if (!summary) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  res.json({
    code: 1,
    msg: 'success',
    data: {
      ...summary,
      inviteLink: buildInviteLink(req, summary.inviteCode),
    },
  });
});

router.get('/referral/records', authenticateToken, async (req: Request, res: Response) => {
  const uid = Number((req as any).user?.id || 0);
  const page = Number(req.query?.page || 1);
  const pageSize = Number(req.query?.pageSize || 20);
  const data = await listReferralRecords(uid, page, pageSize);
  res.json({ code: 1, msg: 'success', data });
});

router.post('/referral/bind', authenticateToken, async (req: Request, res: Response) => {
  const uid = Number((req as any).user?.id || 0);
  const inviteCode = normalizeInviteCode(String(req.body?.inviteCode || ''));
  if (!inviteCode) {
    res.status(400).json({ code: 0, msg: '邀请码无效' });
    return;
  }
  const ret = await bindInviterByCode(uid, inviteCode);
  if (!ret.ok) {
    res.status(400).json({ code: 0, msg: ret.msg || '绑定失败' });
    return;
  }
  res.json({ code: 1, msg: 'success' });
});

router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  const uid = (req as any).user?.id;
  const user = await User.findByPk(uid);
  if (!user) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const nickname = req.body?.nickname != null ? String(req.body.nickname) : null;
  const avatar = req.body?.avatar != null ? String(req.body.avatar) : null;
  const companyName = req.body?.companyName != null ? trimText(req.body.companyName) : (req.body?.company_name != null ? trimText(req.body.company_name) : null);
  const realName = req.body?.realName != null ? trimText(req.body.realName) : (req.body?.real_name != null ? trimText(req.body.real_name) : null);
  const positionTitle = req.body?.positionTitle != null ? trimText(req.body.positionTitle) : (req.body?.position_title != null ? trimText(req.body.position_title) : null);
  const phone = req.body?.phone != null ? trimText(req.body.phone) : null;
  const email = req.body?.email != null ? trimText(req.body.email) : null;
  const wechatId = req.body?.wechatId != null ? trimText(req.body.wechatId) : (req.body?.wechat_id != null ? trimText(req.body.wechat_id) : null);
  const patch: any = {};
  if (nickname != null) patch.nickname = nickname;
  if (avatar != null) patch.avatar = avatar;
  if (companyName != null) patch.company_name = companyName;
  if (realName != null) patch.real_name = realName;
  if (positionTitle != null) patch.position_title = positionTitle;
  if (phone != null) patch.phone = phone || null;
  if (email != null) patch.email = email;
  if (wechatId != null) patch.wechat_id = wechatId || null;
  if (phone != null && phone && !/^1\d{10}$/.test(phone)) {
    res.status(400).json({ code: 0, msg: '手机号格式不正确' });
    return;
  }
  if (email != null && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ code: 0, msg: '邮箱格式不正确' });
    return;
  }
  await (user as any).update(patch);
  const reward = await applyProfileRewardIfNeeded(user as any);
  const profileCompletion = buildProfileCompletion(user as any);
  res.json({
    code: 1,
    msg: reward.granted ? reward.msg : 'success',
    data: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar || '',
      phone: (user as any).phone || '',
      email: (user as any).email || '',
      company_name: (user as any).company_name || '',
      real_name: (user as any).real_name || '',
      position_title: (user as any).position_title || '',
      wechat_id: (user as any).wechat_id || '',
      ...normalizeVip(user as any),
      profileCompletion,
      profileRewardGrantedAt: (user as any).profile_reward_granted_at ? new Date((user as any).profile_reward_granted_at).toISOString() : null,
      rewardGrantedNow: !!reward.granted,
      rewardReason: String((reward as any).reason || ''),
    },
  });
});

router.post('/profile/reward', authenticateToken, async (req: Request, res: Response) => {
  const uid = (req as any).user?.id;
  const user = await User.findByPk(uid);
  if (!user) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const reward = await applyProfileRewardIfNeeded(user as any);
  const profileCompletion = buildProfileCompletion(user as any);
  const vip = normalizeVip(user as any);
  res.json({
    code: 1,
    msg: reward.granted ? reward.msg : 'success',
    data: {
      ...vip,
      profileCompletion,
      profileRewardGrantedAt: (user as any).profile_reward_granted_at ? new Date((user as any).profile_reward_granted_at).toISOString() : null,
      rewardGrantedNow: !!reward.granted,
      rewardReason: String((reward as any).reason || ''),
    },
  });
});

router.put('/usage', authenticateToken, async (req: Request, res: Response) => {
  const uid = (req as any).user?.id;
  const user = await User.findByPk(uid);
  if (!user) {
    res.status(401).json({ code: 0, msg: 'Unauthorized' });
    return;
  }
  const viewUsage = req.body?.viewUsage != null ? Number(req.body.viewUsage) : null;
  const viewHistory = req.body?.viewHistory != null ? req.body.viewHistory : null;
  const patch: any = {};
  if (viewUsage != null && !Number.isNaN(viewUsage) && viewUsage >= 0) patch.view_usage = Math.floor(viewUsage);
  if (viewHistory != null) {
    try {
      const arr = Array.isArray(viewHistory) ? viewHistory : JSON.parse(String(viewHistory));
      if (Array.isArray(arr)) patch.view_history_json = JSON.stringify(arr.slice(-2000));
    } catch (e) {}
  }
  await (user as any).update(patch);
  res.json({ code: 1, msg: 'success' });
});

export default router;
