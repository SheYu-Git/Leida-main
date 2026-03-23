import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import sequelize from '../config/database.js';
import type Breed from './Breed.js';

class Pet extends Model<InferAttributes<Pet>, InferCreationAttributes<Pet>> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare name: string;
  declare breed_id: CreationOptional<number>; // New FK
  declare breed_name: CreationOptional<string>; // Deprecated but kept for compatibility/custom input
  declare age: CreationOptional<number>;
  declare gender: CreationOptional<string>;
  declare avatar: CreationOptional<string>;
  declare vaccination_status: CreationOptional<string>;
  declare deworming_status: CreationOptional<string>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  declare breed_info?: NonAttribute<Breed>;
}

Pet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    breed_id: {
      type: DataTypes.INTEGER,
    },
    breed_name: {
      type: DataTypes.STRING,
      field: 'breed', // Map to existing column if needed, or we rename it
    },
    age: {
      type: DataTypes.INTEGER,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
    },
    avatar: {
      type: DataTypes.STRING,
    },
    vaccination_status: {
      type: DataTypes.STRING,
    },
    deworming_status: {
      type: DataTypes.STRING,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'pets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Pet;
