import { Router } from "express";
import ArticleController from "../controllers/articles.js";

const router = new Router();

// Collection routes
router.get("/articles", ArticleController.cget);
router.post("/articles", ArticleController.create);

// Item routes
router.get("/articles/:id", ArticleController.get);
router.patch("/articles/:id", ArticleController.update);
router.delete("/articles/:id", ArticleController.delete);

// Action routes
// router.post("/login", SecurityController.login);

export default router;