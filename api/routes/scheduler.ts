import express, { type Request, type Response } from 'express';
import { Op } from 'sequelize';
import BiddingSyncState from '../models/BiddingSyncState.js';
import BiddingDailyStat from '../models/BiddingDailyStat.js';
import BiddingItem from '../models/BiddingItem.js';
import { CST_OFFSET_MS } from '../services/cachePage.js';

const router = express.Router();

const pad2 = (n: number) => String(n).padStart(2, '0');

const formatCst = (ms: number) => {
  if (!ms || ms <= 0) return '';
  const d = new Date(ms + CST_OFFSET_MS);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`;
};

router.get('/scheduler/status', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const state = await BiddingSyncState.findByPk(1);
  const actionAt = Number((state as any)?.last_attempt_at || 0);
  const successAt = Number((state as any)?.last_success_at || 0);
  const lastPage = Number((state as any)?.last_page || 0);
  const lastError = String((state as any)?.last_error || '');

  const now = Date.now();
  const lagSec = successAt ? Math.max(0, Math.floor((now - successAt) / 1000)) : -1;
  const lagMin = lagSec >= 0 ? Math.floor(lagSec / 60) : -1;
  const lagAlertMin = Math.max(1, Number(process.env.BIDDING_SYNC_ALERT_LAG_MIN || 15));
  const recentWindowMin = Math.max(1, Number(process.env.BIDDING_RECENT_WINDOW_MIN || 5));
  const recentSince = new Date(now - recentWindowMin * 60 * 1000);
  const recentInsertedCount = await BiddingItem.count({ where: { created_at: { [Op.gte]: recentSince } } as any });
  const recentUpdatedCount = await BiddingItem.count({ where: { updated_at: { [Op.gte]: recentSince } } as any });

  const daily = await BiddingDailyStat.findOne({
    where: { scope_type: 'country', scope_value: '' } as any,
    order: [['date_key', 'DESC']],
  });

  const dailyKey = daily ? String((daily as any).date_key || '') : '';
  const dailyCount = daily ? Number((daily as any).count || 0) : 0;
  const dailyYi = daily ? String((daily as any).total_yi || '0.00') : '0.00';

  const ok = !!successAt && !lastError;
  const alertActive = !successAt || !!lastError || (lagMin >= lagAlertMin);
  const alertReason = !successAt
    ? '未检测到成功同步'
    : (lastError ? `同步异常：${lastError}` : (lagMin >= lagAlertMin ? `同步延迟超过${lagAlertMin}分钟` : ''));
  const status = !successAt ? '未同步' : (ok ? (lagMin >= 0 && lagMin < lagAlertMin ? '正常' : '延迟') : '异常');

  res.json({
    code: 1,
    msg: 'success',
    data: {
      status,
      nowCst: formatCst(now),
      sync: {
        actionAt,
        successAt,
        actionAtCst: formatCst(actionAt),
        successAtCst: formatCst(successAt),
        lagSec,
        lagMin,
        lagAlertMin,
        alertActive,
        alertReason,
        recentWindowMin,
        recentInsertedCount,
        recentUpdatedCount,
        lastPage,
        lastError,
      },
      daily: {
        dateKey: dailyKey,
        count: dailyCount,
        totalYi: dailyYi,
        text: dailyKey ? `昨日新增 ${dailyCount} 条，商机 ${dailyYi} 亿+` : '',
      },
    },
  });
});

export default router;
