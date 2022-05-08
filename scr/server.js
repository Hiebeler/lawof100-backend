const express = require('express')
const app = express()
require('dotenv').config();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const userRoute = require('./routes/userRoute')
app.use('/user', userRoute)

const registrationRoute = require('./routes/registrationRoute')
app.use('/registration', registrationRoute)

const challengeRoute = require('./routes/challengeRoute')
app.use('/challenge', challengeRoute)

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})