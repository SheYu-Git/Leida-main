/**
 * local server entry file, for local development
 */
import app from './app.js';
import sequelize from './config/database.js';
import './models/index.js';
import bcrypt from 'bcryptjs';
import { runBiddingSyncRecentDays, startBiddingSync, startDailyStatsJob } from './services/biddingSync.js';
import { ensureMemberSeed } from './services/memberSeed.js';
import { ensureDefaultConfigs } from './services/configService.js';
import User from './models/User.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;
const requireMySQL = String(process.env.REQUIRE_MYSQL || '1') !== '0';

const maskDbHost = (host: string) => {
  const h = String(host || '').trim();
  if (!h) return '';
  if (h.length <= 8) return `${h.slice(0, 2)}***${h.slice(-1)}`;
  return `${h.slice(0, 4)}***${h.slice(-4)}`;
};

const maskDbName = (name: string) => {
  const n = String(name || '').trim();
  if (!n) return '';
  if (n.length <= 6) return `${n.slice(0, 1)}***`;
  return `${n.slice(0, 3)}***${n.slice(-2)}`;
};

const ensureReferralSchemaForSqlite = async () => {
  if (!(sequelize.getDialect && sequelize.getDialect() === 'sqlite')) return;
  const [cols] = await sequelize.query("PRAGMA table_info('users')");
  const colNames = new Set(((cols as any[]) || []).map((c: any) => String(c.name || '')));
  if (!colNames.has('invite_code')) {
    await sequelize.query("ALTER TABLE users ADD COLUMN invite_code VARCHAR(32)");
  }
  if (!colNames.has('invited_by_user_id')) {
    await sequelize.query("ALTER TABLE users ADD COLUMN invited_by_user_id INTEGER");
  }
  if (!colNames.has('invite_reward_total_yuan')) {
    await sequelize.query("ALTER TABLE users ADD COLUMN invite_reward_total_yuan DECIMAL(10,2) DEFAULT '0.00'");
  }
  if (!colNames.has('admin_pin_hash')) {
    await sequelize.query("ALTER TABLE users ADD COLUMN admin_pin_hash VARCHAR(255) DEFAULT ''");
  }
  if (!colNames.has('admin_pin_updated_at')) {
    await sequelize.query("ALTER TABLE users ADD COLUMN admin_pin_updated_at DATETIME");
  }
  if (!colNames.has('admin_permissions_json')) {
    await sequelize.query("ALTER TABLE users ADD COLUMN admin_permissions_json TEXT DEFAULT '[]'");
  }
  if (!colNames.has('email')) {
    await sequelize.query("ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT ''");
  }
  if (!colNames.has('company_name')) {
    await sequelize.query("ALTER TABLE users ADD COLUMN company_name VARCHAR(255) DEFAULT ''");
  }
  if (!colNames.has('real_name')) {
    await sequelize.query("ALTER TABLE users ADD COLUMN real_name VARCHAR(128) DEFAULT ''");
  }
  if (!colNames.has('position_title')) {
    await sequelize.query("ALTER TABLE users ADD COLUMN position_title VARCHAR(128) DEFAULT ''");
  }
  if (!colNames.has('profile_reward_granted_at')) {
    await sequelize.query("ALTER TABLE users ADD COLUMN profile_reward_granted_at DATETIME");
  }
  await sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS users_invite_code_unique ON users(invite_code)');
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS referral_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inviter_user_id INTEGER NOT NULL,
      invitee_user_id INTEGER NOT NULL,
      event_type TEXT NOT NULL DEFAULT 'bind',
      plan_code TEXT DEFAULT '',
      source_ref_id TEXT DEFAULT '',
      reward_yuan DECIMAL(10,2) DEFAULT '0.00',
      status TEXT NOT NULL DEFAULT 'granted',
      meta_json TEXT DEFAULT '{}',
      created_at DATETIME,
      updated_at DATETIME
    )
  `);
  await sequelize.query('CREATE INDEX IF NOT EXISTS referral_records_inviter_created_idx ON referral_records(inviter_user_id, created_at)');
  await sequelize.query('CREATE INDEX IF NOT EXISTS referral_records_invitee_event_idx ON referral_records(invitee_user_id, event_type)');
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS app_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key VARCHAR(120) NOT NULL UNIQUE,
      draft_value_json TEXT DEFAULT '{}',
      published_value_json TEXT DEFAULT '{}',
      version INTEGER DEFAULT 1,
      updated_by_user_id INTEGER,
      created_at DATETIME,
      updated_at DATETIME
    )
  `);
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS app_config_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key VARCHAR(120) NOT NULL,
      version INTEGER NOT NULL,
      value_json TEXT DEFAULT '{}',
      created_by_user_id INTEGER,
      created_at DATETIME,
      updated_at DATETIME
    )
  `);
  await sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS app_config_versions_key_version_uniq ON app_config_versions(key, version)');
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_user_id INTEGER NOT NULL,
      module VARCHAR(64) DEFAULT '',
      action VARCHAR(64) DEFAULT '',
      target_key VARCHAR(120) DEFAULT '',
      before_json TEXT DEFAULT '{}',
      after_json TEXT DEFAULT '{}',
      created_at DATETIME,
      updated_at DATETIME
    )
  `);
  await sequelize.query('CREATE INDEX IF NOT EXISTS admin_audit_logs_admin_created_idx ON admin_audit_logs(admin_user_id, created_at)');
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS member_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no VARCHAR(64) NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      plan_code VARCHAR(32) NOT NULL,
      scope_value VARCHAR(64) DEFAULT '',
      amount_yuan DECIMAL(10,2) DEFAULT '0.00',
      source TEXT DEFAULT 'purchase',
      status TEXT DEFAULT 'pending',
      ext_json TEXT DEFAULT '{}',
      paid_at DATETIME,
      fulfilled_at DATETIME,
      created_at DATETIME,
      updated_at DATETIME
    )
  `);
  await sequelize.query('CREATE INDEX IF NOT EXISTS member_orders_user_created_idx ON member_orders(user_id, created_at)');
  await sequelize.query('CREATE INDEX IF NOT EXISTS member_orders_status_created_idx ON member_orders(status, created_at)');
  const [subCols] = await sequelize.query("PRAGMA table_info('user_subscriptions')");
  const subColNames = new Set(((subCols as any[]) || []).map((c: any) => String(c.name || '')));
  if (!subColNames.has('read_item_ids_json')) {
    await sequelize.query("ALTER TABLE user_subscriptions ADD COLUMN read_item_ids_json TEXT DEFAULT '[]'");
  }
};

const ensureUsersSchemaForMySQL = async () => {
  if (!(sequelize.getDialect && sequelize.getDialect() === 'mysql')) return;
  const [cols] = await sequelize.query('SHOW COLUMNS FROM `users`');
  const colNames = new Set(((cols as any[]) || []).map((c: any) => String(c.Field || c.field || '')));
  const ddl: Array<[string, string]> = [
    ['role', "ALTER TABLE `users` ADD COLUMN `role` ENUM('user','admin','superadmin','ops_admin','order_admin','finance_admin','support_admin','auditor') NOT NULL DEFAULT 'user' AFTER `avatar`"],
    ['wechat_id', "ALTER TABLE `users` ADD COLUMN `wechat_id` VARCHAR(255) NULL AFTER `role`"],
    ['phone', "ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(64) NULL AFTER `wechat_id`"],
    ['vip_scope_value', "ALTER TABLE `users` ADD COLUMN `vip_scope_value` VARCHAR(255) NOT NULL DEFAULT '' AFTER `vip_level`"],
    ['invite_code', "ALTER TABLE `users` ADD COLUMN `invite_code` VARCHAR(32) NULL AFTER `view_history_json`"],
    ['invited_by_user_id', "ALTER TABLE `users` ADD COLUMN `invited_by_user_id` INT NULL AFTER `invite_code`"],
    ['invite_reward_total_yuan', "ALTER TABLE `users` ADD COLUMN `invite_reward_total_yuan` DECIMAL(10,2) NOT NULL DEFAULT '0.00' AFTER `invited_by_user_id`"],
    ['admin_pin_hash', "ALTER TABLE `users` ADD COLUMN `admin_pin_hash` VARCHAR(255) NOT NULL DEFAULT '' AFTER `invite_reward_total_yuan`"],
    ['admin_pin_updated_at', "ALTER TABLE `users` ADD COLUMN `admin_pin_updated_at` DATETIME NULL AFTER `admin_pin_hash`"],
    ['admin_permissions_json', "ALTER TABLE `users` ADD COLUMN `admin_permissions_json` TEXT NULL AFTER `admin_pin_updated_at`"],
    ['email', "ALTER TABLE `users` ADD COLUMN `email` VARCHAR(255) NOT NULL DEFAULT '' AFTER `phone`"],
    ['company_name', "ALTER TABLE `users` ADD COLUMN `company_name` VARCHAR(255) NOT NULL DEFAULT '' AFTER `email`"],
    ['real_name', "ALTER TABLE `users` ADD COLUMN `real_name` VARCHAR(128) NOT NULL DEFAULT '' AFTER `company_name`"],
    ['position_title', "ALTER TABLE `users` ADD COLUMN `position_title` VARCHAR(128) NOT NULL DEFAULT '' AFTER `real_name`"],
    ['profile_reward_granted_at', "ALTER TABLE `users` ADD COLUMN `profile_reward_granted_at` DATETIME NULL AFTER `position_title`"],
  ];
  for (const [name, sql] of ddl) {
    if (!colNames.has(name)) {
      await sequelize.query(sql);
    }
  }
};

const ensureMemberOrdersSchemaForMySQL = async () => {
  if (!(sequelize.getDialect && sequelize.getDialect() === 'mysql')) return;
  await sequelize.query("ALTER TABLE `member_orders` MODIFY COLUMN `source` ENUM('purchase','activation','admin_grant','profile_reward') NOT NULL DEFAULT 'purchase'");
  await sequelize.query("UPDATE `member_orders` SET `source`='profile_reward' WHERE (`source` IS NULL OR `source`='') AND `ext_json` LIKE '%\"addDays\"%'");
};

const ensureUserSubscriptionsSchemaForMySQL = async () => {
  if (!(sequelize.getDialect && sequelize.getDialect() === 'mysql')) return;
  const [cols] = await sequelize.query('SHOW COLUMNS FROM `user_subscriptions`');
  const colNames = new Set(((cols as any[]) || []).map((c: any) => String(c.Field || c.field || '')));
  if (!colNames.has('read_item_ids_json')) {
    await sequelize.query("ALTER TABLE `user_subscriptions` ADD COLUMN `read_item_ids_json` TEXT NULL AFTER `last_read_at`");
    await sequelize.query("UPDATE `user_subscriptions` SET `read_item_ids_json`='[]' WHERE `read_item_ids_json` IS NULL");
  }
};

const ensureSuperAdminBootstrap = async () => {
  const username = 'shuyi';
  const defaultPin = '015058';
  const user = await User.findOne({ where: { username } as any });
  if (!user) return;
  const patch: any = {};
  if (String((user as any).role || '') !== 'superadmin') patch.role = 'superadmin';
  const pinHash = String((user as any).admin_pin_hash || '');
  if (!pinHash) {
    patch.admin_pin_hash = await bcrypt.hash(defaultPin, 10);
    patch.admin_pin_updated_at = new Date();
  }
  if (Object.keys(patch).length) {
    await (user as any).update(patch);
  }
};

// Sync database and start server (avoid ALTER to prevent FK issues on SQLite)
const dialect = sequelize.getDialect ? sequelize.getDialect() : '';
const shouldAlter = dialect === 'mysql' && String(process.env.DB_SYNC_ALTER || '0') === '1';
if (requireMySQL && dialect !== 'mysql') {
  throw new Error('数据库模式错误：当前不是MySQL。请配置阿里云RDS环境变量后再启动');
}
console.log(`DB dialect=${dialect || 'unknown'} host=${maskDbHost(String(process.env.DB_HOST || ''))} name=${maskDbName(String(process.env.DB_NAME || ''))} requireMySQL=${requireMySQL ? '1' : '0'} syncAlter=${shouldAlter ? '1' : '0'}`);
sequelize.sync(shouldAlter ? { alter: true } : undefined).then(async () => {
  console.log('Database synced');
  try { await ensureUsersSchemaForMySQL(); } catch (e) { console.error('Failed to patch users schema on mysql:', e); }
  try { await ensureMemberOrdersSchemaForMySQL(); } catch (e) { console.error('Failed to patch member_orders schema on mysql:', e); }
  try { await ensureUserSubscriptionsSchemaForMySQL(); } catch (e) { console.error('Failed to patch user_subscriptions schema on mysql:', e); }
  try { await ensureReferralSchemaForSqlite(); } catch (e) { console.error('Failed to patch referral schema on sqlite:', e); }
  try { await ensureMemberSeed(); } catch (e) {}
  try { await ensureDefaultConfigs(); } catch (e) {}
  try { await ensureSuperAdminBootstrap(); } catch (e) { console.error('Failed to setup superadmin bootstrap:', e); }
  const server = app.listen(PORT, () => {
    console.log(`Server ready on port ${PORT}`);
  });
  const bootstrapEnabled = String(process.env.BIDDING_BOOTSTRAP_ENABLED || '1') !== '0';
  const bootstrapDays = Math.max(1, Number(process.env.BIDDING_BOOTSTRAP_RECENT_DAYS || 15));
  if (bootstrapEnabled) {
    runBiddingSyncRecentDays(bootstrapDays)
      .then(() => {
        console.log(`Bidding bootstrap synced recent ${bootstrapDays} days`);
      })
      .catch((e) => {
        console.error('Bidding bootstrap failed:', e);
      });
  }
  startBiddingSync();
  startDailyStatsJob();

  /**
   * close server
   */
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}).catch((err) => {
  console.error('Failed to sync database:', err);
});

export default app;
