#! /usr/bin/env node

const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs/promises');
const { URL } = require('node:url');
const { JSDOM } = require('jsdom');
const Papaparse = require('papaparse');

class Writer {
    async write() {
        throw new Error('write method must be implement');
    }
}

class JSONWriter extends Writer {
    #filename;

    constructor(filename) {
        super();
        this.#filename = filename;
    }

    async write(content) {
        await fs.writeFile(this.#filename, JSON.stringify(content));
    }
}

class CSVWriter extends Writer {
    #filename;

    constructor(filename) {
        super();
        this.#filename = filename;
    }

    async write(content) {
        const dataString = Papaparse.unparse(content);
        await fs.writeFile(this.#filename, dataString);
    }
}

class Scrapper {
    #url;
    #options;
    #processor;
    #writer;

    constructor(url, options = {}) {
        this.#url = new URL(url);
        this.#options = options;
    }

    #getClient() {
        if (this.#url.protocol === 'http:') {
            return http;
        }
        return https;
    }
    #request() {
        return new Promise((resolve) => {
            const client = this.#getClient();
            client.request(this.#url, this.#options, function (response) {
                let chunks = [];
                response.on('data', function (chunk) {
                    // console.log(`Data. [${buffer.length}]  %%%%%%%%%%%%%%. `, buffer.toString());
                    chunks.push(chunk);
                })

                response.on('end', function () {
                    // console.log("Socket ended");
                    resolve({
                        headers: response.headers,
                        statusCode: response.statusCode,
                        body: Buffer.concat(chunks, chunks.reduce((acc, chunk) => acc + chunk.length, 0))
                    });
                })
            }).end();
        })
    }

    async #parse(response) {
        const contentType = response.headers["Content-Type"] ?? response.headers['content-type'];
        if (!contentType) {
            throw new Error('No content-type header received');
        }
        if (/^application\/([\w]+\+)?json/.test(contentType)) {
            return JSON.parse(response.body);
        }
        if (/^text\/html|application\/xhtml\+xml/.test(contentType)) {
            return new JSDOM(response.body).window.document;
        }
        throw new Error(`Unsupported content type: ${contentType}`);
    }

    setProcessor(callback) {
        this.#processor = callback;

        return this;
    }

    setWriter(writer) {
        if (writer instanceof Writer) {
            this.#writer = writer
        } else {
            throw new Error('argument not a valid Writer');
        }

        return this;
    }

    async start() {
        console.log(`Starting scrapper for ${this.#url}`);
        const response = await this.#request();
        if (response.statusCode === 200) {
            const parsedBody = await this.#parse(response);
            let result = this.#processor(parsedBody);
            if (result instanceof Promise) {
                result = await result;
            }
            await this.#writer.write(result);
        }
    }


}


// const scrapper = new Scrapper('https://www.google.com', "google.html");
// scrapper.start();
// const scrapperImage = new Scrapper('https://neptunet.fr/wp-content/uploads/2019/08/cropped-banner22.jpg', "poseidon.jpg");
// scrapperImage.start();
// const scrapperImageSVG = new Scrapper('https://upload.wikimedia.org/wikipedia/commons/8/8d/OSI_Model_v1.svg', "osi.svg");
// scrapperImageSVG.start();

new Scrapper('http://openlibrary.org/query.json?type=/type/edition&limit=10&*=', "ol.json")
    .setProcessor(async function (parsedBody) {
        return parsedBody.map(book => ({
            id: book.key.split("/").pop(),
            title: book.title,
            publicationYear: parseInt(book.publish_date, 10),
            authorIds: book.authors.map(author => author.key.split("/").pop()),
            isbn: book.isbn_13
        }))
    })
    .setWriter(new JSONWriter("ol.json"))
    .start();


new Scrapper('https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP', {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    }
})
    .setProcessor(async function (document) {
        const fields = document.querySelectorAll('table.wikitable tbody tr:not(:first-child) > th, table.wikitable tbody tr:not(:first-child) > td:first-of-type, table.wikitable tbody tr:not(:first-child) > td:last-of-type');
        let result = [];
        for (let i = 0; i < fields.length; i += 3) {
            const code = fields[i].textContent.trim();
            const name = fields[i + 1].textContent.trim();
            const description = fields[i + 2].textContent.trim();
            result.push({
                code: parseInt(code, 10),
                name,
                description
            })
        }
        return result;
    })
    .setWriter(new CSVWriter("http-codes.csv"))
    .start();

