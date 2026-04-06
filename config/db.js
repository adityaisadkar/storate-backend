const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const connectDB = async () => {
  try {
    // 1. First, connect to MySQL without a database name to ensure the DB exists
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null,
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.end();

    // 2. Now authenticate with Sequelize
    await sequelize.authenticate();
    console.log(`Connected to database: ${process.env.DB_NAME}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false // Required for some cloud providers like Aiven
      } : null
    }
  }
);

module.exports = { sequelize, connectDB };
