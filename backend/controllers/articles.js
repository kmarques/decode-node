import Article from "../models/db/article.js";

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

        const result = await Article.findAll({
            where: filters,
            ...params
        });

        res.json(result);
    },
    create: async (req, res, next) => {
        try {
            const article = await Article.create(req.body);
            res.status(201).json(article);
        } catch (err) {
            //if (err instanceof Sequelize.ValidationError) {
            //   
            //}
            next(err);
        }
    },
    get: async (req, res) => {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.sendStatus(404);
        res.json(article);
    },
    update: async (req, res, next) => {
        try {
            const [nbUpdated, [article]] = await Article.update(req.body, {
                where: { id: req.params.id },
                returning: true
            });

            if (!nbUpdated) return res.sendStatus(404);

            res.json(article);
        } catch (error) {
            next(error)
        }
    },
    delete: async (req, res) => {
        const [nbDeleted] = await Article.destroy({
            where: { id: req.params.id }
        });

        if (!nbDeleted) return res.sendStatus(404);

        res.sendStatus(204);
    },
}