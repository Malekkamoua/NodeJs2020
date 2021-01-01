const express = require("express")
const app = express()
const mongoose = require("mongoose")

const startTracking = require('./link_scrapper');
const jobScraper =  require('./job_scrapper')

//connecting database
mongoose.connect("mongodb+srv://Malekkamoua:NodeJsProject@nodejsproject.d97so.mongodb.net/<dbname>?retryWrites=true&w=majority",{ useNewUrlParser : true, useUnifiedTopology: true})

//Activating
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open',()=> console.log('Connected to database ------'))

app.get('/', (req, res) => res.send('Hello World ! '));


new Promise((resolve, reject) => {
    startTracking();
    resolve();
})
.then(() => {
    jobScraper();
})
.catch((err) => {
    console.log("Error ----- "+ err)
});

const port = 3000;
const server = app.listen(process.env.PORT || port, () => console.log(`Example app listening at http://localhost:${port}`));
server.timeout = 100000;