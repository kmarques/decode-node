const https = require('node:https');
const fs = require('node:fs/promises');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const URL = "https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP";

const request = https.request(URL, {
    headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
}, (response) => {
    const chunks = [];

    response.on('data', (chunk) => {
        chunks.push(chunk);
    });

    response.on('end', async () => {
        const data = Buffer.concat(chunks);
        const contentType = response.headers['content-type'] ?? response.headers['Content-Type'];

        // Data parser
        let parsedData;
        if (contentType.startsWith("text/")) {
            parsedData = data.toString();
            if (contentType.includes("html")) {
                parsedData = new JSDOM(parsedData).window.document;
            }
        } else if (/^application\/.*json.*/.test(contentType)) {
            parsedData = JSON.parse(data.toString());
        } else {
            parsedData = data;
        }

        // Processor
        const nodeList = parsedData.querySelectorAll('table tr:not(:first-child) th, table tr:not(:first-child) td:first-of-type');
        const processedData = {};
        for (let i = 0; i < nodeList.length; i = i + 2) {
            const code = nodeList[i].textContent.trim();
            const message = nodeList[i + 1].textContent.trim();
            processedData[code] = message;
        }

        // Storage
        const DATA_FILE_PATH = path.join(process.cwd(), 'data.json');
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(processedData, null, 2));
        console.log(`Data scrapped to file ${DATA_FILE_PATH}`);
    });
});

request.end();