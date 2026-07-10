const { Router } = require('express');
const { User } = require('../models');
const checkAuth = require('../middlewares/check-auth');
const Author = require('../models/mongo/author');

const router = new Router();

const users = [];

// Collection routes
router.get('/', checkAuth(), async (req, res, next) => {
    // console.log(req.user);
    const filteredUsers = await User.findAll({
        where: req.query
    });

    res.status(200).json(filteredUsers);
});

router.post('/', checkAuth(true), async (req, res, next) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json(newUser);
    } catch (e) {
        next(e);
    }
});

// Item routes
router.get('/:id', async (req, res, next) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
        res.json(user);
    } else {
        res.sendStatus(404);
    }
});

router.delete('/:id', async (req, res, next) => {
    const nbDeleted = await User.destroy({
        where: {
            id: req.params.id
        }
    });
    if (nbDeleted) {
        res.sendStatus(204);
    } else {
        res.sendStatus(404);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const nbDeleted = await User.destroy({ where: { id: req.params.id } });
        const userUpdated = await User.create({
            ...req.body,
            id: req.params.id
        });
        res.status(nbDeleted ? 200 : 201).json(userUpdated);
    } catch (e) {
        next(e);
    }
});

router.patch('/:id', async (req, res, next) => {
    try {
        const [nbUpdated, [user]] = await User.update(req.body, {
            where: {
                id: req.params.id
            },
            returning: true,
            individualHooks: true
        });
        if (nbUpdated) {
            // For MySQL
            //const user = await User.findByPk(req.params.id);
            res.json(user);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

// SubCollection route /users/:id/articles <==> /articles?ownerId=:id
router.get('/:id/articles', (req, res, next) => {
    const user = users.find(u => u.id === req.params.id);
    if (user) {
        res.json(user.articles ?? []);
    } else {
        res.sendStatus(404);
    }
});

const subscribers = [];

function notifySubscribers(data) {
    subscribers.forEach(res => res.write(`data: ${JSON.stringify(data)}\n\n`));
}

router.get('/subscribe', async (req, res, next) => {
    subscribers.push(res);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    try {
        const initialAuthors = await Author.find({});
        res.write(`data: ${JSON.stringify({ operationType: 'initial', data: initialAuthors })}\n\n`);
    } catch (err) {
        console.error("Error fetching initial authors:", err);
    }

    const watcher = Author.watch([
        /** aggregate pipeline **/
    ], { fullDocument: 'updateLookup' }).on('change', (change) => {
        console.log(change);
        notifySubscribers(change);
    });

    req.on('close', () => {
        subscribers.splice(subscribers.indexOf(res), 1);
        watcher.close();
    });
});

module.exports = router;