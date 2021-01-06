const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const $ = require('cheerio');
const Link = require('../models/Link');
const JobOffer= require('../models/JobOffer')
const Notification = require('../models/Notification')
const EventEmitter = require('events');
const { exists } = require('../models/Link');

puppeteerExtra.use(pluginStealth());

function scrape(link) {

    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteerExtra.launch({
                headless: false,
                args: ['--no-sandbox']
            })
            const page = await browser.newPage();
            await page.goto(link.url, {
                waitUntil: 'load',
                timeout: 0
            });

            let documents = [];

            let job_description;
            let job_title
            let job_contract_type
            let job_salary
            let job_location
            let job_email

            
            let html = await page.evaluate(() => document.body.innerHTML);

            $(".user-html", html).each(function () {

                job_description = $(this).text();
            });

            if (job_description.indexOf("@") != -1) {

                let foundEmails = [];
                let emailRegex = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)[a-zA-Z]{2,}))/;

                while (match = emailRegex.exec(job_description)) {
                    //-- store in array the found match email
                    foundEmails.push(match[0]);
                    //-- remove the found email and continue search if there are still emails
                    job_description = job_description.replace(match[0], "")
                }

                job_email = foundEmails[0]
                console.log(job_email)

                $("#titlebar > div > div > div.col-md-7.col-sm-12> h2", html).each(function () {
                    job_title = $(this).text().trim();
                    console.log("Title " + job_title);
                });

                $("#wrapper > div.container > div > div.col-xl-8col-lg-8.content-right-offset > div:nth-child(2)> div > div:nth-child(3) > div > h5", html).each(function () {
                    job_contract_type = $(this).text().trim();
                    console.log("job_contract_type " + job_contract_type);
                });

                $("#wrapper > div.container > div > div.col-xl-8col-lg-8.content-right-offset > div:nth-child(1)> div > div:nth-child(3) > div > h5", html).each(function () {
                    job_salary = $(this).text();
                    console.log("salary " + job_salary).trim();
                });

                $("#wrapper > div.container > div > div.col-xl-8col-lg-8.content-right-offset > div:nth-child(1)> div > div:nth-child(1) > div > h5", html).each(function () {
                    job_location = $(this).text().trim();
                    console.log("job_location " + job_location);
                });

                let job;
                let exists = 0;

                link.keywords.forEach(keyword => {
                    if (job_description.indexOf(keyword) != -1) {
                        exists++
                    }
                });

                if (exists != 0) {
                    job = new JobOffer({
                        job_link: link.url,
                        title: job_title,
                        image: link.image,
                        keywords: link.keywords,
                        description: job_description,
                        entreprise_email: job_email,
                        salaire: job_salary,
                        emplacement: job_location,
                        contract: job_contract_type,
                        has_keywords: true,
                        user_id: link.user_id
                    });
                }else{
                    job = new JobOffer({
                        job_link: link.url,
                        title: job_title,
                        image: link.image,
                        keywords: link.keywords,
                        description: job_description,
                        entreprise_email: job_email,
                        salaire: job_salary,
                        emplacement: job_location,
                        contract: job_contract_type,
                        has_keywords: false,
                        user_id: link.user_id
                    });
                }
               
            
                job.save(function (err) {
                    if (err) {
                        console.log("error saving jobOffer " + err)
                    } else {
                        console.log("Potential job offer saved")

                        const email = new Notification({
                            url: link.url,
                            title: job_title,
                            user_id: link.user_id
                        });
                        email.save(function (err) {
                            if (err) {
                                console.log("error saving notification " + err)
                            };
                            console.log("Notification added")
                        });

                        documents.push(job)

                        console.log("Resolving " + job);
                        resolve(job);
                    }
                });
            } else {
                console.log("job has no email address")
            }


            await page.waitFor(5000);
            await browser.close();

            console.log("job page scrapping ended")
            return resolve(documents);

        } catch (e) {
            return reject(e);
        }
    })
}


async function jobScraper() {

    const promises = [];
    const myEmitter = new EventEmitter();

    let link;
    let links_array = []

    const allObjects = await Link.find({})

    if (allObjects.length == 0) {
        console.log("Link Collection is empty")
        return
    }


    //adding links as much as event listeners so code wont crash

    if (allObjects.length > 10) {
        counter =  myEmitter.getMaxListeners()
    }else{
        counter = allObjects.length;
    }
   
    for (let i = 0; i < counter; i++) {

        link = {
            "url": allObjects[i].title,
            "image": allObjects[i].image,
            "keywords": allObjects[i].keywords,
            "user_id": allObjects[i].user_id
        }
        links_array.push(link)

        Link.findOneAndDelete({
            "_id": allObjects[i].id
        }, function (error, docs) {
            if (error) {
                console.log(error);
            } else {
                console.log("--link-- from Link Collection is deleted ")
                console.log(docs);
            }
        });
        
    }
    
    links_array.forEach(link => {
        promises.push(scrape(link))
    });

  
    Promise.all(promises)
        .then((results) => {
            console.log("All done", results);
        })
        .catch((error) => {
            console.log(error)
        });
}



module.exports = jobScraper;