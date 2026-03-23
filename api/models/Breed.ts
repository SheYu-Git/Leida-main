import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class Breed extends Model<InferAttributes<Breed>, InferCreationAttributes<Breed>> {
  declare id: CreationOptional<number>;
  declare name: string; // Keep as primary display name (usually Chinese)
  declare name_en: string; // English name
  declare species: 'dog' | 'cat' | 'other';
  declare description: CreationOptional<string>; // Chinese description
  declare origin: CreationOptional<string>;
  declare temperament: CreationOptional<string>;
  declare lifespan: CreationOptional<string>; // e.g., "10-12 years"
  declare weight: CreationOptional<string>; // e.g., "5-8 kg"
  declare height: CreationOptional<string>; // e.g., "25-30 cm"
  declare images: CreationOptional<string[]>; // Array of image URLs
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Breed.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    species: {
      type: DataTypes.ENUM('dog', 'cat', 'other'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    origin: {
      type: DataTypes.STRING,
    },
    temperament: {
      type: DataTypes.STRING,
    },
    lifespan: {
      type: DataTypes.STRING,
    },
    weight: {
      type: DataTypes.STRING,
    },
    height: {
      type: DataTypes.STRING,
    },
    images: {
      type: DataTypes.JSON, // SQLite supports JSON
      defaultValue: []
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'breeds',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Breed;
