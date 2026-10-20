import express from "express";
import userRouter from "./routes/users.js";
import articleRouter from "./routes/articles.js";

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

app.use(userRouter);
app.use(articleRouter);

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

// Correction TP2
const movies = [
    {
        id: "1",
        title: "Inception",
        director: "Christopher Nolan",
        year: 2010,
        genre: "Science-Fiction",
        rating: 8.8,
        isAvailable: true
    },
    {
        id: "2",
        title: "The Matrix",
        director: "The Wachowskis",
        year: 1999,
        genre: "Science-Fiction",
        rating: 8.7,
        isAvailable: false
    },
    {
        id: "3",
        title: "The Godfather",
        director: "Francis Ford Coppola",
        year: 1972,
        genre: "Crime",
        rating: 9.2,
        isAvailable: true
    },
    {
        id: "4",
        title: "The Dark Knight",
        director: "Christopher Nolan",
        year: 2008,
        genre: "Action",
        rating: 9.0,
        isAvailable: false
    },
    {
        id: "5",
        title: "Pulp Fiction",
        director: "Quentin Tarantino",
        year: 1994,
        genre: "Crime",
        rating: 8.9,
        isAvailable: true
    }
];

const reviews = [
    {
        id: "1",
        movieId: "1",
        rating: 5,
        comment: "Excellent!"
    },
    {
        id: "2",
        movieId: "1",
        rating: 4,
        comment: "Très bon film"
    },
    {
        id: "3",
        movieId: "2",
        rating: 5,
        comment: "Un chef-d'œuvre"
    },
    {
        id: "4",
        movieId: "3",
        rating: 5,
        comment: "Un classique du cinéma"
    },
    {
        id: "5",
        movieId: "4",
        rating: 5,
        comment: "Un film culte"
    },
    {
        id: "6",
        movieId: "5",
        rating: 5,
        comment: "Un film incontournable"
    }
];

app.get('/api/movies/:id', (req, res) => {
    const { id } = req.params;
    // => const id = req.params.id;

    const movie = movies.find(mov => mov.id === id);

    if (!movie) return res.sendStatus(404);

    res.json(movie);
});

app.get('/api/movies/:movieId/reviews/:reviewId', (req, res) => {
    const { movieId, reviewId } = req.params;

    const movie = movies.find(mov => mov.id === movieId);
    if (!movie) return res.sendStatus(404);

    const review = reviews.find(rev => rev.id === reviewId && rev.movieId === movieId);
    if (!review) return res.sendStatus(404);

    res.json(review);
});

app.get('/api/movies', (req, res) => {
    const { page, itemsPerPage, sort, ...filters } = req.query;

    let result = movies.filter(movie => {
        for (let key in filters) {
            if (key === "minRating") {
                if (movie.rating < filters[key]) return false;
            } else if (key === 'available') {
                if (movie.isAvailable !== filters[key]) return false;
            } else if (key === "search") {
                if (!
                    [movie.director.toLowerCase(), movie.title.toLowerCase()]
                        .some(item => item.includes(filters[key].toLowerCase())
                        )) return false;
            }
            else if (movie[key].toLowerCase() !== filters[key].toLowerCase()) return false;
        }
    });

    if (sort) {
        const direction = sort[0] === "-" ? -1 : 1;
        const key = sort[0] === "-" ? sort.slice(1) : sort;
        result = result.sort((movieA, movieB) => movieB[key].toLocalCompare(movieA[key]) * direction);
    }

    if (page) {
        const indexStart = (page - 1) * itemsPerPage;
        const indexEnd = page * itemsPerPage;
        result = result.slice(indexStart, Math.min(indexEnd, movies.length));
    }

    res.json(result);
});

app.listen(PORT, () => console.log("Server listening on port " + PORT));