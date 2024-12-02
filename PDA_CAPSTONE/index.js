require('./src/database/db.js');
const express = require('express')
const env = require('dotenv')
const router = require('./src/router/route.js')
env.config();
const app = express()
const port = process.env.PORT || 8080
app.use(express.json());
app.use('/', router)



app.listen(port, (err) => err ? console.log("The server is not initialized") : console.log(`server initialized at http://localhost:${port}/`))