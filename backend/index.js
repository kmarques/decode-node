const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

function middlewareParseBody(req, res, next) {
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
        next();
        return;
    }
    let chunks = [];
    req.on('data', function (chunk) {
        // console.log(`Data. [${buffer.length}]  %%%%%%%%%%%%%%. `, buffer.toString());
        chunks.push(chunk);
    })

    req.on('end', function () {
        const body = Buffer.concat(chunks).toString();
        req.body = JSON.parse(body);
        next();
    });
}

app.use(middlewareParseBody);

app.get('/', (req, res, next) => {
    res.json({
        message: "Hello world",
        query: req.query,
        body: req.body
    })
});

app.delete('/', (req, res, next) => {
    res.json({
        message: "Deleted",
        query: req.query,
        body: req.body
    })
});

app.post('/', (req, res, next) => {
    console.log(
        req.method, req.path, req.url, req.originalUrl, req.baseUrl, req.query, req.params, req.body, req.headers, req.cookies, req.signedCookies
    )
    res.json({ message: "Posted", body: req.body });
});
app.put('/', (req, res, next) => {
    res.json({ message: "Put", body: req.body });
});
app.patch('/', (req, res, next) => {
    res.json({ message: "Patched", body: req.body });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});