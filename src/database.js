const mariadb = require('mariadb/callback')

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: 'user',
    password: 'AUT-1251',
    database: 'law_of_100',
    connectionLimit: 800,
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    supportBigNumbers: true,
})

exports.getConnection = function (callback) {
    pool.getConnection(function (err, con) {
        if (err) {
            console.log(err);
            return callback(err)
        }
        callback(err, con)
    })
}