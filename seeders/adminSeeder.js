const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { connectDB, sequelize } = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (adminExists) {
      console.log('Admin already exists.');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    await User.create({
      name: 'System Administrator Account',
      email: 'admin@storate.com',
      password: hashedPassword,
      address: 'Platform Headquarters, City Center, Main Street, 101',
      role: 'admin',
    });

    console.log('Admin account seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
