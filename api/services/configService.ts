import AppConfig from '../models/AppConfig.js';
import AppConfigVersion from '../models/AppConfigVersion.js';
import AdminAuditLog from '../models/AdminAuditLog.js';

const DEFAULT_BOOTSTRAP: Record<string, any> = {
  'feature.flags': {
    inviteEnabled: true,
    withdrawEnabled: false,
    activityPopupEnabled: false,
    adminDrawerEnabled: true,
  },
  'referral.reward': {
    city: 30,
    province: 80,
    country: 200,
  },
  'profile.reward': {
    freeToCityDays: 15,
    paidExtendDays: 30,
  },
  'copy.auth': {
    title: '商机雷达',
    subtitle: 'AI数字人24 小时为您寻找商机',
  },
  'copy.banner': {
    slides: [
      { title: '商机雷达', subtitle: 'AI数字员工24小时为您寻找商机！' },
      { title: '精准商机订阅', subtitle: '关键词+地区，实时推送不漏标' },
    ],
  },
  'notice.popup': {
    enabled: false,
    title: '运营公告',
    content: '欢迎使用商机雷达，最新活动已上线。',
    buttonText: '我知道了',
    version: 'v1',
  },
  'payment.channels': {
    wechatEnabled: true,
    alipayEnabled: true,
    transferEnabled: true,
    wechatLabel: '微信支付',
    alipayLabel: '支付宝支付',
    transferLabel: '对公转账',
    wechatAppId: '',
    wechatMchId: '',
    wechatApiKey: '',
    alipayAppId: '',
    alipaySellerId: '',
    alipayPublicKey: '',
    transferCompanyName: '舍予基业（珠海）控股集团有限公司',
    transferTaxNo: '91440400MABMPMTK15',
    transferAddress: '珠海市香洲区宝成路7号6栋2718房',
    transferPhone: '18607560510',
    transferBank: '中国建设银行股份有限公司珠海横琴金融街支行',
    transferAccount: '44050164005209668888',
  },
  'copy.member': {
    free: {
      title: '免费会员',
      subtitle: '基础浏览权益',
      benefits: ['免费体验浏览10条任意招标信息', '免费体验1个关键词订阅'],
    },
    city: {
      title: '城市会员',
      subtitle: '解锁单城商机',
      benefits: ['本市无限浏览', '跨市浏览 100 条', '订阅 10 个关键词'],
    },
    province: {
      title: '省级会员',
      subtitle: '统揽全省项目',
      benefits: ['本省无限浏览', '跨省浏览 500 条', '订阅 50 个关键词'],
    },
    country: {
      title: '全国会员',
      subtitle: '全国商机尽在掌握',
      benefits: ['全国无限浏览', '订阅 200 个关键词', '专属客服服务'],
    },
  },
  'member.permission.matrix': {
    free: { scope: '体验', viewLimit: 10, keywordLimit: 1, deviceLimit: 1, serviceCount: 0 },
    city: { scope: '城市', viewLimit: 100, keywordLimit: 10, deviceLimit: 2, serviceCount: 1 },
    province: { scope: '全省', viewLimit: 500, keywordLimit: 50, deviceLimit: 5, serviceCount: 3 },
    country: { scope: '全国', viewLimit: -1, keywordLimit: 200, deviceLimit: 10, serviceCount: 5 },
  },
};

const parseJson = (raw: any, fallback: any = {}) => {
  try {
    if (raw == null) return fallback;
    if (typeof raw === 'string') return JSON.parse(raw);
    return raw;
  } catch (e) {
    return fallback;
  }
};

export const ensureDefaultConfigs = async () => {
  const keys = Object.keys(DEFAULT_BOOTSTRAP);
  for (const key of keys) {
    const row = await AppConfig.findOne({ where: { key } as any });
    if (row) continue;
    const value = JSON.stringify(DEFAULT_BOOTSTRAP[key] ?? {});
    await AppConfig.create({
      key,
      draft_value_json: value,
      published_value_json: value,
      version: 1,
    } as any);
    await AppConfigVersion.create({
      key,
      version: 1,
      value_json: value,
      created_by_user_id: null,
    } as any);
  }
};

export const getPublishedConfigByKey = async (key: string, fallback: any = {}) => {
  const row = await AppConfig.findOne({ where: { key } as any });
  if (!row) return fallback;
  return parseJson((row as any).published_value_json, fallback);
};

export const getBootstrapConfig = async () => {
  await ensureDefaultConfigs();
  const rows = await AppConfig.findAll({ order: [['key', 'ASC']] });
  const map: Record<string, any> = {};
  (rows || []).forEach((row: any) => {
    map[String(row.key)] = parseJson(row.published_value_json, {});
  });
  Object.keys(DEFAULT_BOOTSTRAP).forEach((key) => {
    if (!(key in map)) map[key] = DEFAULT_BOOTSTRAP[key];
  });
  return map;
};

export const listConfigs = async () => {
  await ensureDefaultConfigs();
  const rows = await AppConfig.findAll({ order: [['key', 'ASC']] });
  return (rows || []).map((row: any) => ({
    key: String(row.key),
    version: Number(row.version || 1),
    draft: parseJson(row.draft_value_json, {}),
    published: parseJson(row.published_value_json, {}),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  }));
};

export const saveDraftConfig = async (params: { key: string; draftValue: any; adminUserId: number }) => {
  const key = String(params.key || '').trim();
  if (!key) throw new Error('Missing key');
  const draftValue = params.draftValue ?? {};
  const row = await AppConfig.findOne({ where: { key } as any });
  const before = row ? parseJson((row as any).draft_value_json, {}) : {};
  const payload = JSON.stringify(draftValue);
  let target = row as any;
  if (!target) {
    target = await AppConfig.create({
      key,
      draft_value_json: payload,
      published_value_json: JSON.stringify({}),
      version: 1,
      updated_by_user_id: params.adminUserId,
    } as any);
  } else {
    await target.update({ draft_value_json: payload, updated_by_user_id: params.adminUserId });
  }
  await AdminAuditLog.create({
    admin_user_id: params.adminUserId,
    module: 'config',
    action: 'save_draft',
    target_key: key,
    before_json: JSON.stringify(before),
    after_json: JSON.stringify(draftValue),
  } as any);
  return {
    key,
    version: Number((target as any).version || 1),
    draft: draftValue,
    published: parseJson((target as any).published_value_json, {}),
  };
};

export const publishConfig = async (params: { key: string; adminUserId: number }) => {
  const key = String(params.key || '').trim();
  const row = await AppConfig.findOne({ where: { key } as any });
  if (!row) throw new Error('配置不存在');
  const draft = parseJson((row as any).draft_value_json, {});
  const prevPublished = parseJson((row as any).published_value_json, {});
  const nextVersion = Number((row as any).version || 1) + 1;
  await (row as any).update({
    published_value_json: JSON.stringify(draft),
    version: nextVersion,
    updated_by_user_id: params.adminUserId,
  });
  await AppConfigVersion.create({
    key,
    version: nextVersion,
    value_json: JSON.stringify(draft),
    created_by_user_id: params.adminUserId,
  } as any);
  await AdminAuditLog.create({
    admin_user_id: params.adminUserId,
    module: 'config',
    action: 'publish',
    target_key: key,
    before_json: JSON.stringify(prevPublished),
    after_json: JSON.stringify(draft),
  } as any);
  return { key, version: nextVersion, published: draft };
};

export const listConfigVersions = async (key: string) => {
  const rows = await AppConfigVersion.findAll({ where: { key } as any, order: [['version', 'DESC']] });
  return (rows || []).map((row: any) => ({
    version: Number(row.version || 0),
    value: parseJson(row.value_json, {}),
    createdByUserId: row.created_by_user_id ? Number(row.created_by_user_id) : 0,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }));
};

export const rollbackConfig = async (params: { key: string; toVersion: number; adminUserId: number }) => {
  const key = String(params.key || '').trim();
  const toVersion = Number(params.toVersion || 0);
  if (!toVersion) throw new Error('无效版本');
  const row = await AppConfig.findOne({ where: { key } as any });
  if (!row) throw new Error('配置不存在');
  const target = await AppConfigVersion.findOne({ where: { key, version: toVersion } as any });
  if (!target) throw new Error('目标版本不存在');
  const value = parseJson((target as any).value_json, {});
  const prev = parseJson((row as any).published_value_json, {});
  await (row as any).update({
    draft_value_json: JSON.stringify(value),
    published_value_json: JSON.stringify(value),
    version: toVersion,
    updated_by_user_id: params.adminUserId,
  });
  await AdminAuditLog.create({
    admin_user_id: params.adminUserId,
    module: 'config',
    action: 'rollback',
    target_key: key,
    before_json: JSON.stringify(prev),
    after_json: JSON.stringify(value),
  } as any);
  return { key, version: toVersion, published: value };
};
