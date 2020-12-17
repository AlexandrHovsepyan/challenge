import { Router } from "express";
import { authControllerInstance } from "app/modules/auth/controller";

export const authRouter: Router = Router();

authRouter.post("/signup", authControllerInstance.signUp);

authRouter.post("/signin", authControllerInstance.signIn);
