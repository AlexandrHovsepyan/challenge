import * as express from "express";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { createServer, Server as HttpModuleServer } from "http";
import { Server } from "socket.io";
import { authRouter } from "app/modules/auth/router";
import { userRouter } from "app/modules/users/router";
import { IStartManager } from "app/types/IStartManager";
import SocketController from "app/lib/socket";
import { error404Handler, errorPageHandler } from "app/utils/router/CommonMiddleware";

export class HttpServer implements IStartManager {
    private static instance: HttpServer;
    private app: express.Application;
    private readonly _port: number;
    private server: HttpModuleServer;

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
        if (this.app) throw new Error("HttpServer: You can call 'start' function only once");

        this.app = express();
        this.app.use(cors());
        this.app.use(morgan("dev"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        this.server = createServer(this.app);
        SocketController.attach(new Server(this.server, {
            cors: {
                origin: "*"
            }
        }));

        this.app.use("/auth", authRouter);
        this.app.use("/users", userRouter);

        this.app.use(error404Handler);
        this.app.use(errorPageHandler);

        this.server.listen(this.port, () => {
            console.log(`Server is running in http://localhost:${this.port}`);
        });
    }
}

function Enforce() {}
