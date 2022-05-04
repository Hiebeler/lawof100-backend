const express = require('express')
const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const userRoute = require('./routes/userRoute')
app.use('/user', userRoute)

const registrationRoute = require('./routes/registrationRoute')
app.use('/registration', registrationRoute)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})