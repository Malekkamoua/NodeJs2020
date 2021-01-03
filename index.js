const dotenv = require("dotenv");
dotenv.config();

const express = require("express")
const app = express()
const mongoose = require("mongoose")
const path = require('path');

const authRoutes = require("./authentication/auth")
const userRoutes = require('./authentication/user_actions')
const verifyToken = require("./authentication/validate-token");

const startTracking = require('./scrapping/link_scrapper')
const jobScraper =  require('./scrapping/job_scrapper')

//connecting database
mongoose.connect( process.env.DB_URL,{ useNewUrlParser : true, useUnifiedTopology: true, useFindAndModify: false}); 

//Activating
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open',()=> console.log('Connected to database ------'))

// middlewares
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Authentication
app.use("/auth", authRoutes);
app.use("/user",verifyToken,userRoutes);

app.get('/', (req, res) => res.send('Hello World ! '));


startTracking();
//Scraping modules
// new Promise((resolve, reject) => {
//     startTracking();
//     resolve();
// })
// .then(() => {
//     jobScraper();
// })
// .then(() => {
//     sendNotification();
// })
// .catch((err) => {
//     console.log("Error ----- "+ err)
// });

const server = app.listen(process.env.PORT, () => console.log(`App listening at http://localhost:${process.env.PORT}`));
server.timeout = 100000;