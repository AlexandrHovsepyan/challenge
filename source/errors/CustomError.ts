export abstract class CustomError extends Error {

    public status: number;
    public message: string;
    public code: string;
    public name: string;
    public data: {}

    protected constructor(name: string, data?: {}) {
        super();

        if (data) {
            this.data = data;
        }

        this.name = name;
        Error.captureStackTrace(this, this.constructor);
    }

    protected getStatus(): number {
        return 400;
    }
}
