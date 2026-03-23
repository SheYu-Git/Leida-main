import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class AdminAuditLog extends Model<InferAttributes<AdminAuditLog>, InferCreationAttributes<AdminAuditLog>> {
  declare id: CreationOptional<number>;
  declare admin_user_id: number;
  declare module: CreationOptional<string>;
  declare action: CreationOptional<string>;
  declare target_key: CreationOptional<string>;
  declare before_json: CreationOptional<string>;
  declare after_json: CreationOptional<string>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

AdminAuditLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    admin_user_id: { type: DataTypes.INTEGER, allowNull: false },
    module: { type: DataTypes.STRING(64), defaultValue: '' },
    action: { type: DataTypes.STRING(64), defaultValue: '' },
    target_key: { type: DataTypes.STRING(120), defaultValue: '' },
    before_json: { type: DataTypes.TEXT, defaultValue: '{}' },
    after_json: { type: DataTypes.TEXT, defaultValue: '{}' },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'admin_audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['admin_user_id', 'created_at'] },
      { fields: ['module', 'created_at'] },
    ],
  }
);

export default AdminAuditLog;
