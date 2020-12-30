

const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const sendNotification = require('./notification');
const Link = require('./models/link');
const JobOffer = require('./models/jobOffer')

puppeteerExtra.use(pluginStealth());

var firstLink

async function configureBrowser() {

    //puppeteerExtra used to avoid being blocked from the scrapped website
    const browser = await puppeteerExtra.launch({ args: ['--no-sandbox']});
    let page = await browser.newPage();

    const allObjects = await Link.find()
    if (allObjects.length == 0) {
        page = null;
        return page
    }
    firstLink = allObjects[0];
    console.log(firstLink.title)

    Link.findOneAndDelete({"_id": firstLink.id}, function (error, docs) { 
        if (error){ 
            console.log(error);
        } 
        else{
            console.log("deleted object") 
            console.log(docs);
        } 
    }); 

    await page.goto(firstLink.title);
    return page;
}

async function getJobs(page) {

    if (page == null) {
        console.log("No links to scrape")
        return
    }

    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);

     $(".user-html",html).each(function() {
        job_description = $(this).text();
    });

        if (job_description.indexOf("@")!= -1) {

            let job_description;
            let job_title
            let job_contract_type
            let job_salary
            let job_location
            let job_email
            
            let foundEmails =[];
            let emailRegex = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

            while (match = emailRegex.exec(job_description)){
                //-- store in array the found match email
                foundEmails.push(match[0]);
                //-- remove the found email and continue search if there are still emails
                job_description = job_description.replace(match[0],"")
            }

            job_email = foundEmails[0]

                $("#titlebar > div > div > div.col-md-7.col-sm-12 > h2",html).each(function() {
                    job_title = $(this).text();
                    console.log("Title "+job_title);
                });
            
                $("#wrapper > div.container > div > div.col-xl-8.col-lg-8.content-right-offset > div:nth-child(2) > div > div:nth-child(3) > div > h5",html).each(function() {
                    job_contract_type = $(this).text();
                    console.log("job_contract_type "+ job_contract_type);
                });
                
                $("#wrapper > div.container > div > div.col-xl-8.col-lg-8.content-right-offset > div:nth-child(1) > div > div:nth-child(3) > div > h5",html).each(function() {
                    job_salary = $(this).text();
                    console.log("salary "+job_salary);
                });
            
                $("#wrapper > div.container > div > div.col-xl-8.col-lg-8.content-right-offset > div:nth-child(1) > div > div:nth-child(1) > div > h5",html).each(function() {
                    job_location = $(this).text();
                    console.log("job_location "+job_location);
                });
    
                const document = new JobOffer({
                    job_link: firstLink.title,
                    title: job_title,
                    description: job_description,
                    entreprise_email: job_email,
                    salaire: job_salary,
                    emplacement: job_location,
                    contract: job_contract_type
                });
                
                document.save(function (err) {
                    if (err) {
                        console.log("erreur "+ err)
                    }else{
                        console.log("Potential job offer saved")
                        sendNotification(firstLink.title, job_title)
                    }
                });    
            }

        else {
            console.log("job has no email address")
            configureBrowser();
        }
}

async function selectJobs() {
    try {
        let page = await configureBrowser();
        await getJobs(page);
    } catch (error) {
        console.log(error)
    }
}

module.exports = selectJobs;
