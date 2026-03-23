import sequelize from './config/database.js';
import { User } from './models/index.js';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
  try {
    await sequelize.sync();

    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password: hashedPassword,
      nickname: '超级管理员',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    });

    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Failed to seed admin user:', error);
  } finally {
    await sequelize.close();
  }
};

seedAdmin();
