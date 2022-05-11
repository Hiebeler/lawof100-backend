const mysql = require('mysql')
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    port: process.env.DB_HOST,
    user: 'root',
    password: '',
    database: 'law_of_100',
    connectionLimit: 800,
    multipleStatements: false,
})

exports.getConnection = function (callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            return callback(err)
        }
        callback(err, con)
    })
}
