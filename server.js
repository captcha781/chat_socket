require('dotenv').config()

const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const cors = require('cors')
const { initializeSocket } = require('./controllers/socket.controller')

const chatRoutes = require('./routes/routes')

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))



const server = http.createServer(app)

initializeSocket(server)

app.use('/api', chatRoutes)

mongoose.connect(process.env.DATABASE_URI).then(() => {
    console.log("Database connection successful");
    server.listen(process.env.PORT, () => {
        console.log("Server runs on port", process.env.PORT, '...');
    })
})
