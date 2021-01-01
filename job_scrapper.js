const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const sendNotification = require('./notification');
const Link = require('./models/link');
const JobOffer = require('./models/jobOffer');

puppeteerExtra.use(pluginStealth());

function doSomethingAsync(value) {
    return new Promise((resolve) => {

        console.log("Value ---------- "+ value);

        let job_description;
        let job_title
        let job_contract_type
        let job_salary
        let job_location
        let job_email

        setTimeout(() => {
            puppeteerExtra
                .launch({
                    args: ['--no-sandbox']
                })
                .then(function (browser) {
                    return browser.newPage();

                })
                .then(function (page) {

                    return page.goto(value, {waitUntil: 'load', timeout: 0}).then(function () {
                        return page.content();
                    });

                })
                .then(function (html) {
                    $(".user-html", html).each(function () {
                        job_description = $(this).text();
                    });

                    if (job_description.indexOf("@") != -1) {

                        let foundEmails = [];
                        let emailRegex = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)[a-zA-Z]{2,}))/;

                        while (match = emailRegex.exec(job_description)){
                            //-- store in array the found match email
                            foundEmails.push(match[0]);
                            //-- remove the found email and continue search if there are still emails
                            job_description = job_description.replace(match[0],"")
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

                        const document = new JobOffer({
                            job_link: value,
                            title: job_title,
                            description: job_description,
                            entreprise_email: job_email,
                            salaire: job_salary,
                            emplacement: job_location,
                            contract: job_contract_type
                        });

                        document.save(function (err) {
                            if (err) {
                                console.log("erreur " + err)
                            } else {
                                console.log("Potential job offer saved")
                                sendNotification(value, job_title)
                                console.log("Resolving " + document);
                            resolve(document);
                            }
                        });
                    } else {
                        console.log("job has no email address")
                    }
                })
        });

    }, Math.floor(Math.random() * 1000));
}

async function jobScraper() {

    const promises = [];
    let links_array = [];
    const allObjects = await Link.find({})
    
    if (allObjects.length == 0) {
        return 
    }

    allObjects.forEach(linkDoc => {
        links_array.push(linkDoc.title)

        Link.findOneAndDelete({"_id": linkDoc.id}, function (error, docs) { 
            if (error){ 
                console.log(error);
            } 
            else{
                console.log("deleted object") 
                console.log(docs);
            } 
        }); 
    });
    
    console.log(links_array)

    if (links_array.length != 0) {
        for (let i = 0; i < links_array.length; ++i) {
            promises.push(doSomethingAsync(links_array[i]));
        }

        Promise.all(promises)
        .then((results) => {
            console.log("All done", results);
        })
        .catch((e) => {
            // Handle errors here
        });
    }
}

module.exports = jobScraper;