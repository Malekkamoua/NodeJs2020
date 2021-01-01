const dotenv = require("dotenv");
dotenv.config();

const express = require("express")
const app = express()
const mongoose = require("mongoose")

const authRoutes = require("./authentication/auth");
const startTracking = require('./link_scrapper');
const jobScraper =  require('./job_scrapper')

//connecting database
mongoose.connect( process.env.DB_URL,{ useNewUrlParser : true, useUnifiedTopology: true})

//Activating
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open',()=> console.log('Connected to database ------'))

// middlewares
app.use(express.json()); 

// Authentication
app.use("/user", authRoutes);

app.get('/', (req, res) => res.send('Hello World ! '));

//Scraping modules
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

const server = app.listen(process.env.PORT, () => console.log(`App listening at http://localhost:${process.env.PORT}`));
server.timeout = 100000;