import { User, Article } from "../models/db/index.js";

export default {
    cget: async (req, res) => {
        const { page, itemsPerPage, sort, ...filters } = req.query;
        const params = {};

        if (sort) {
            const direction = sort[0] === "-" ? -1 : 1;
            const key = sort[0] === "-" ? sort.slice(1) : sort;
            params.order = [[key, direction]];
        }

        if (page) {
            params.offset = (Number(page) - 1) * Number(itemsPerPage);
            params.limit = Number(itemsPerPage);
        }

        const result = await User.findAll({
            where: filters,
            ...params,
            include: [
                { model: Article, as: "articles" }
            ]
        });

        res.json(result);
    },
    create: async (req, res, next) => {
        try {
            console.log("User connected", req.user);
            const user = await User.create(req.body);
            res.status(201).json(user);
        } catch (err) {
            //if (err instanceof Sequelize.ValidationError) {
            //   
            //}
            next(err);
        }
    },
    get: async (req, res) => {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.sendStatus(404);
        res.json(user);
    },
    update: async (req, res, next) => {
        try {
            const [nbUpdated, [user]] = await User.update(req.body, {
                where: { id: req.params.id },
                returning: true,
                individualHooks: true,
                toto: true
            });

            if (!nbUpdated) return res.sendStatus(404);

            res.json(user);
        } catch (error) {
            next(error)
        }
    },
    delete: async (req, res) => {
        const nbDeleted = await User.destroy({
            where: { id: req.params.id }
        });

        if (!nbDeleted) return res.sendStatus(404);

        res.sendStatus(204);
    },
}