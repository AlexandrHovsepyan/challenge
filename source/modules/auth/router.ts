import * as express from "express";
import { Request, Response, NextFunction } from "express";
import  UserService  from "app/services/UserService";
import { AuthController } from "./controller";

class AuthRouter {
    public router: express.Router;

    constructor() {
        this.router = express.Router();
        this.router
            .post("/signup", this.signUp)
            .post("/signin", this.signIn);
    }

    public async signUp(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            if (!Object.keys(req.body).length) {
                return res.status(400).json({
                    success: false,
                    message: "Empty request body"
                });
            }

            const user = await UserService.create(req.body);
            const token = AuthController.generateToken(user.email);
            return res.status(201).json({
                success: true,
                token
            });
        } catch (error) {
            next(error);
        }
    }

    public async signIn(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            if (!Object.keys(req.body).length) {
                return res.status(400).json({
                    success: false,
                    message: "Empty request body"
                });
            }
            const user = await UserService.singIn(req.body);
            const token = AuthController.generateToken(user.email);
            return res.status(200).json({
                success: true,
                token
            });
        } catch (error) {
            next(error);
        }
    }
}

export let authRouterInstance = new AuthRouter();