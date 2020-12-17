import { Router } from "express";
import { userControllerInstance } from "app/modules/users/controller";

export const userRouter: Router = Router();

userRouter.get("/", userControllerInstance.authenticatedUsers);
