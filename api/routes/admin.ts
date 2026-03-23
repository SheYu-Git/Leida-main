import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { authenticateToken } from '../middleware/auth.js';
import { hasAdminPermission, requireAdminPermission, requireAdminPinVerified, requireAdminRole, requireSuperAdmin, signAdminPinToken } from '../middleware/admin.js';
import { getAllUsers, deleteUser } from '../controllers/admin/userController.js';
import { getAllPosts, deletePost } from '../controllers/admin/postController.js';
import { getDashboardStats } from '../controllers/admin/dashboardController.js';
import { runBiddingSyncRecentDays } from '../services/biddingSync.js';
import User from '../models/User.js';
import MemberPlan from '../models/MemberPlan.js';
import AdminAuditLog from '../models/AdminAuditLog.js';
import MemberActivationCode from '../models/MemberActivationCode.js';
import ReferralRecord from '../models/ReferralRecord.js';
import MemberOrder from '../models/MemberOrder.js';
import BiddingItem from '../models/BiddingItem.js';
import BiddingDailyStat from '../models/BiddingDailyStat.js';
import { listConfigs, listConfigVersions, publishConfig, rollbackConfig, saveDraftConfig } from '../services/configService.js';
import { getCstDayKey, getCstStartOfDayMs } from '../services/cachePage.js';
import { normalizeVipExpireMs, toVipExpireDate } from '../services/vipExpire.js';

const router = Router();

router.use(authenticateToken, requireAdminRole);

const ALL_ADMIN_PERMISSIONS = [
  'member.read',
  'member.write',
  'order.read',
  'order.write',
  'code.read',
  'code.write',
  'reward.read',
  'reward.write',
  'info.read',
  'audit.read',
  'admin.read',
  'admin.write',
];

const normalizeAdminPermissions = (input: any) => {
  const rows = Array.isArray(input) ? input : [];
  const set = new Set(
    rows
      .map((x) => String(x || '').trim())
      .filter(Boolean)
      .filter((x) => ALL_ADMIN_PERMISSIONS.includes(x) || x.endsWith('.*') || x === '*')
  );
  return Array.from(set);
};

const makeCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `VIP-${s}`;
};

const makeOrderNo = (prefix: string) => {
  const ts = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}${ts}${rand}`;
};

const streamCsv = (res: any, filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>) => {
  const esc = (v: any) => {
    const s = String(v == null ? '' : v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.write('\uFEFF');
  res.write(headers.map(esc).join(',') + '\n');
  (rows || []).forEach((r) => {
    res.write((r || []).map(esc).join(',') + '\n');
  });
  res.end();
};

router.get('/me', async (req, res) => {
  const user = (req as any).adminUser;
  let customPerms: string[] = [];
  try {
    customPerms = normalizeAdminPermissions((user as any).admin_permissions_json ? JSON.parse(String((user as any).admin_permissions_json || '[]')) : []);
  } catch (e) {}
  const effectivePerms = ALL_ADMIN_PERMISSIONS.filter((p) => hasAdminPermission(user, p));
  res.json({
    code: 1,
    msg: 'success',
    data: {
      id: Number((user as any).id || 0),
      username: String((user as any).username || ''),
      role: String((user as any).role || 'user'),
      requiresPin: String((user as any).role || '') === 'superadmin',
      customPermissions: customPerms,
      effectivePermissions: effectivePerms,
    },
  });
});

router.post('/pin/verify', requireSuperAdmin, async (req, res) => {
  const pin = String(req.body?.pin || '');
  if (!pin) {
    res.status(400).json({ code: 0, msg: '请输入PIN码' });
    return;
  }
  const user = (req as any).adminUser as any;
  const pinHash = String(user.admin_pin_hash || '');
  const ok = pinHash ? await bcrypt.compare(pin, pinHash) : false;
  if (!ok) {
    res.status(400).json({ code: 0, msg: 'PIN码错误' });
    return;
  }
  const pinToken = signAdminPinToken(Number(user.id));
  res.json({ code: 1, msg: 'success', data: { pinToken } });
});

router.post('/pin/change', requireSuperAdmin, requireAdminPinVerified, async (req, res) => {
  const oldPin = String(req.body?.oldPin || '');
  const newPin = String(req.body?.newPin || '');
  if (!/^\d{6}$/.test(newPin)) {
    res.status(400).json({ code: 0, msg: 'PIN码必须为6位数字' });
    return;
  }
  const user = (req as any).adminUser as any;
  const pinHash = String(user.admin_pin_hash || '');
  const oldOk = pinHash ? await bcrypt.compare(oldPin, pinHash) : false;
  if (!oldOk) {
    res.status(400).json({ code: 0, msg: '原PIN码错误' });
    return;
  }
  const newHash = await bcrypt.hash(newPin, 10);
  await user.update({ admin_pin_hash: newHash, admin_pin_updated_at: new Date() });
  await AdminAuditLog.create({
    admin_user_id: Number(user.id),
    module: 'admin',
    action: 'pin_change',
    target_key: 'admin_pin',
    before_json: '{}',
    after_json: '{}',
  } as any);
  res.json({ code: 1, msg: 'success' });
});

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Posts
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePost);

router.post('/bidding/sync15d', requireAdminPinVerified, async (req, res) => {
  await runBiddingSyncRecentDays(15);
  res.json({ success: true });
});

router.get('/info/latest', requireAdminPermission('info.read'), async (req, res) => {
  const page = Math.max(1, Number(req.query?.page || 1));
  const pageSize = Math.min(50, Math.max(1, Number(req.query?.pageSize || 20)));
  const offset = (page - 1) * pageSize;
  const { rows, count } = await BiddingItem.findAndCountAll({
    attributes: ['id', 'title', 'city', 'types', 'datetime', 'datetime_ts', 'bid_price', 'bid_price_yuan', 'created_at'],
    order: [['created_at', 'DESC'], ['id', 'DESC']],
    offset,
    limit: pageSize,
  } as any);
  const dataRows = (rows || []).map((x: any) => {
    const createdAt = x.created_at ? new Date(x.created_at) : null;
    const writeAtMinute = createdAt ? createdAt.toISOString().replace('T', ' ').slice(0, 16) : '';
    return {
      id: Number(x.id || 0),
      title: String(x.title || ''),
      city: String(x.city || ''),
      types: String(x.types || ''),
      datetime: String(x.datetime || ''),
      datetimeTs: Number(x.datetime_ts || 0),
      bidPrice: String(x.bid_price || ''),
      bidPriceYuan: Number(x.bid_price_yuan || 0),
      createdAt: createdAt ? createdAt.toISOString() : null,
      writeAtMinute,
    };
  });
  res.json({
    code: 1,
    msg: 'success',
    data: {
      total: Number(count || 0),
      page,
      pageSize,
      rows: dataRows,
    },
  });
});

router.get('/info/overview', requireAdminPermission('info.read'), async (req, res) => {
  const now = Date.now();
  const startOfToday = getCstStartOfDayMs(now);
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const yesterdayKey = getCstDayKey(startOfYesterday);
  const whereYesterday: any = { datetime_ts: { [Op.gte]: startOfYesterday, [Op.lt]: startOfToday } };
  const yesterdayCount = await BiddingItem.count({ where: whereYesterday });
  const yesterdaySumRow: any = await BiddingItem.findOne({
    attributes: [[(BiddingItem as any).sequelize.fn('SUM', (BiddingItem as any).sequelize.col('bid_price_yuan')), 'sumYuan']],
    where: whereYesterday,
    raw: true,
  });
  const yesterdayYuan = Number((yesterdaySumRow && yesterdaySumRow.sumYuan) || 0);
  const yesterdayYi = (yesterdayYuan / 100000000).toFixed(2);
  await BiddingDailyStat.upsert({
    date_key: yesterdayKey,
    scope_type: 'country',
    scope_value: '',
    count: Number(yesterdayCount || 0),
    total_yuan: yesterdayYuan,
    total_yi: yesterdayYi,
  } as any);

  const whereTotal: any = { datetime_ts: { [Op.lt]: startOfToday } };
  const totalCount = await BiddingItem.count({ where: whereTotal });
  const totalSumRow: any = await BiddingItem.findOne({
    attributes: [[(BiddingItem as any).sequelize.fn('SUM', (BiddingItem as any).sequelize.col('bid_price_yuan')), 'sumYuan']],
    where: whereTotal,
    raw: true,
  });
  const totalYuan = Number((totalSumRow && totalSumRow.sumYuan) || 0);
  const totalYi = (totalYuan / 100000000).toFixed(2);
  const stat = await BiddingDailyStat.findOne({ where: { date_key: yesterdayKey, scope_type: 'country', scope_value: '' } as any });

  res.json({
    code: 1,
    msg: 'success',
    data: {
      yesterday: {
        date: yesterdayKey,
        count: Number((stat as any)?.count || yesterdayCount || 0),
        totalYuan: Number((stat as any)?.total_yuan || yesterdayYuan || 0),
        totalYi: String((stat as any)?.total_yi || yesterdayYi || '0.00'),
      },
      totalUntilYesterday: {
        count: Number(totalCount || 0),
        totalYuan,
        totalYi,
      },
    },
  });
});

router.get('/configs', requireAdminPinVerified, async (req, res) => {
  const data = await listConfigs();
  res.json({ code: 1, msg: 'success', data });
});

router.put('/configs/:key/draft', requireAdminPinVerified, async (req, res) => {
  const key = String(req.params.key || '');
  const draftValue = req.body?.value ?? {};
  try {
    const data = await saveDraftConfig({
      key,
      draftValue,
      adminUserId: Number((req as any).adminUser?.id || 0),
    });
    res.json({ code: 1, msg: 'success', data });
  } catch (e: any) {
    res.status(400).json({ code: 0, msg: String(e?.message || '保存失败') });
  }
});

router.post('/configs/:key/publish', requireAdminPinVerified, async (req, res) => {
  const key = String(req.params.key || '');
  try {
    const data = await publishConfig({
      key,
      adminUserId: Number((req as any).adminUser?.id || 0),
    });
    res.json({ code: 1, msg: 'success', data });
  } catch (e: any) {
    res.status(400).json({ code: 0, msg: String(e?.message || '发布失败') });
  }
});

router.get('/configs/:key/versions', requireAdminPinVerified, async (req, res) => {
  const key = String(req.params.key || '');
  const data = await listConfigVersions(key);
  res.json({ code: 1, msg: 'success', data });
});

router.post('/configs/:key/rollback', requireAdminPinVerified, async (req, res) => {
  const key = String(req.params.key || '');
  const toVersion = Number(req.body?.toVersion || 0);
  try {
    const data = await rollbackConfig({
      key,
      toVersion,
      adminUserId: Number((req as any).adminUser?.id || 0),
    });
    res.json({ code: 1, msg: 'success', data });
  } catch (e: any) {
    res.status(400).json({ code: 0, msg: String(e?.message || '回滚失败') });
  }
});

router.get('/member-plans', requireAdminPinVerified, async (req, res) => {
  const rows = await MemberPlan.findAll({ order: [['id', 'ASC']] });
  res.json({
    code: 1,
    msg: 'success',
    data: (rows || []).map((row: any) => ({
      code: String(row.code),
      name: String(row.name || ''),
      priceYuan: Number(row.price_yuan || 0),
      durationDays: Number(row.duration_days || 365),
      isActive: !!row.is_active,
      entitlements: (() => {
        try { return JSON.parse(String(row.entitlements_json || '{}')); } catch (e) { return {}; }
      })(),
    })),
  });
});

router.put('/member-plans/:code', requireAdminPinVerified, async (req, res) => {
  const code = String(req.params.code || '');
  const row = await MemberPlan.findOne({ where: { code } as any });
  if (!row) {
    res.status(404).json({ code: 0, msg: '会员方案不存在' });
    return;
  }
  const before = {
    priceYuan: Number((row as any).price_yuan || 0),
    durationDays: Number((row as any).duration_days || 365),
    isActive: !!(row as any).is_active,
    entitlements: (() => {
      try { return JSON.parse(String((row as any).entitlements_json || '{}')); } catch (e) { return {}; }
    })(),
  };
  const patch: any = {};
  if (req.body?.priceYuan != null) patch.price_yuan = Number(req.body.priceYuan || 0);
  if (req.body?.durationDays != null) patch.duration_days = Number(req.body.durationDays || 365);
  if (req.body?.isActive != null) patch.is_active = !!req.body.isActive;
  if (req.body?.entitlements != null) patch.entitlements_json = JSON.stringify(req.body.entitlements || {});
  await (row as any).update(patch);
  const after = {
    priceYuan: Number((row as any).price_yuan || 0),
    durationDays: Number((row as any).duration_days || 365),
    isActive: !!(row as any).is_active,
    entitlements: (() => {
      try { return JSON.parse(String((row as any).entitlements_json || '{}')); } catch (e) { return {}; }
    })(),
  };
  await AdminAuditLog.create({
    admin_user_id: Number((req as any).adminUser?.id || 0),
    module: 'member_plan',
    action: 'update',
    target_key: code,
    before_json: JSON.stringify(before),
    after_json: JSON.stringify(after),
  } as any);
  res.json({ code: 1, msg: 'success', data: after });
});

router.get('/audit-logs', requireAdminPinVerified, async (req, res) => {
  const rows = await AdminAuditLog.findAll({ order: [['created_at', 'DESC']], limit: 100 });
  res.json({
    code: 1,
    msg: 'success',
    data: (rows || []).map((row: any) => ({
      id: Number(row.id),
      adminUserId: Number(row.admin_user_id || 0),
      module: String(row.module || ''),
      action: String(row.action || ''),
      targetKey: String(row.target_key || ''),
      before: (() => {
        try { return JSON.parse(String(row.before_json || '{}')); } catch (e) { return {}; }
      })(),
      after: (() => {
        try { return JSON.parse(String(row.after_json || '{}')); } catch (e) { return {}; }
      })(),
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    })),
  });
});

router.get('/auth/permissions', requireAdminPermission('admin.read'), async (req, res) => {
  const rows = await User.findAll({
    where: { role: { [Op.in]: ['admin', 'superadmin', 'ops_admin', 'order_admin', 'finance_admin', 'support_admin', 'auditor'] } as any },
    attributes: ['id', 'username', 'nickname', 'role', 'admin_permissions_json', 'created_at'],
    order: [['id', 'DESC']],
    limit: 200,
  } as any);
  res.json({
    code: 1,
    msg: 'success',
    data: (rows || []).map((u: any) => ({
      id: Number(u.id),
      username: String(u.username || ''),
      nickname: String(u.nickname || ''),
      role: String(u.role || ''),
      customPermissions: normalizeAdminPermissions((() => {
        try { return JSON.parse(String(u.admin_permissions_json || '[]')); } catch (e) { return []; }
      })()),
      effectivePermissions: ALL_ADMIN_PERMISSIONS.filter((p) => hasAdminPermission(u, p)),
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : null,
    })),
  });
});

router.post('/auth/grant', requireSuperAdmin, requireAdminPinVerified, requireAdminPermission('admin.write'), async (req, res) => {
  const userId = Number(req.body?.userId || 0);
  const role = String(req.body?.role || '').trim();
  const allowedRoles = new Set(['admin', 'ops_admin', 'order_admin', 'finance_admin', 'support_admin', 'auditor', 'superadmin']);
  if (!userId || !allowedRoles.has(role)) {
    res.status(400).json({ code: 0, msg: '参数无效' });
    return;
  }
  const target = await User.findByPk(userId);
  if (!target) {
    res.status(404).json({ code: 0, msg: '用户不存在' });
    return;
  }
  const perms = normalizeAdminPermissions(req.body?.permissions);
  const before = { role: String((target as any).role || ''), permissions: String((target as any).admin_permissions_json || '[]') };
  await (target as any).update({ role, admin_permissions_json: JSON.stringify(perms) });
  await AdminAuditLog.create({
    admin_user_id: Number((req as any).adminUser?.id || 0),
    module: 'admin_auth',
    action: 'grant',
    target_key: String(userId),
    before_json: JSON.stringify(before),
    after_json: JSON.stringify({ role, permissions: perms }),
  } as any);
  res.json({ code: 1, msg: 'success' });
});

router.get('/members', requireAdminPermission('member.read'), async (req, res) => {
  const page = Math.max(1, Number(req.query?.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query?.pageSize || 20)));
  const keyword = String(req.query?.keyword || '').trim();
  const where: any = {};
  if (keyword) {
    where[Op.or] = [
      { username: { [Op.like]: `%${keyword}%` } },
      { nickname: { [Op.like]: `%${keyword}%` } },
      { invite_code: { [Op.like]: `%${keyword}%` } },
    ];
  }
  const { rows, count } = await User.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  } as any);
  res.json({
    code: 1,
    msg: 'success',
    data: {
      total: Number(count || 0),
      page,
      pageSize,
      rows: (rows || []).map((u: any) => ({
        id: Number(u.id),
        username: String(u.username || ''),
        nickname: String(u.nickname || ''),
        role: String(u.role || 'user'),
        vipLevel: String(u.vip_level || 'free'),
        vipScopeValue: String(u.vip_scope_value || ''),
        vipExpireAt: (() => {
          const d = toVipExpireDate(u.vip_expire_at);
          return d ? d.toISOString() : null;
        })(),
        balanceYuan: Number(u.balance_yuan || 0),
        inviteCode: String(u.invite_code || ''),
        invitedByUserId: Number(u.invited_by_user_id || 0),
        inviteRewardTotalYuan: Number(u.invite_reward_total_yuan || 0),
      })),
    },
  });
});

router.post('/members/:id/vip/grant', requireAdminPinVerified, requireAdminPermission('member.write'), async (req, res) => {
  const userId = Number(req.params.id || 0);
  const planCode = String(req.body?.planCode || '').trim();
  const durationDays = Math.min(36500, Math.max(1, Number(req.body?.durationDays || 365)));
  const scopeValueRaw = String(req.body?.scopeValue || '').trim();
  if (!userId || !['city', 'province', 'country', 'free'].includes(planCode)) {
    res.status(400).json({ code: 0, msg: '参数无效' });
    return;
  }
  const user = await User.findByPk(userId);
  if (!user) {
    res.status(404).json({ code: 0, msg: '用户不存在' });
    return;
  }
  const before = {
    vipLevel: String((user as any).vip_level || 'free'),
    vipScopeValue: String((user as any).vip_scope_value || ''),
    vipExpireAt: (() => {
      const d = toVipExpireDate((user as any).vip_expire_at);
      return d ? d.toISOString() : null;
    })(),
  };
  const now = Date.now();
  const cur = normalizeVipExpireMs((user as any).vip_expire_at);
  const base = cur > now ? cur : now;
  const nextExpireMs = planCode === 'free' ? 0 : (base + durationDays * 86400000);
  const nextScope = planCode === 'country' ? '全国' : scopeValueRaw;
  await (user as any).update({ vip_level: planCode, vip_scope_value: nextScope, vip_expire_at: nextExpireMs });
  await MemberOrder.create({
    order_no: makeOrderNo('ADM'),
    user_id: userId,
    plan_code: planCode,
    scope_value: nextScope,
    amount_yuan: '0.00',
    source: 'admin_grant',
    status: 'fulfilled',
    paid_at: new Date(),
    fulfilled_at: new Date(),
    ext_json: JSON.stringify({ durationDays, byAdmin: Number((req as any).adminUser?.id || 0) }),
  } as any);
  await AdminAuditLog.create({
    admin_user_id: Number((req as any).adminUser?.id || 0),
    module: 'member',
    action: 'grant_vip',
    target_key: String(userId),
    before_json: JSON.stringify(before),
    after_json: JSON.stringify({ planCode, scopeValue: nextScope, vipExpireAt: nextExpire ? nextExpire.toISOString() : null }),
  } as any);
  res.json({ code: 1, msg: 'success' });
});

router.get('/orders', requireAdminPermission('order.read'), async (req, res) => {
  const page = Math.max(1, Number(req.query?.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query?.pageSize || 20)));
  const status = String(req.query?.status || '').trim();
  const userId = Number(req.query?.userId || 0);
  const keyword = String(req.query?.keyword || '').trim();
  const startDate = String(req.query?.startDate || '').trim();
  const endDate = String(req.query?.endDate || '').trim();
  const exportCsv = String(req.query?.export || '') === '1';
  const where: any = {};
  if (status) where.status = status;
  if (userId > 0) where.user_id = userId;
  if (keyword) {
    where[Op.or] = [
      { order_no: { [Op.like]: `%${keyword}%` } },
      { plan_code: { [Op.like]: `%${keyword}%` } },
    ];
  }
  if (startDate || endDate) {
    const range: any = {};
    if (startDate) {
      const d = new Date(`${startDate}T00:00:00.000Z`);
      if (!Number.isNaN(d.getTime())) range[Op.gte] = d;
    }
    if (endDate) {
      const d = new Date(`${endDate}T23:59:59.999Z`);
      if (!Number.isNaN(d.getTime())) range[Op.lte] = d;
    }
    if (Object.keys(range).length) where.created_at = range;
  }
  const queryOpts: any = { where, order: [['created_at', 'DESC']] };
  if (!exportCsv) {
    queryOpts.limit = pageSize;
    queryOpts.offset = (page - 1) * pageSize;
  }
  const rows = exportCsv
    ? await MemberOrder.findAll(queryOpts)
    : await MemberOrder.findAll(queryOpts);
  const count = exportCsv ? rows.length : await MemberOrder.count({ where });
  if (exportCsv) {
    streamCsv(res, 'orders.csv', ['id', 'order_no', 'user_id', 'plan_code', 'amount_yuan', 'status', 'source', 'created_at'], (rows || []).map((r: any) => [
        Number(r.id || 0),
        String(r.order_no || ''),
        Number(r.user_id || 0),
        String(r.plan_code || ''),
        Number(r.amount_yuan || 0).toFixed(2),
        String(r.status || ''),
        String(r.source || ''),
        r.created_at ? new Date(r.created_at).toISOString() : '',
      ]));
    return;
  }
  res.json({ code: 1, msg: 'success', data: { total: Number(count || 0), page, pageSize, rows } });
});

router.post('/orders/:id/status', requireAdminPinVerified, requireAdminPermission('order.write'), async (req, res) => {
  const id = Number(req.params.id || 0);
  const status = String(req.body?.status || '').trim();
  if (!id || !['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'].includes(status)) {
    res.status(400).json({ code: 0, msg: '参数无效' });
    return;
  }
  const row = await MemberOrder.findByPk(id);
  if (!row) {
    res.status(404).json({ code: 0, msg: '订单不存在' });
    return;
  }
  const before = { status: String((row as any).status || '') };
  const patch: any = { status };
  if (status === 'paid' && !(row as any).paid_at) patch.paid_at = new Date();
  if (status === 'fulfilled' && !(row as any).fulfilled_at) patch.fulfilled_at = new Date();
  await (row as any).update(patch);
  await AdminAuditLog.create({
    admin_user_id: Number((req as any).adminUser?.id || 0),
    module: 'order',
    action: 'status_update',
    target_key: String(id),
    before_json: JSON.stringify(before),
    after_json: JSON.stringify({ status }),
  } as any);
  res.json({ code: 1, msg: 'success' });
});

router.post('/orders/batch-status', requireAdminPinVerified, requireAdminPermission('order.write'), async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map((x: any) => Number(x || 0)).filter((x: number) => x > 0) : [];
  const status = String(req.body?.status || '').trim();
  if (!ids.length || !['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'].includes(status)) {
    res.status(400).json({ code: 0, msg: '参数无效' });
    return;
  }
  const [affected] = await MemberOrder.update({ status } as any, { where: { id: { [Op.in]: ids } as any } as any });
  await AdminAuditLog.create({
    admin_user_id: Number((req as any).adminUser?.id || 0),
    module: 'order',
    action: 'batch_status_update',
    target_key: `${ids.length}`,
    before_json: '{}',
    after_json: JSON.stringify({ status, ids }),
  } as any);
  res.json({ code: 1, msg: 'success', data: { affected: Number(affected || 0) } });
});

router.get('/activation-codes', requireAdminPermission('code.read'), async (req, res) => {
  const page = Math.max(1, Number(req.query?.page || 1));
  const pageSize = Math.min(200, Math.max(1, Number(req.query?.pageSize || 30)));
  const isActiveRaw = String(req.query?.isActive || '').trim();
  const planCode = String(req.query?.planCode || '').trim();
  const keyword = String(req.query?.keyword || '').trim();
  const exportCsv = String(req.query?.export || '') === '1';
  const where: any = {};
  if (isActiveRaw === '1' || isActiveRaw === 'true') where.is_active = true;
  if (isActiveRaw === '0' || isActiveRaw === 'false') where.is_active = false;
  if (planCode) where.plan_code = planCode;
  if (keyword) where.code = { [Op.like]: `%${keyword}%` };
  const queryOpts: any = { where, order: [['created_at', 'DESC']] };
  if (!exportCsv) {
    queryOpts.limit = pageSize;
    queryOpts.offset = (page - 1) * pageSize;
  }
  const rows = await MemberActivationCode.findAll(queryOpts);
  const count = exportCsv ? rows.length : await MemberActivationCode.count({ where });
  if (exportCsv) {
    streamCsv(res, 'activation_codes.csv', ['code', 'plan_code', 'scope_mode', 'scope_value', 'duration_days', 'max_uses', 'used_count', 'is_active', 'expires_at', 'created_at'], (rows || []).map((r: any) => [
        String(r.code || ''),
        String(r.plan_code || ''),
        String(r.scope_mode || ''),
        String(r.scope_value || ''),
        Number(r.duration_days || 0),
        Number(r.max_uses || 0),
        Number(r.used_count || 0),
        !!r.is_active ? '1' : '0',
        r.expires_at ? new Date(r.expires_at).toISOString() : '',
        r.created_at ? new Date(r.created_at).toISOString() : '',
      ]));
    return;
  }
  res.json({ code: 1, msg: 'success', data: { total: Number(count || 0), page, pageSize, rows } });
});

router.post('/activation-codes/batch-generate', requireAdminPinVerified, requireAdminPermission('code.write'), async (req, res) => {
  const count = Math.min(500, Math.max(1, Number(req.body?.count || 1)));
  const planCode = String(req.body?.planCode || 'country');
  const scopeMode = String(req.body?.scopeMode || 'fixed');
  const scopeValue = String(req.body?.scopeValue || '');
  const durationDays = Math.max(1, Number(req.body?.durationDays || 365));
  const maxUses = Math.max(0, Number(req.body?.maxUses || 1));
  const expiresAt = req.body?.expiresAt ? new Date(String(req.body.expiresAt)) : null;
  if (!['city', 'province', 'country'].includes(planCode)) {
    res.status(400).json({ code: 0, msg: 'planCode无效' });
    return;
  }
  const created: string[] = [];
  for (let i = 0; i < count; i++) {
    let code = makeCode();
    while (await MemberActivationCode.findByPk(code)) code = makeCode();
    await MemberActivationCode.create({
      code,
      plan_code: planCode as any,
      scope_mode: scopeMode as any,
      scope_value: scopeValue,
      duration_days: durationDays,
      max_uses: maxUses,
      used_count: 0,
      is_active: true,
      expires_at: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
    } as any);
    created.push(code);
  }
  await AdminAuditLog.create({
    admin_user_id: Number((req as any).adminUser?.id || 0),
    module: 'activation_code',
    action: 'batch_generate',
    target_key: planCode,
    before_json: '{}',
    after_json: JSON.stringify({ count, scopeMode, durationDays, maxUses }),
  } as any);
  res.json({ code: 1, msg: 'success', data: { codes: created } });
});

router.post('/activation-codes/:code/toggle', requireAdminPinVerified, requireAdminPermission('code.write'), async (req, res) => {
  const code = String(req.params.code || '');
  const row = await MemberActivationCode.findByPk(code);
  if (!row) {
    res.status(404).json({ code: 0, msg: '激活码不存在' });
    return;
  }
  const isActive = req.body?.isActive != null ? !!req.body.isActive : !(row as any).is_active;
  await (row as any).update({ is_active: isActive });
  await AdminAuditLog.create({
    admin_user_id: Number((req as any).adminUser?.id || 0),
    module: 'activation_code',
    action: 'toggle',
    target_key: code,
    before_json: JSON.stringify({ isActive: !(isActive) }),
    after_json: JSON.stringify({ isActive }),
  } as any);
  res.json({ code: 1, msg: 'success' });
});

router.post('/activation-codes/batch-toggle', requireAdminPinVerified, requireAdminPermission('code.write'), async (req, res) => {
  const codes = Array.isArray(req.body?.codes) ? req.body.codes.map((x: any) => String(x || '').trim()).filter(Boolean) : [];
  const isActive = !!req.body?.isActive;
  if (!codes.length) {
    res.status(400).json({ code: 0, msg: '缺少codes' });
    return;
  }
  const [affected] = await MemberActivationCode.update({ is_active: isActive } as any, { where: { code: { [Op.in]: codes } as any } as any });
  await AdminAuditLog.create({
    admin_user_id: Number((req as any).adminUser?.id || 0),
    module: 'activation_code',
    action: 'batch_toggle',
    target_key: String(codes.length),
    before_json: '{}',
    after_json: JSON.stringify({ isActive, codes }),
  } as any);
  res.json({ code: 1, msg: 'success', data: { affected: Number(affected || 0) } });
});

router.get('/rewards/summary', requireAdminPermission('reward.read'), async (req, res) => {
  const rows = await ReferralRecord.findAll({
    attributes: ['status', [MemberOrder.sequelize!.fn('COUNT', MemberOrder.sequelize!.col('id')), 'count'], [MemberOrder.sequelize!.fn('SUM', MemberOrder.sequelize!.col('reward_yuan')), 'amount']],
    group: ['status'],
  } as any);
  const data = { grantedCount: 0, grantedAmount: 0, rejectedCount: 0, rejectedAmount: 0 };
  (rows || []).forEach((r: any) => {
    const status = String(r.status || '');
    if (status === 'granted') {
      data.grantedCount = Number((r as any).dataValues?.count || 0);
      data.grantedAmount = Number((r as any).dataValues?.amount || 0);
    } else if (status === 'rejected') {
      data.rejectedCount = Number((r as any).dataValues?.count || 0);
      data.rejectedAmount = Number((r as any).dataValues?.amount || 0);
    }
  });
  res.json({ code: 1, msg: 'success', data });
});

router.get('/rewards/records', requireAdminPermission('reward.read'), async (req, res) => {
  const page = Math.max(1, Number(req.query?.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query?.pageSize || 30)));
  const status = String(req.query?.status || '').trim();
  const exportCsv = String(req.query?.export || '') === '1';
  const where: any = {};
  if (status) where.status = status;
  const queryOpts: any = { where, order: [['created_at', 'DESC']] };
  if (!exportCsv) {
    queryOpts.limit = pageSize;
    queryOpts.offset = (page - 1) * pageSize;
  }
  const list = await ReferralRecord.findAll(queryOpts as any);
  const count = exportCsv ? list.length : await ReferralRecord.count({ where } as any);
  if (exportCsv) {
    streamCsv(res, 'rewards.csv', ['id', 'inviter_user_id', 'invitee_user_id', 'event_type', 'status', 'reward_yuan', 'note', 'created_at'], list.map((r: any) => [
        Number(r.id || 0),
        Number(r.inviter_user_id || 0),
        Number(r.invitee_user_id || 0),
        String(r.event_type || ''),
        String(r.status || ''),
        Number(r.reward_yuan || 0).toFixed(2),
        String(r.note || ''),
        r.created_at ? new Date(r.created_at).toISOString() : '',
      ]));
    return;
  }
  res.json({ code: 1, msg: 'success', data: { rows: list, count, page, pageSize } });
});

router.post('/superadmin/assign', requireSuperAdmin, requireAdminPinVerified, async (req, res) => {
  const username = String(req.body?.username || '').trim();
  if (!username) {
    res.status(400).json({ code: 0, msg: '缺少用户名' });
    return;
  }
  const target = await User.findOne({ where: { username } as any });
  if (!target) {
    res.status(404).json({ code: 0, msg: '用户不存在' });
    return;
  }
  await (target as any).update({ role: 'superadmin' });
  res.json({ code: 1, msg: 'success' });
});

export default router;
