import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class MemberPlan extends Model<InferAttributes<MemberPlan>, InferCreationAttributes<MemberPlan>> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare name: CreationOptional<string>;
  declare price_yuan: CreationOptional<number>;
  declare duration_days: CreationOptional<number>;
  declare entitlements_json: CreationOptional<string>;
  declare is_active: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

MemberPlan.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, defaultValue: '' },
    price_yuan: { type: DataTypes.BIGINT, defaultValue: 0 },
    duration_days: { type: DataTypes.INTEGER, defaultValue: 365 },
    entitlements_json: { type: DataTypes.TEXT, defaultValue: '{}' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'member_plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default MemberPlan;

