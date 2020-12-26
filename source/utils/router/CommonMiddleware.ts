import { Request, Response, NextFunction } from "express";

import { CustomError } from "app/errors/CustomError";
import { PageNotFound } from "app/errors/PageNotFound";
import { ServerError } from "app/errors/ServerError";

export const error404Handler = (req: Request, res: Response, next: NextFunction): void => {
    next(new PageNotFound(req.path));
}

export const errorPageHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {

    if (err.code === "ETIMEDOUT") {
        err = new ServerError(ServerError.REQUEST_TIMEOUT, "Internal server request timeout");
    }

    //TODO postgres errors

    let resStatus: number = err.status || 500;
    let errResponse: { success: boolean, errors?: ErrorInfo[], data?: {} } = { success: false };
    let message: string = err.message ? err.message.replace(new RegExp("\"", "g"), "'") : "Internal Server Error";

    if (err.stack) {
        errResponse.errors = [{
            name: err.name,
            code: err.code,
            message,
            stack: typeof err.stack === "string" ? err.stack.split("\n") : err.stack
        }];

    } else {
        errResponse.errors = [{
            name: err.name,
            code: err.code,
            message
        }];
    }

    if (err.data) {
        errResponse.data = err.data;
    }

    res.status(resStatus).json(errResponse);
}

interface ErrorInfo {
    name?: string;
    code?: string;
    message?: string;
    stack?: string | string[];
}
