import { Router } from "express";
import UserController from "../controllers/users.js";
import SecurityController from "../controllers/security.js";
import checkAuth from "../middlewares/check-auth.js";

const router = new Router();

// Collection routes
router.get("/users", checkAuth(), UserController.cget);
router.post("/users", checkAuth({ allowAnonymous: true }), UserController.create);

// Item routes
router.get("/users/:id", checkAuth(), UserController.get);
router.patch("/users/:id", checkAuth(), UserController.update);
router.delete("/users/:id", checkAuth(), UserController.delete);

// Action routes
router.post("/login", SecurityController.login);

export default router;