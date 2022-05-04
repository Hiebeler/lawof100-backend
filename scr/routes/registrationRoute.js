const express = require('express')
const router = express.Router()
const database = require('../database')
const bcrypt = require('bcrypt')
const mailer = require('nodemailer')

const pwStrength = /^(?=.*[A-Za-z])(?=.*\d)[\S]{6,}$/ // mindestens 6 Stellen && eine Zahl && ein Buchstabe

function sendMail(to, subject, text) {
    const transporter = mailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'emanuel.hiebeler@gmail.com',
            pass: 'qunduvhholqxgrxx'
        }
    })

    const mailOptions = {
        from: 'emanuel.hiebeler@gmail.com',
        to: to,
        subject: subject,
        text: text
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Email konnte nicht gesendet werden:')
            console.log(error)
        } else {
            console.log('Mail was sent.')
            console.log(info)
        }
    })
}

router.post('/register', async (req, res) => {
    database.getConnection((_err, con) => {
        if (!req.body.email || !req.body.username || !req.body.password1 || !req.body.password2) {
            con.release()
            return res.json({header: 'Error', message: 'Empty fields!'})
        } else if (!pwStrength.test(req.body.password1)) {
            con.release()
            return res.json({
                header: 'Error',
                message: 'The password must be at least 6 characters long. There must be at least one letter and one number.'
            })
        } else if (req.body.password1 !== req.body.password2) {
            con.release()
            return res.json({header: 'Error', message: 'Passwords are not the same!'})
        }

        con.query(`SELECT * FROM user WHERE email = ${con.escape(req.body.email)} OR username = ${con.escape(req.body.username)}`, (err, user) => {
            if (err) {
                con.release()
                return res.status(401).json({err})
            } else if (user[0]) {
                con.release()
                if (user[0].email === req.body.email) {
                    return res.json({header: 'Error', message: 'This email is already used!'})
                } else {
                    return res.json({header: 'Error', message: 'This username is already used!'})
                }
            }


            const code = '0' + Math.random().toString(36).substr(2)
            console.log(code);
            bcrypt.genSalt(512, (_err, salt) => {
                bcrypt.hash(req.body.password1, salt, (_err, enc) => {
                    con.query(`
            INSERT INTO user (email, username, password, verificationcode) 
            VALUES (${con.escape(req.body.email)}, ${con.escape(req.body.username)}, ${con.escape(enc)}, ${con.escape(code)})
            `, (err, _result) => {
                        con.release()
                        if (err) {
                            return res.status(500).json({err})
                        }
                        sendMail(req.body.email, 'Email verification', 'Open this link to enable your account: https://test.xyz/verify/' + code)
                        return res.json({
                            status: 1,
                            header: 'Congrats!',
                            message: 'The user has been created. Please confirm your e-mail, it may have ended up in the spam folder. After that you can log in.'
                        })
                    })
                })
            })
        })
    })
})

router.get('/verify/:code', (req, res) => {
    database.getConnection((_err, con) => {
        con.query(`Select verified FROM user WHERE verificationcode = ${con.escape(req.params.code)}`, (err, result) => {
            if (err) {
                con.release();
                return res.status(401).json({err})
            } else if (result.length === 0 || result[0].verified === 1) {
                con.release()
                return res.status(200).json({verified: false})
            } else {
                con.query(`UPDATE user SET verified = 1, verificationcode = "" WHERE verificationcode = ${con.escape(req.params.code)}`, (err, user) => {
                    con.release()
                    if (err) {
                        return res.status(500).json(err)
                    }
                    return res.status(200).json({ verified: true })
                })
            }
        })
    })
})

module.exports = router