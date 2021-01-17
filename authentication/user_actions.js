const router = require("express").Router()
const jwt = require("jsonwebtoken")
const multer = require('multer')
const path = require('path');
const EventEmitter = require('events');

const User = require("../models/User")
const primaryResearch = require("../models/PrimaryResearch");
const JobOffer = require("../models/JobOffer");

//Uploading cv
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'application/pdf') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

router.post('/upload', upload.single('cv'), async (req, res, next) => {

    let token = req.header('auth-token');
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);

    User.findOneAndUpdate({
            "_id": payload.id
        }, {
            "$set": {
                "cv": req.file.path
            }
        },
        function (err, updatedObject) {
            if (err) {
                console.log(err)
                return res.status(500).send(err)

            } else {
                console.log(updatedObject)
                return res.status(200).send(updatedObject)
            }
        });
});

//Submitting reaserch + keyword to scraper
router.post('/search', (req, res) => {

    let token = req.header('auth-token');
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    const myEmitter = new EventEmitter();

    let req_words = req.body.link.split(" ");
    let req_keywords = req.body.keywords.split(" ");
    let pages = parseInt(req.body.pages) + 1;

    if (pages > myEmitter.getMaxListeners()) {
        pages = myEmitter.getMaxListeners()
    }

    let words_concat = req_words.join("+")

    let links_array = []

    for (let i = 1; i < pages; i++) {
        links_array.push(`https://www.talents.tn/listing?location=Tout+Tunisia&latitude=&longitude=&placetype=country&placeid=TN&keywords=${words_concat}&cat=&subcat=&page=${i}`)
    }

    const document = new primaryResearch({
        "links": links_array,
        "keywords": req_keywords,
        "user_id": payload.id
    });

    document.save(function (err) {
        if (err) {
            console.log(err)
        }
        console.log("Success")
    });
    res.send(`document added to collection`)
});

module.exports = router
