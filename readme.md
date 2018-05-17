# site-downloader
A NodeJS application to download website's content

# Usage
1. Pull this repo
2. Run `npm install` to download dependencies
3. Run `node index.js <start_url> [download_location] [environment]` to start downloading data

# Note
This tool will perform below steps:
1. Open a website
2. Login
3. Go to target site, then download content
4. Click "next" button, then download content
5. Exit if "next" button is not available

You can pull the code and customize steps if needed.

## Environment
By default, `config.json` will be loaded as app configuration. You can specify your own environment to load appropriate file
e.g. if `environment=local`, `config.local.json` will be loaded.

# Tehnologies used
- [puppeteer](https://github.com/GoogleChrome/puppeteer)