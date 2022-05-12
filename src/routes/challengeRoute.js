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
            if (err) {
                return res.status(500).json({err})
            }
            console.log(_result.insertId);
            con.query(`INSERT INTO user_attends_challenge (fk_user_id, fk_challenge_id, join_date) VAlUES (${req.user.id}, ${con.escape(_result.insertId)}, ${con.escape(req.body.startDate)})`, (err, _result) => {
                con.release();
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

router.get("/getAllChallengesWithJoinedField", auth, (req, res) => {
    database.getConnection((_err, con) => {
        con.query(`SELECT challenge.id, challenge.name, challenge.private, challenge.startdate, CASE 
        WHEN uac.fk_challenge_id IS null or uac.fk_user_id != ${con.escape(req.user.id)} THEN 0 
        ELSE 1 
    END AS joined
    FROM challenge
    left join user_attends_challenge uac ON challenge.id = uac.fk_challenge_id group by challenge.id order by startdate asc`, (err, challenge) => {
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

router.get("/getEntriesOfChallenge/:challengeId", auth, (req, res) => {
    database.getConnection((_err, con) => {
        if (!req.params.challengeId) {
            con.release();
            return res.status(500).json("No Challenge id")
        }
        con.query(`select day, description, successful, timestamp from entry where fk_user_id = ${con.escape(req.user.id)} and fk_challenge_id = ${con.escape(req.params.challengeId)} order by day asc`, (err, challenge) => {
            con.release();
            if (err) {
                return res.status(500).json({err})
            }
            return res.send(challenge);
        })
    })
})

router.post("/joinChallenge", auth, (req, res) => {
    database.getConnection((_err, con) => {
        if (!req.body.challengeId || !req.body.startDate) {
            con.release()
            return res.json({header: 'Error', message: 'Empty params!'})
        }
        con.query(`INSERT INTO user_attends_challenge (fk_user_id, fk_challenge_id, join_date) VAlUES (${req.user.id}, ${con.escape(req.body.challengeId)}, ${con.escape(req.body.startDate)})`, (err, _result) => {
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

router.post("/addEntry", auth, (req, res) => {
    database.getConnection((_err, con) => {
        if (!req.body.challengeId || !req.body.day || !req.body.description) {
            con.release()
            return res.json({header: 'Error', message: 'Empty params!'})
        }

        con.query(`INSERT INTO entry (fk_user_id, fk_challenge_id, day, description, successful) VAlUES (${req.user.id}, ${con.escape(req.body.challengeId)}, ${con.escape(req.body.day)}, ${con.escape(req.body.description)}, ${con.escape(req.body.successful)})`, (err, _result) => {
            con.release()
            if (err) {
                return res.status(500).json({err})
            }
            return res.json({
                status: 1,
                header: "Worked",
                message: "Added entry " + req.body.day + " succesfully"
            })
        })
    })
})

module.exports = router