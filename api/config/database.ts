import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isMySQL = String(process.env.DB_DIALECT || '').toLowerCase() === 'mysql' || !!process.env.DB_HOST || !!process.env.DATABASE_URL;

const mysqlUrl = String(process.env.DATABASE_URL || '').trim();
const mysqlHost = String(process.env.DB_HOST || '').trim();
const mysqlPort = Number(process.env.DB_PORT || 3306);
const mysqlName = String(process.env.DB_NAME || 'bidding_radar').trim();
const mysqlUser = String(process.env.DB_USER || '').trim();
const mysqlPass = String(process.env.DB_PASSWORD || '').trim();
const mysqlTimezone = String(process.env.DB_TIMEZONE || '+08:00').trim();
const poolMax = Number(process.env.DB_POOL_MAX || 10);
const poolMin = Number(process.env.DB_POOL_MIN || 0);
const poolIdle = Number(process.env.DB_POOL_IDLE_MS || 10000);
const poolAcquire = Number(process.env.DB_POOL_ACQUIRE_MS || 30000);

const sequelize = isMySQL
  ? mysqlUrl
    ? new Sequelize(mysqlUrl, {
        dialect: 'mysql',
        logging: false,
        timezone: mysqlTimezone,
        pool: { max: poolMax, min: poolMin, idle: poolIdle, acquire: poolAcquire },
        dialectOptions: { charset: 'utf8mb4' },
      })
    : new Sequelize(mysqlName, mysqlUser, mysqlPass, {
        host: mysqlHost,
        port: mysqlPort,
        dialect: 'mysql',
        logging: false,
        timezone: mysqlTimezone,
        pool: { max: poolMax, min: poolMin, idle: poolIdle, acquire: poolAcquire },
        dialectOptions: { charset: 'utf8mb4' },
      })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false,
    });

export default sequelize;
