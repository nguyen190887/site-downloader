const puppeteer = require('puppeteer');
const fs = require('fs');

const env = process.argv[4];
const {
    headless,
    username,
    password,
    loginUrl,
    nextPageSelector,
    resourceHost,
    downloadLocation,
    usernameSelector,
    passwordSelector,
    loginButtonSelector,
    clickDelay
    } = require('./config' + (env ? `.${env}` : ''));

const decodedPassword = Buffer.from(password, 'base64').toString();

const startUrl = process.argv[2];
if (!(startUrl && startUrl.length)) {
    console.error('Please provide Start URL!');
    process.exit(1);
}

const downloadFolder = process.argv[3] || downloadLocation;
if (!fs.existsSync(downloadFolder)){
    fs.mkdirSync(downloadFolder);
}

async function enterText(page, selector, value) {
    await page.evaluate((selector, value) => {
        document
            .querySelector(selector)
            .value = value;
    }, selector, value);
};

async function click(page, selector) {
    await page.evaluate((selector) => {
        var el = document.querySelector(selector);
        if (el) {
            el.click();
        }
    }, selector);
};

var exists = async(page, selector) => await page.evaluate((selector) => document.querySelector(selector) !== null, selector);

var getHtml = async(page) => await page.evaluate(() => document.documentElement.innerHTML);

var getTitle = async(page) => await page.evaluate(() => document.title);

function saveFile(title, content, index) {
    // TODO: replace Next/Previous navigation

    content = content
        .replace(/src="\//ig, `src="${resourceHost}`)
        .replace(/href="\//ig, `href="${resourceHost}`);

    title = title.replace(/[^a-z0-9_-]/ig, '_');
    
    let filePrefix = index
        .toString()
        .padStart(3, '0');

    fs.writeFile(`${downloadFolder}/${filePrefix}-${title}.html`, content);
}

function delay(timeout) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}

(async() => {
    const browser = await puppeteer.launch({headless: headless});
    const page = await browser.newPage();

    await page.goto(loginUrl);
    
    await enterText(page, usernameSelector, username);
    await enterText(page, passwordSelector, decodedPassword);
    await click(page, loginButtonSelector);
    await delay(clickDelay);

    await page.goto(startUrl);

    let index = 1;
    saveFile(await getTitle(page), await getHtml(page), index++);

    while (await exists(page, nextPageSelector)) {
        await click(page, nextPageSelector);
        await delay(clickDelay);
        saveFile(await getTitle(page), await getHtml(page), index++);
    }

    await browser.close();
})();
