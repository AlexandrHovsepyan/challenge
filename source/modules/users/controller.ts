import UserService from "app/services/UserService";
import { isTokenValid } from "app/utils/jwt-token";
import { IUser } from "app/types/IUser";
import { NextFunction, Request, Response } from "express";

class UserController {
    public async create(requestBody: IUser) {
        try {
            let userServiceInstance = new UserService();
            return await userServiceInstance.create(requestBody);
        } catch (error) {
            throw error;
        }
    }

    public async authenticatedUsers(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            if (!isTokenValid(req.headers['authorization'])) {
                return res.status(403).json({
                    success: false,
                    message: "Empty or invalid token"
                });
            }

        } catch (error) {
            next(error);
        }
    }
}

export let userControllerInstance = new UserController();
