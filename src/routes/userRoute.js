const express = require('express')
const router = express.Router()
const database = require('../database')
const jwt = require('jsonwebtoken')
const auth = require("../middleware/authenticate");

router.get('/getuser', auth, (req, res) => {
    database.getConnection((_err, con) => {
        con.query(`Select username FROM user WHERE email = ${con.escape(req.user.email)}`, (err, user) => {
            if (err) {
                con.release();
                return res.status(401).json({err})
            } else if (user[0]) {
                con.release()
                return res.json(user[0]);
            }
        })
    })
})

module.exports = router