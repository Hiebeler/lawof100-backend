const mariadb = require('mariadb/callback')

const pool = mariadb.createPool({
    host: 'localhost',
    port: 3310,
    user: 'root',
    password: '',
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