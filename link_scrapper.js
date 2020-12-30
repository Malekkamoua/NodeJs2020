

const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const link = require('./models/link')
const sendNotification = require('./notification');

const url = 'https://www.talents.tn/listing?location=Tout+Tunisia&latitude=&longitude=&placetype=country&placeid=TN&keywords=web&cat=&subcat=&page=1';

puppeteerExtra.use(pluginStealth());

async function configureBrowser() {

    //puppeteerExtra used to avoid being blocked from the scrapped website
    const browser = await puppeteerExtra.launch({ args: ['--no-sandbox']});
    const page = await browser.newPage();
    await page.goto(url);
    return page;

}

async function getAllLinks(page) {

    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);

    $(".job-listing > .job-listing-details > .job-listing-description > h3 > a",html).each(function() {
        let result = $(this).attr('href');
        const document = new link({title:result});
        document.save(function (err) {
            if (err) {
                console.log("erreur "+ err)
            };
            console.log("Un nouveau lien est ajouté")
        });
    });
    console.log("Links scrapping ---- done")
    return
}

// async function startTracking() {

//     const page = await configureBrowser();
  
//     let job = new CronJob('* */5 * * * *', function() { //runs every 30 minutes in this config
//         console.log("get links")
//         getAllLinks(page);
//     }, null, true, null, null, true);
//     job.start();

// }

async function startTracking() {
    try {
        let page = await configureBrowser();
        await getAllLinks(page);
    } catch (error) {
        console.log(error)
    }
}

module.exports = startTracking;