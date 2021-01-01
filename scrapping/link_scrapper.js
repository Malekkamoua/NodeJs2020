const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const $ = require('cheerio');
const Link = require('../models/Link')

const url = 'https://www.talents.tn/listing?location=Tout+Tunisia&latitude=&longitude=&placetype=country&placeid=TN&keywords=web&cat=&subcat=&page=1';

puppeteerExtra.use(pluginStealth());

async function configureBrowser() {

    //puppeteerExtra used to avoid being blocked from the scrapped website
    const browser = await puppeteerExtra.launch({
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'load', timeout: 0});
    return page;

}

async function getAllLinks(page) {
    return new Promise(async (resolve) => {

        await page.reload();
        let html = await page.evaluate(() => document.body.innerHTML);

        $(".job-listing > .job-listing-details > .job-listing-description > h3 > a", html).each(function () {

            let result = $(this).attr('href');
            let image_src = $(this).parent().parent().prev().find("img").attr('src');

            const document = new Link({
                title: result,
                image : image_src
            });

            document.save(function (err) {
                if (err) {
                    console.log("erreur " + err)
                } else {
                    console.log("Un nouveau lien est ajouté")
                    resolve(document)
                }
            });
            
        });
    });
}

async function startTracking() {
    try {
        let page = await configureBrowser();
        await getAllLinks(page);
    } catch (error) {
        console.log(error)
    }
}

module.exports = startTracking;