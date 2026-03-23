import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class MemberOrder extends Model<InferAttributes<MemberOrder>, InferCreationAttributes<MemberOrder>> {
  declare id: CreationOptional<number>;
  declare order_no: string;
  declare user_id: number;
  declare plan_code: string;
  declare scope_value: CreationOptional<string>;
  declare amount_yuan: CreationOptional<string>;
  declare source: CreationOptional<'purchase' | 'activation' | 'admin_grant' | 'profile_reward'>;
  declare status: CreationOptional<'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded'>;
  declare ext_json: CreationOptional<string>;
  declare paid_at: CreationOptional<Date | null>;
  declare fulfilled_at: CreationOptional<Date | null>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

MemberOrder.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_no: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    plan_code: { type: DataTypes.STRING(32), allowNull: false },
    scope_value: { type: DataTypes.STRING(64), defaultValue: '' },
    amount_yuan: { type: DataTypes.DECIMAL(10, 2), defaultValue: '0.00' },
    source: { type: DataTypes.ENUM('purchase', 'activation', 'admin_grant', 'profile_reward'), defaultValue: 'purchase' },
    status: { type: DataTypes.ENUM('pending', 'paid', 'fulfilled', 'cancelled', 'refunded'), defaultValue: 'pending' },
    ext_json: { type: DataTypes.TEXT, defaultValue: '{}' },
    paid_at: { type: DataTypes.DATE, allowNull: true },
    fulfilled_at: { type: DataTypes.DATE, allowNull: true },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'member_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id', 'created_at'] },
      { fields: ['status', 'created_at'] },
    ],
  }
);

export default MemberOrder;
