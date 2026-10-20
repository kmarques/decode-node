import crypto from "node:crypto";

const users = [];

export default {
    cget: (req, res) => {
        const { page, itemsPerPage, sort, ...filters } = req.query;

        let result = users.filter(user => {
            for (let key in filters) {
                if (user[key].toLowerCase() !== filters[key].toLowerCase()) return false;
            }
        });

        if (sort) {
            const direction = sort[0] === "-" ? -1 : 1;
            const key = sort[0] === "-" ? sort.slice(1) : sort;
            result = result.sort((userA, userB) => userB[key].toLocalCompare(userA[key]) * direction);
        }

        if (page) {
            const indexStart = (page - 1) * itemsPerPage;
            const indexEnd = page * itemsPerPage;
            result = result.slice(indexStart, Math.min(indexEnd, users.length));
        }

        res.json(result);
    },
    create: (req, res) => {
        const userData = req.body;
        const errors = {};
        if (!userData.email) {
            errors.email = ["Must not be null or empty"];
        }
        if (!userData.password) {
            errors.password = ["Must not be null or empty"];
        }

        if (Object.entries(errors).length) {
            return res.status(422).json(errors);
        }

        userData.id = crypto.randomUUIDv7();
        userData.createdAt = Date.now();
        userData.updatedAt = Date.now();
        users.push(userData);

        res.status(201).json(userData);
    },
    get: (req, res) => {
        const { id } = req.params;

        const user = users.find(u => u.id === id);
        if (!user) return res.sendStatus(404);

        res.json(user);
    },
    update: (req, res) => {
        const { id } = req.params;
        const index = users.findIndex((u => u.id === id));
        if (index === -1) return res.sendStatus(404);

        const userData = req.body;
        const errors = {};
        if (userData.email !== undefined && userData.email === "") {
            errors.email = ["Must not be empty"];
        }
        if (userData.password !== undefined && userData.password === "") {
            errors.password = ["Must not be empty"];
        }
        if (Object.entries(errors).length) {
            return res.status(422).json(errors);
        }

        const user = {
            ...users[index],
            ...userData,
            updatedAt: Date.now()
        }
        users[index] = user;

        res.json(user);
    },
    delete: (req, res) => {
        const { id } = req.params;
        const index = users.findIndex((u => u.id === id));

        if (index === -1) return res.sendStatus(404);

        users.splice(index, 1);

        res.sendStatus(204);
    },
}