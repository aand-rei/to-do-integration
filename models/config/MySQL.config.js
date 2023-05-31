require('dotenv').config({ path: '../../.env' })
exports.config = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DB,
    password: process.env.MYSQL_PASSWORD
};