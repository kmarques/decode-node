const { Router } = require('express');

const router = new Router();

const users = [];

// Collection routes
router.get('/', (req, res, next) => {
    const filteredUsers = users.filter(
        user => Object
            .entries(req.query ?? {})
            .every(
                ([key, value]) => user[key] === value)
    );

    res.status(200).json(filteredUsers);
});

router.post('/', (req, res, next) => {
    try {
        const newUser = req.body;
        newUser.id = Date.now();
        users.push(newUser);
        res.status(201).json(newUser);
    } catch (e) {
        next(e);
    }
});

// Item routes
router.get('/:id', (req, res, next) => {
    const user = users.find(u => u.id === req.params.id);
    if (user) {
        res.json(user);
    } else {
        res.sendStatus(404);
    }
});

router.delete('/:id', (req, res, next) => {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        res.sendStatus(204);
    } else {
        res.sendStatus(404);
    }
});

router.put('/:id', (req, res, next) => {
    try {
        const userIndex = users.findIndex(u => u.id === req.params.id);
        const userUpdated = {
            ...req.body,
            id: req.params.id
        };

        if (userIndex !== -1) {
            users.splice(userIndex, 1, userUpdated);
        } else {
            users.push(userUpdated);
        }
        res.status(userIndex === -1 ? 201 : 200).json(userUpdated);
    } catch (e) {
        next(e);
    }
});

router.patch('/:id', (req, res, next) => {
    try {
        const user = users.find(u => u.id === req.params.id);
        if (user) {
            Object.assign(user, req.body);
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

module.exports = router;