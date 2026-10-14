import express from "express";

const PORT = process.env.PORT ?? 3000;
const app = express();

app.use(express.json());

app.get('/', (request, response, next) => {
    console.log(request, response, next);
    //response.send('Hello world');
    //response.json({
    //    code: 4
    //});
    response.setHeader('Content-Type', 'text/html');
    response.send('<h1>Hello HTML</h1>' + JSON.stringify(request.query));
});

app.get('/:id', (req, res) => {
    res.send(req.params.id);
})
app.get('/:id/:id2', (req, res) => {
    res.json(req.params);
})

//function parseBody(req, res, next) {
//    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next();
//
//    const chunks = [];
//    req.on('data', (chunk) => {
//        chunks.push(chunk);
//    });
//
//    req.on('end', async () => {
//        const data = Buffer.concat(chunks);
//        const contentType = req.headers['content-type'] ?? req.headers//['Content-Type'];
//        if (contentType === "application/json") {
//            req.body = JSON.parse(data.toString());
//        }
//        next();
//    });
//}


app.post("/", /*parseBody,*/(req, res) => {
    console.log(req, req.body);
    res.json(req.body);
});

app.listen(PORT, () => console.log("Server listening on port " + PORT));