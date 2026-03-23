import dotenv from 'dotenv';
import sequelize from '../api/config/database.js';

dotenv.config();

const mask = (v: string) => {
  const s = String(v || '').trim();
  if (!s) return '(empty)';
  if (s.length <= 6) return `${s.slice(0, 1)}***`;
  return `${s.slice(0, 3)}***${s.slice(-2)}`;
};

const main = async () => {
  const dialect = sequelize.getDialect ? sequelize.getDialect() : 'unknown';
  const host = String(process.env.DB_HOST || '');
  const db = String(process.env.DB_NAME || '');
  const user = String(process.env.DB_USER || '');
  console.log(`DB_DIALECT=${dialect}`);
  console.log(`DB_HOST=${mask(host)}`);
  console.log(`DB_NAME=${db ? mask(db) : '(empty)'}`);
  console.log(`DB_USER=${user ? mask(user) : '(empty)'}`);

  if (dialect !== 'mysql') {
    throw new Error('当前并未使用 MySQL（阿里云RDS）');
  }

  await sequelize.authenticate();
  console.log('RDS_AUTH=OK');

  const [rows] = await sequelize.query('SHOW TABLES');
  const tableNames = new Set(
    ((rows as any[]) || []).map((r: any) => String(Object.values(r || {})[0] || '').toLowerCase()).filter(Boolean)
  );
  const required = ['users', 'user_subscriptions', 'member_plans', 'member_activation_codes', 'member_orders', 'referral_records'];
  const missing = required.filter((t) => !tableNames.has(t));
  console.log(`TABLE_COUNT=${tableNames.size}`);
  if (missing.length) {
    throw new Error(`缺少关键表: ${missing.join(',')}`);
  }
  console.log('RDS_SCHEMA=OK');
  await sequelize.close();
};

main().catch(async (e: any) => {
  console.error(`RDS_CHECK_FAIL=${String(e?.message || e)}`);
  try { await sequelize.close(); } catch {}
  process.exit(1);
});
