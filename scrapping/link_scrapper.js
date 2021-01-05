const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const $ = require('cheerio');
var Link = require('../models/Link');
const primarySearchLink = require("../models/PrimaryResearch")

puppeteerExtra.use(pluginStealth());

function scrape(primary_link) {

    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteerExtra.launch({
                headless: false,
                args: ['--no-sandbox']
            })
            const page = await browser.newPage();
            await page.goto(primary_link.title, {
                waitUntil: 'load',
                timeout: 0
            });


            let documents = [];
            let html = await page.evaluate(() => document.body.innerHTML);

            $(".job-listing > .job-listing-details > .job-listing-description > h3 > a", html).each(function () {

                let url_new_link = $(this).attr('href');
                let image_src = $(this).parent().parent().prev().find("img").attr('src');

                const new_link = new Link({
                    title: url_new_link,
                    image: image_src,
                    keywords: primary_link.keywords,
                    user_id: primary_link.user_id
                });

                new_link.save(function (err) {
                    if (err) {
                        console.log("erreur " + err)
                    } else {
                        console.log("Un nouveau lien est ajouté")
                        resolve(new_link)
                    }
                });

                documents.push(new_link)

            });


            await page.waitFor(5000);
            await browser.close();

            console.log("page scrapping ended")
            return resolve(new_link);

        } catch (e) {
            return reject(e);
        }
    })
}


async function linkScraper() {

    const promises = [];
    let job_links_array = [];
    let primary_link;

    let final = [];

    const allObjects = await primarySearchLink.find()

    if (allObjects.length == 0) {
        console.log("primarySearch Collection is empty")
        return
    }

    allObjects.forEach(linkDoc => {

        linkDoc.links.forEach(x => {
            job_links_array.push(x)
        });

        job_links_array.forEach(element => {
            primary_link = {
                'title': element,
                'keywords': linkDoc.keywords,
                'user_id': linkDoc.user_id
            }
            final.push(primary_link)
        });


        // primarySearchLink.findOneAndDelete({
        //     "_id": linkDoc.id
        // }, function (error, docs) {
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         console.log(" --link-- from primaryResearch Collection is deleted ")
        //         console.log(docs);
        //     }
        // });

    });

    final.forEach(primary_link => {
        promises.push(scrape(primary_link))
    });

    Promise.all(promises)
        .then((results) => {
            console.log("All done", results);
        })
        .catch((error) => {
            console.log(error)
        });
}


module.exports = linkScraper;