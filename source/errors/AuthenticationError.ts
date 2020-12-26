import { CustomError } from "app/errors/CustomError";

export class AuthenticationError extends CustomError {

    constructor(message: string) {
        super("AuthenticationError");
        this.message = message;
        this.status = this.getStatus();
    }

    protected getStatus(): number {
        return 401;
    }
}
