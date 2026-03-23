import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare password: string;
  declare nickname: string;
  declare avatar: CreationOptional<string>;
  declare role: CreationOptional<'user' | 'admin' | 'superadmin' | 'ops_admin' | 'order_admin' | 'finance_admin' | 'support_admin' | 'auditor'>;
  declare wechat_id: CreationOptional<string>;
  declare phone: CreationOptional<string>;
  declare email: CreationOptional<string>;
  declare company_name: CreationOptional<string>;
  declare real_name: CreationOptional<string>;
  declare position_title: CreationOptional<string>;
  declare profile_reward_granted_at: CreationOptional<Date | null>;
  declare vip_level: CreationOptional<'free' | 'city' | 'province' | 'country'>;
  declare vip_scope_value: CreationOptional<string>;
  declare vip_expire_at: CreationOptional<number>;
  declare balance_yuan: CreationOptional<string>;
  declare view_usage: CreationOptional<number>;
  declare view_history_json: CreationOptional<string>;
  declare invite_code: CreationOptional<string>;
  declare invited_by_user_id: CreationOptional<number | null>;
  declare invite_reward_total_yuan: CreationOptional<string>;
  declare admin_pin_hash: CreationOptional<string>;
  declare admin_pin_updated_at: CreationOptional<Date | null>;
  declare admin_permissions_json: CreationOptional<string>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
    },
    avatar: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'superadmin', 'ops_admin', 'order_admin', 'finance_admin', 'support_admin', 'auditor'),
      defaultValue: 'user',
    },
    wechat_id: {
      type: DataTypes.STRING,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    company_name: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    real_name: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    position_title: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    profile_reward_granted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    vip_level: {
      type: DataTypes.ENUM('free', 'city', 'province', 'country'),
      defaultValue: 'free',
    },
    vip_scope_value: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    vip_expire_at: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    balance_yuan: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: '0.00',
    },
    view_usage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_history_json: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
    },
    invite_code: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: true,
    },
    invited_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    invite_reward_total_yuan: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: '0.00',
    },
    admin_pin_hash: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    admin_pin_updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    admin_permissions_json: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default User;
