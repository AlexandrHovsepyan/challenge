import { NextFunction, Request, Response } from "express";
import UserService from "app/services/UserService";
import { generateToken } from "app/utils/jwt-token";

class AuthController {

    public async signUp(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            if (!Object.keys(req.body).length) {
                return res.status(400).json({
                    success: false,
                    message: "Empty request body"
                });
            }

            const user = await UserService.instance.create(req.body);
            const token = generateToken(user.email);
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

            const user = await UserService.instance.singIn(req.body);
            const token = generateToken(user.email);
            return res.status(200).json({
                success: true,
                token
            });
        } catch (error) {
            next(error);
        }
    }
}

export let authControllerInstance = new AuthController();
