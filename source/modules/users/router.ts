import * as express from "express";
import { userControllerInstance } from "app/modules/users/controller";

export const userRouter: express.Router = express.Router();

userRouter.get("/", userControllerInstance.authenticatedUsers);

