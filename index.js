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
const jobScraper = require('./scrapping/job_scrapper')
const sendNotification = require('./scrapping/notification')

const cron = require('node-cron');

//connecting database
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

//Activating
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to database ------'))

// middlewares
app.use(express.json({
    limit: '50mb'
}));
app.use(express.urlencoded({
    limit: '50mb'
}));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Authentication
app.use("/auth", authRoutes);
app.use("/user", verifyToken, userRoutes);

app.get('/', (req, res) => res.send('Hello World ! '));

cron.schedule("*/10 * * * * *", function () {
    startTracking();
    console.log("running startTracking() every 10 seconds");
});

cron.schedule("*/5 * * * * *", function () {
    jobScraper();
    console.log("running jobScrapper() every 50 seconds");
});

cron.schedule("*/20 * * * *", function () {
    sendNotification();
    console.log("running sendNotification() every 5 minutes");
});


const server = app.listen(process.env.PORT, () => console.log(`App listening at http://localhost:${process.env.PORT}`));
server.timeout = 100000;