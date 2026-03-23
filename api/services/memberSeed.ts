import MemberPlan from '../models/MemberPlan.js';
import MemberActivationCode from '../models/MemberActivationCode.js';

const json = (v: any) => JSON.stringify(v);

export const ensureMemberSeed = async () => {
  const planCount = await MemberPlan.count();
  if (!planCount) {
    await MemberPlan.bulkCreate([
      {
        code: 'free',
        name: '免费会员',
        price_yuan: 0,
        duration_days: 36500,
        entitlements_json: json({ subLimit: 1, freeDetailLimit: 10, crossCityLimit: 0, crossProvinceLimit: 0 }),
        is_active: true,
      },
      {
        code: 'city',
        name: '城市会员',
        price_yuan: 199,
        duration_days: 365,
        entitlements_json: json({ subLimit: 10, freeDetailLimit: 0, crossCityLimit: 100, crossProvinceLimit: 0 }),
        is_active: true,
      },
      {
        code: 'province',
        name: '省级会员',
        price_yuan: 599,
        duration_days: 365,
        entitlements_json: json({ subLimit: 50, freeDetailLimit: 0, crossCityLimit: 0, crossProvinceLimit: 500 }),
        is_active: true,
      },
      {
        code: 'country',
        name: '全国会员',
        price_yuan: 999,
        duration_days: 365,
        entitlements_json: json({ subLimit: 200, freeDetailLimit: 0, crossCityLimit: -1, crossProvinceLimit: -1 }),
        is_active: true,
      },
    ] as any);
  }

  const codeCount = await MemberActivationCode.count();
  if (!codeCount) {
    await MemberActivationCode.bulkCreate([
      { code: 'VIPCITY', plan_code: 'city', scope_mode: 'city', scope_value: '', duration_days: 365, max_uses: 0, used_count: 0, is_active: true },
      { code: 'VIPPROV', plan_code: 'province', scope_mode: 'province', scope_value: '', duration_days: 365, max_uses: 0, used_count: 0, is_active: true },
      { code: 'VIPALL', plan_code: 'country', scope_mode: 'country', scope_value: '全国', duration_days: 365, max_uses: 0, used_count: 0, is_active: true },
    ] as any);
  }
};

