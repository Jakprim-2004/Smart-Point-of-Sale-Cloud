const { Sequelize } = require('sequelize');
require('dotenv').config();

// ใช้ DATABASE_URL จาก Neon หรือตัวแปรแยกสำหรับ local development
const sequelize = process.env.DATABASE_URL 
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        pool: {
            max: 1, 
            min: 0,
            acquire: 60000,
            idle: 10000
        },
        retry: {
            max: 3
        },
        // เพิ่ม options สำหรับ Neon
        dialectModule: require('pg'),
        native: false
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: 'postgres',
            logging: false,
            port: parseInt(process.env.DB_PORT || '5432')
        }
    );

// Test the connection
sequelize.authenticate()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;



