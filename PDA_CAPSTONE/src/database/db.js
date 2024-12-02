const mongoose = require('mongoose')
const env = require('dotenv');
env.config();
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => console.log("database connection successfull")).catch((err) => console.log("error database ", err.message))