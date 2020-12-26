import { CustomError } from "app/errors/CustomError";
// @ts-ignore

export class PageNotFound extends CustomError {
    constructor(path: string) {
        super("PageNotFound");
        this.message = `path ${path} not found!.`;
        this.status = 404;
    }
}
