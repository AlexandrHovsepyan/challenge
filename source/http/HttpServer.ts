import * as express from "express";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { authRouterInstance } from "app/modules/auth/router";
import { userRouter } from "app/modules/users/router";
import { IStartManager } from "app/types/IStartManager";
import  SocketController  from "app/lib/socket";

export class HttpServer implements IStartManager {
    private static instance: HttpServer;
    private app: express.Application;
    private readonly _port: number;
    private io: Server;
    private server;

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
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({ extended: true }));

            this.server = createServer(this.app);
            new SocketController(new Server(this.server));

            this.app.use("/auth", authRouterInstance.router);
            this.app.use("/users", userRouter);
            this.app.use("/", (req, res, next) => {
                res.sendFile("/home/client.html");
            });

            this.app.use((error, req, res, next) => {
                //todo must improved (Error classes and statuses)
                res.status(error.status || 500).json({
                    message: "Something went wrong",
                    error: error.message || error
                });
            });

            this.server.listen(this.port, () => {
                console.log(`Server is running in http://localhost:${this.port}`);
            });
        } else {
            throw new Error("HttpServer: You can call 'start' function only once");
        }
    }
}

function Enforce() {}