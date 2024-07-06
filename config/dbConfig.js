const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'yhq15017872695',
    database: 'xiaoyu_mysql',
    connectionLimit: 10
});

module.exports = pool;