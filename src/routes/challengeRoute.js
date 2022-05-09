const express = require('express')
const router = express.Router()
const database = require('../database')
const auth = require("../middleware/authenticate");

router.post('/createChallenge', auth, (req, res) => {
    database.getConnection((_err, con) => {
        if (!req.body.name || !req.body.startDate) {
            con.release()
            return res.json({header: 'Error', message: 'Empty fields!'})
        }

        if (!req.body.private) {
            req.body.private = false;
        }
        con.query(`INSERT INTO challenge (fk_user_id, name, private, startdate) VAlUES (${req.user.id}, ${con.escape(req.body.name)}, ${req.body.private}, ${con.escape(req.body.startDate)})`, (err, _result) => {
            con.release()
            if (err) {
                return res.status(500).json({err})
            }
            return res.json({
                status: 1,
                header: "Worked",
                message: "Added challenge " + req.body.name + " succesfully"
            })
        })
    })
})

router.get("/getAllChallenges", auth, (req, res) => {
    database.getConnection((_err, con) => {
        con.query(`SELECT * FROM challenge`, (err, challenge) => {
            con.release();
            if (err) {
                return res.status(500).json({err})
            }
            return res.send(challenge);
        })
    })
})

router.get("/getAllCreatedChallenges", auth, (req, res) => {
    database.getConnection((_err, con) => {
        con.query(`SELECT * FROM challenge WHERE fk_user_id = ${con.escape(req.user.id)}`, (err, challenge) => {
            con.release();
            if (err) {
                return res.status(500).json({err})
            }
            return res.send(challenge);
        })
    })
})

router.get("/getAllAttendedChallenges", auth, (req, res) => {
    database.getConnection((_err, con) => {
        con.query(`SELECT * FROM challenge inner join user_attends_challenge uac on challenge.id = uac.fk_challenge_id where uac.fk_user_id = ${con.escape(req.user.id)}`, (err, challenge) => {
            con.release();
            if (err) {
                return res.status(500).json({err})
            }
            return res.send(challenge);
        })
    })
})

module.exports = router