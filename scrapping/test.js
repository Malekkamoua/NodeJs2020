const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const $ = require('cheerio');
const Link = require('../models/Link');
const primarySearchLink = require("../models/PrimaryResearch")

puppeteerExtra.use(pluginStealth());

function run (link) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteerExtra.launch({
                args: ['--no-sandbox']
            })
            const page = await browser.newPage();
            await page.goto(link.title, {
                waitUntil: 'load',
                timeout: 0
            });
            let urls = await page.evaluate((html) => {

                let documents = [];

                $(".job-listing > .job-listing-details > .job-listing-description > h3 > a", html).each(function () {
    
                    let url = $(this).attr('href');
                    let image_src = $(this).parent().parent().prev().find("img").attr('src');

                    const new_link = new Link({
                        title: url,
                        image: image_src,
                        keywords: keywords,
                        user_id: user_id
                    });

                    document.save(function (err) {
                        if (err) {
                            console.log("erreur " + err)
                        } else {
                            console.log("Un nouveau lien est ajouté")
                            resolve(document)
                        }
                    });

                    documents.push(new_link)

                });

                return documents;
            })
            browser.close();
            return resolve(urls);
        } catch (e) {
            return reject(e);
        }
    })
}


// run().then(console.log).catch(console.error);

async function linkScraper() {

    const promises = [];
    let job_links_array = [];

    const allObjects = await primarySearchLink.find()

    if (allObjects.length == 0) {
        console.log("primarySearch Collection is empty")
        return
    }

    allObjects.forEach(linkDoc => {

        linkDoc.links.forEach(url => {
            job_links_array.push({
                "user_id": linkDoc.user_id,
                "keywords": linkDoc.keywords,
                "title": url
            })
        });

        primarySearchLink.findOneAndDelete({
            "_id": linkDoc.id
        }, function (error, docs) {
            if (error) {
                console.log(error);
            } else {
                console.log(" --link-- from primaryResearch Collection is deleted ")
                console.log(docs);
            }
        });

    });

    if (job_links_array.length != 0) {
        for (let i = 0; i < job_links_array.length; ++i) {
            promises.push(run(job_links_array[i]));
        }

        Promise.all(promises)
            .then((results) => {
                console.log("All done", results);
            })
            .catch((error) => {
                console.log(error)
            });
    }
}

module.exports = linkScraper;