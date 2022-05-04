const express = require('express')
const router = express.Router()
const database = require('../database')


router.get('/users', (req, res) => {
    database.getConnection((_err, con) => {
        con.query(`
    select *
    from user
      `, (err, user) => {
            con.release()
            if (err) {
                return res.status(500).json({ err })
            } else {
                return res.send(user)
            }
        })
    })
})

module.exports = router
