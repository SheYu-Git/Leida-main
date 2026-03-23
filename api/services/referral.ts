import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import User from '../models/User.js';
import ReferralRecord from '../models/ReferralRecord.js';
import { getPublishedConfigByKey } from './configService.js';

const DEFAULT_REWARD_BY_PLAN: Record<string, number> = {
  city: 30,
  province: 80,
  country: 200,
};

const toFixed2 = (n: number) => (Math.round((Number(n) || 0) * 100) / 100).toFixed(2);

const randomCode = () => {
  const s = Math.random().toString(36).slice(2, 10).toUpperCase();
  return s.replace(/[^A-Z0-9]/g, '').slice(0, 8);
};

export const normalizeInviteCode = (raw: string) => String(raw || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);

export const ensureInviteCode = async (user: any) => {
  if (!user) return '';
  const existed = String((user as any).invite_code || '').trim();
  if (existed) return existed;
  for (let i = 0; i < 8; i += 1) {
    const code = randomCode();
    const used = await User.findOne({ where: { invite_code: code } as any });
    if (used) continue;
    await (user as any).update({ invite_code: code });
    return code;
  }
  const fallback = `U${String((user as any).id || '').padStart(6, '0')}`;
  await (user as any).update({ invite_code: fallback });
  return fallback;
};

export const bindInviterByCode = async (inviteeUserId: number, rawInviteCode: string) => {
  const inviteCode = normalizeInviteCode(rawInviteCode);
  if (!inviteCode) return { ok: false, msg: '邀请码无效' };
  const invitee = await User.findByPk(inviteeUserId);
  if (!invitee) return { ok: false, msg: '用户不存在' };
  if ((invitee as any).invited_by_user_id) return { ok: false, msg: '已绑定推荐人' };
  const selfCode = String((invitee as any).invite_code || '').trim();
  if (selfCode && selfCode === inviteCode) return { ok: false, msg: '不能绑定自己的邀请码' };
  const inviter = await User.findOne({ where: { invite_code: inviteCode } as any });
  if (!inviter) return { ok: false, msg: '邀请码不存在' };
  if (Number((inviter as any).id) === Number(inviteeUserId)) return { ok: false, msg: '不能绑定自己' };
  await (invitee as any).update({ invited_by_user_id: Number((inviter as any).id) });
  await ReferralRecord.create({
    inviter_user_id: Number((inviter as any).id),
    invitee_user_id: Number(inviteeUserId),
    event_type: 'bind',
    plan_code: '',
    source_ref_id: `bind:${inviteeUserId}`,
    reward_yuan: '0.00',
    status: 'granted',
    meta_json: JSON.stringify({ inviteCode }),
  } as any);
  return { ok: true, inviterUserId: Number((inviter as any).id) };
};

export const settleFirstPurchaseReward = async (inviteeUserId: number, planCode: string) => {
  const rewardCfg = await getPublishedConfigByKey('referral.reward', DEFAULT_REWARD_BY_PLAN);
  const rewardMap = {
    city: Number((rewardCfg as any)?.city ?? DEFAULT_REWARD_BY_PLAN.city),
    province: Number((rewardCfg as any)?.province ?? DEFAULT_REWARD_BY_PLAN.province),
    country: Number((rewardCfg as any)?.country ?? DEFAULT_REWARD_BY_PLAN.country),
  };
  const reward = Number((rewardMap as any)[String(planCode || '')] || 0);
  if (!reward) return { rewarded: false, amount: 0 };
  const invitee = await User.findByPk(inviteeUserId);
  if (!invitee) return { rewarded: false, amount: 0 };
  const inviterUserId = Number((invitee as any).invited_by_user_id || 0);
  if (!inviterUserId) return { rewarded: false, amount: 0 };

  return sequelize.transaction(async (tx) => {
    const existed = await ReferralRecord.findOne({
      where: { invitee_user_id: inviteeUserId, event_type: 'first_purchase_reward' } as any,
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });
    if (existed) return { rewarded: false, amount: 0 };

    const inviter = await User.findByPk(inviterUserId, { transaction: tx, lock: tx.LOCK.UPDATE });
    if (!inviter) return { rewarded: false, amount: 0 };
    const oldBalance = Number((inviter as any).balance_yuan || 0);
    const oldRewardTotal = Number((inviter as any).invite_reward_total_yuan || 0);
    await (inviter as any).update(
      {
        balance_yuan: toFixed2(oldBalance + reward),
        invite_reward_total_yuan: toFixed2(oldRewardTotal + reward),
      },
      { transaction: tx }
    );
    await ReferralRecord.create(
      {
        inviter_user_id: inviterUserId,
        invitee_user_id: inviteeUserId,
        event_type: 'first_purchase_reward',
        plan_code: String(planCode || ''),
        source_ref_id: `first_purchase:${inviteeUserId}`,
        reward_yuan: toFixed2(reward),
        status: 'granted',
        meta_json: JSON.stringify({}),
      } as any,
      { transaction: tx }
    );
    return { rewarded: true, amount: reward };
  });
};

export const getReferralSummary = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) return null;
  const inviteCode = await ensureInviteCode(user);
  const invitedCount = await User.count({ where: { invited_by_user_id: userId } as any });
  const rewardTotal = Number((user as any).invite_reward_total_yuan || 0);
  const recordsCount = await ReferralRecord.count({
    where: { inviter_user_id: userId, event_type: 'first_purchase_reward', status: 'granted' } as any,
  });
  return {
    inviteCode,
    invitedCount: Number(invitedCount || 0),
    rewardTotal: Number(rewardTotal || 0),
    rewardPending: 0,
    rewardedCount: Number(recordsCount || 0),
  };
};

export const listReferralRecords = async (userId: number, page = 1, pageSize = 20) => {
  const safePage = Math.max(1, Number(page || 1));
  const safeSize = Math.min(50, Math.max(1, Number(pageSize || 20)));
  const offset = (safePage - 1) * safeSize;
  const rows = await ReferralRecord.findAndCountAll({
    where: { inviter_user_id: userId, event_type: { [Op.in]: ['bind', 'first_purchase_reward'] } } as any,
    order: [['created_at', 'DESC']],
    offset,
    limit: safeSize,
  });
  const inviteeIds = Array.from(new Set((rows.rows || []).map((r: any) => Number(r.invitee_user_id || 0)).filter(Boolean)));
  const inviteeUsers = inviteeIds.length
    ? await User.findAll({ where: { id: { [Op.in]: inviteeIds } } as any, attributes: ['id', 'username', 'nickname'] as any })
    : [];
  const nameMap = new Map<number, string>();
  (inviteeUsers || []).forEach((u: any) => {
    nameMap.set(Number(u.id), String(u.nickname || u.username || `用户${u.id}`));
  });
  return {
    total: Number(rows.count || 0),
    page: safePage,
    pageSize: safeSize,
    list: (rows.rows || []).map((r: any) => ({
      id: Number(r.id),
      inviteeUserId: Number(r.invitee_user_id || 0),
      inviteeName: nameMap.get(Number(r.invitee_user_id || 0)) || `用户${r.invitee_user_id}`,
      eventType: String(r.event_type || ''),
      planCode: String(r.plan_code || ''),
      rewardYuan: Number(r.reward_yuan || 0),
      status: String(r.status || ''),
      createTime: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    })),
  };
};
