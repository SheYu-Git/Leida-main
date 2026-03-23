import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class MemberActivationCode extends Model<InferAttributes<MemberActivationCode>, InferCreationAttributes<MemberActivationCode>> {
  declare code: string;
  declare plan_code: CreationOptional<'city' | 'province' | 'country'>;
  declare scope_mode: CreationOptional<'city' | 'province' | 'country' | 'fixed'>;
  declare scope_value: CreationOptional<string>;
  declare duration_days: CreationOptional<number>;
  declare max_uses: CreationOptional<number>;
  declare used_count: CreationOptional<number>;
  declare is_active: CreationOptional<boolean>;
  declare expires_at: CreationOptional<Date | null>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

MemberActivationCode.init(
  {
    code: { type: DataTypes.STRING, primaryKey: true },
    plan_code: { type: DataTypes.ENUM('city', 'province', 'country'), defaultValue: 'country' },
    scope_mode: { type: DataTypes.ENUM('city', 'province', 'country', 'fixed'), defaultValue: 'fixed' },
    scope_value: { type: DataTypes.STRING, defaultValue: '' },
    duration_days: { type: DataTypes.INTEGER, defaultValue: 365 },
    max_uses: { type: DataTypes.INTEGER, defaultValue: 0 },
    used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'member_activation_codes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default MemberActivationCode;

