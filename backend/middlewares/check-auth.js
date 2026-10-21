import jwt from "jsonwebtoken";
import { User } from "../models/db/index.js";

class CheckAuthError extends Error { }

export default function ({ allowAnonymous = false } = {}) {
    return async function checkAuth(req, res, next) {
        try {
            const header = req.headers['Authorization'] ?? req.headers['authorization'];
            if (!header) throw new CheckAuthError();

            const [type, token] = header.split(/\s+/);

            if (type !== "Bearer") throw new CheckAuthError();

            const { sub } = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(sub);

            if (!user) throw new CheckAuthError();
            req.user = user;

            next();
        } catch (error) {
            console.error(error);
            return allowAnonymous ? next() : res.sendStatus(401);
        }
    }
}