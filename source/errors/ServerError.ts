import { CustomError } from "app/errors/CustomError";

export class ServerError extends CustomError {

    public static readonly INTERNAL: string = "INTERNAL";
    public static readonly REQUEST_TIMEOUT: string = "REQUEST_TIMEOUT";

    constructor(code: string, message: string) {
        super("ServerError");
        this.code = code;
        this.message = message;
        this.status = this.getStatus();
    }

    protected getStatus(): number {
        return 500;
    }
}
