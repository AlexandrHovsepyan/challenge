import  { CustomError } from "app/errors/CustomError";

export class ConflictError extends CustomError {

    constructor(message: string) {
        super("ConflictError");
        this.message = message;
        this.status = this.getStatus();
    }

    protected getStatus(): number {
        return 409;
    }
}
