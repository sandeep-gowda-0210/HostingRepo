const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.4').then(() => console.log("database connection successfull")).catch((err) => console.log("error database ", err.message))