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
        con.query(`INSERT INTO challenge (fk_user_id, name, private, startdate, description) VAlUES (${req.user.id}, ${con.escape(req.body.name)}, ${req.body.private}, ${con.escape(req.body.startDate)}, ${con.escape(req.body.description)})`, (err, _result) => {
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
                    status: 1, header: "Worked", message: "Added challenge " + req.body.name + " succesfully"
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
        con.query(`SELECT challenge.id, challenge.name, challenge.private, challenge.startdate,uac.fk_user_id  FROM challenge 
	left join (select * from user_attends_challenge uac where fk_user_id = ${con.escape(req.user.id)}) uac on challenge.id = uac.fk_challenge_id
	where private = 0 order by startdate asc`, (err, challenge) => {
            con.release();
            if (err) {
                return res.status(500).json({err})
            }
            return res.send(challenge);
        })
    })
})

router.get("/getAllChallengesFinishedOrInProgress/:getFinished", auth, (req, res) => {
    database.getConnection((_err, con) => {
        if (!req.params.getFinished) {
            con.release()
            return res.json({header: 'Error', message: 'Empty fields!'})
        }
        let getFinishedOrInProgress = ">";
        if (JSON.parse(req.params.getFinished) === true) {
            getFinishedOrInProgress = "<";
        }
        con.query(`select c.id, c.fk_user_id, c.private, c.name, c.startdate, c.description, uac.join_date from challenge c inner join user_attends_challenge uac on uac.fk_challenge_id = c.id where uac.fk_user_id = ${con.escape(req.user.id)} and (c.startdate + 100) ${getFinishedOrInProgress} curdate()`, (err, challenges) => {
            con.release();
            if (err) {
                return res.status(500).json({err})
            }
            return res.send(challenges);
        })
    })
})

router.get("/getAllAttendingChallenges", auth, (req, res) => {
    database.getConnection((_err, con) => {
        con.query(`SELECT c.id, c.fk_user_id, c.private, c.name, c.startdate, c.description, uac.join_date FROM challenge c inner join user_attends_challenge uac on c.id = uac.fk_challenge_id where uac.fk_user_id = ${con.escape(req.user.id)} and (c.startdate + 100) > curdate()`, (err, challenge) => {
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
                status: 1, header: "Worked", message: "Added challenge " + req.body.name + " succesfully"
            })
        })
    })
})

router.post("/addEntry", auth, (req, res) => {
    database.getConnection((_err, con) => {
        if (!req.body.challengeId || !req.body.day) {
            con.release()
            return res.json({header: 'Error', message: 'Empty params!'})
        }

        con.query(`select * from entry where fk_challenge_id = ${con.escape(req.body.challengeId)} and day = ${con.escape(req.body.day)}`, (err, entries) => {
            if (err) {
                return res.status(500).json({err})
            }
            if (entries.length === 0) {
                con.query(`INSERT INTO entry (fk_user_id, fk_challenge_id, day, description, successful) VAlUES (${req.user.id}, ${con.escape(req.body.challengeId)}, ${con.escape(req.body.day)}, ${con.escape(req.body.description)}, ${con.escape(req.body.successful)})`, (err, _result) => {
                    con.release()
                    if (err) {
                        return res.status(500).json({err})
                    }
                    return res.json({
                        status: 1, header: "Worked", message: "Added entry " + req.body.day + " succesfully"
                    })
                })
            } else {
                con.query(`update entry set description = ${con.escape(req.body.description)}, successful = ${con.escape(req.body.successful)} where fk_challenge_id = ${con.escape(req.body.challengeId)} and day = ${con.escape(req.body.day)} and fk_user_id = ${req.user.id}`, (err, _result) => {
                    con.release()
                    if (err) {
                        return res.status(500).json({err})
                    }
                    return res.json({
                        status: 1, header: "Worked", message: "Added entry " + req.body.day + " succesfully"
                    })
                })
            }
        })


    })
})

router.get("/getAllEntries", auth, (req, res) => {
    database.getConnection((_err, con) => {
        con.query(`select e.day, e.description, e.successful, c.name as challenge_name, u.username from entry e inner join challenge c on c.id = e.fk_challenge_id inner join user u on u.id = c.fk_user_id order by e.timestamp desc`, (err, challenge) => {
            con.release();
            if (err) {
                return res.status(500).json({err})
            }
            return res.send(challenge);
        })
    })
})

module.exports = router