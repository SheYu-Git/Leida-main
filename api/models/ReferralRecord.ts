import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class ReferralRecord extends Model<InferAttributes<ReferralRecord>, InferCreationAttributes<ReferralRecord>> {
  declare id: CreationOptional<number>;
  declare inviter_user_id: number;
  declare invitee_user_id: number;
  declare event_type: CreationOptional<'bind' | 'first_purchase_reward'>;
  declare plan_code: CreationOptional<string>;
  declare source_ref_id: CreationOptional<string>;
  declare reward_yuan: CreationOptional<string>;
  declare status: CreationOptional<'granted' | 'rejected'>;
  declare meta_json: CreationOptional<string>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

ReferralRecord.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    inviter_user_id: { type: DataTypes.INTEGER, allowNull: false },
    invitee_user_id: { type: DataTypes.INTEGER, allowNull: false },
    event_type: { type: DataTypes.ENUM('bind', 'first_purchase_reward'), defaultValue: 'bind' },
    plan_code: { type: DataTypes.STRING, defaultValue: '' },
    source_ref_id: { type: DataTypes.STRING, defaultValue: '' },
    reward_yuan: { type: DataTypes.DECIMAL(10, 2), defaultValue: '0.00' },
    status: { type: DataTypes.ENUM('granted', 'rejected'), defaultValue: 'granted' },
    meta_json: { type: DataTypes.TEXT, defaultValue: '{}' },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'referral_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['inviter_user_id', 'created_at'] },
      { fields: ['invitee_user_id', 'event_type'] },
    ],
  }
);

export default ReferralRecord;
