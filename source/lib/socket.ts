import { Server, Namespace, Socket} from "socket.io";
import { createAdapter } from "socket.io-redis";
import { verify } from "jsonwebtoken";
import { cacheServiceInstance } from "app/lib/redis";

export default class SocketController {
    private readonly socket: Server;
    private challenge: Namespace;

    constructor(io: Server) {
        this.socket = io;
        this.socket.adapter(createAdapter({pubClient: cacheServiceInstance.client, subClient: cacheServiceInstance.client.duplicate()}));
        this.emmitConnection();
    }

    public get io(): Server {
        return this.socket;
    }

    public socketAuthentication(socket: Socket, next: Function) {
        const token = (socket.handshake.auth as { token?: string }).token;
        if (token) {
            verify(token, process.env.JWT_SECRET, (err, decoded) => {
               if (err) return next(new Error('Authentication error'));
               (socket as { userEmail?: string }).userEmail = decoded.userEmail;
               next();
            });
        } else {
            next(new Error('Authentication error'));
        }
    }

    public emmitConnection(): void {
        this.socket.use(this.socketAuthentication);

        this.socket.on("connection", (socket: Socket) => {
            console.log("connection");
            socket.on("message", (message) => {
                console.log(message);
            });
        });
    }
}

