const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const $ = require('cheerio');
const Link = require('../models/Link');
const primarySearchLink = require("../models/PrimaryResearch")

puppeteerExtra.use(pluginStealth());

function scrape(link, keywords, user_id) {
    return new Promise((resolve) => {

        Link.findOneAndDelete({
            "_id": link.id
        }, function (error, docs) {
            if (error) {
                console.log(error);
            } else {
                console.log(" --link-- from Link Collection is deleted ")
                console.log(docs);
            }
        });

        setTimeout(() => {
            puppeteerExtra
                .launch({
                    args: ['--no-sandbox']
                })
                .then(function (browser) {
                    return browser.newPage();

                })
                .then(function (page) {

                    return page.goto(link.title, {
                        waitUntil: 'load',
                        timeout: 0
                    }).then(function () {
                        return page.content();
                    });

                })
                .then(function (html) {
                    $(".job-listing > .job-listing-details > .job-listing-description > h3 > a", html).each(function () {

                        let result = $(this).attr('href');
                        let image_src = $(this).parent().parent().prev().find("img").attr('src');

                        const document = new Link({
                            title: result,
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

                    });
                })
        });

    }, Math.floor(Math.random() * 1000));
}

async function linkScraper() {

    const promises = [];
    let job_links_array = [];
    let job_keyword_array = [];
    let users_id = []

    const allObjects = await primarySearchLink.find({})

    if (allObjects.length == 0) {
        console.log("primarySearch Collection is empty")
        return
    }

    allObjects.forEach(linkDoc => {

        job_links_array.push({
            "id": linkDoc.id,
            "title":linkDoc.link
        })
        job_keyword_array.push(linkDoc.keywords)
        users_id.push(linkDoc.user_id)

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

    console.log(job_keyword_array)

    if (job_links_array.length != 0) {
        for (let i = 0; i < job_links_array.length; ++i) {
            promises.push(scrape(job_links_array[i], job_keyword_array[i], users_id[i]));
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