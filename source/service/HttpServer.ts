import * as express from "express";
import * as morgan from "morgan";
import { IStartManager } from "../utils/IStartManager";

export class HttpServer implements IStartManager {
    private static instance: HttpServer;
    private app: express.Application;
    private readonly _port: number;

    constructor(enforce: () => void) {
        if (enforce !== Enforce) {
            throw new Error("HttpServer is singletone");
        }

        this._port = +process.env.APP_PORT || 3001;
    }

    public static getInstance(): HttpServer {
        if (HttpServer.instance == null) {
            HttpServer.instance = new HttpServer(Enforce);
        }

        return HttpServer.instance;
    }

    public get port(): number {
        return this._port;
    }

    public get expressApp(): express.Application {
        return this.app;
    }

    public start(): void {
        if (!this.app) {
            this.app = express();
            this.app.use(morgan("dev"));

            this.app.listen(this.port, () => {
                console.log(`Server is running in http://localhost:${this.port}`);
            });
        } else {
            throw new Error("HttpServer: You can call 'start' function only once");
        }
    }
}

function Enforce() {}