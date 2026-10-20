import { Router } from "express";
import UserController from "../controllers/users.js";

const router = new Router();

// Collection routes
router.get("/users", UserController.cget);
router.post("/users", UserController.create);

// Item routes
router.get("/users/:id", UserController.get);
router.patch("/users/:id", UserController.update);
router.delete("/users/:id", UserController.delete);

// Action routes
// router.post("/login", SecurityController.login);

export default router;