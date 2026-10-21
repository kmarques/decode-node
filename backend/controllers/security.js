import { User } from "../models/db/index.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export default {
    login: async (req, res, next) => {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: { email }
        });

        if (!user) return res.sendStatus(401);

        if (!(await bcrypt.compare(password, user.password)))
            return res.sendStatus(401);

        const token = jwt.sign({
            sub: user.id
        }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });

        res.json({
            token
        });
    }
}