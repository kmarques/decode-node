const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs/promises');
const { URL } = require('node:url');

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

class Scrapper {
    #url;
    #outputFilename;
    #processor;
    #writer;

    constructor(url, outputFilename) {
        this.#url = new URL(url);
        this.#outputFilename = outputFilename;
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
            client.request(this.#url, function (response) {
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
    }

    setProcessor(callback) {
        this.#processor = callback;
    }

    setWriter(writer) {
        if (writer instanceof Writer) {
            this.#writer = writer
        } else {
            throw new Error('argument not a valid Writer');
        }
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

const scrapperOpenLibrary = new Scrapper('http://openlibrary.org/query.json?type=/type/edition&limit=10&*=', "ol.json");
scrapperOpenLibrary.setProcessor(async function (parsedBody) {
    return parsedBody.map(book => ({
        id: book.key.split("/").pop(),
        title: book.title,
        publicationYear: parseInt(book.publish_date, 10),
        authorIds: book.authors.map(author => author.key.split("/").pop()),
        isbn: book.isbn_13
    }))
});
scrapperOpenLibrary.setWriter(new JSONWriter("ol.json"));
scrapperOpenLibrary.start();