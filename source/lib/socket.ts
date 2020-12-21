import { Server, Namespace, Socket} from "socket.io";
import { createAdapter } from "socket.io-redis";
import { verify } from "jsonwebtoken";
import { cacheDbInstance } from "app/lib/cacheDb";

export default class SocketController {
    private readonly socket: Server;
    private challenge: Namespace;

    constructor(io: Server) {
        this.socket = io;
        this.challenge = this.socket.of("/challenge");
        this.socket.adapter(createAdapter({
            pubClient: cacheDbInstance.cacheServiceClient,
            subClient: cacheDbInstance.cacheServiceClient.duplicate()
        }));
        this.emmitConnection();
    }

    public static attach(io: Server): void {
        new this(io);
    }

    public get io(): Server {
        return this.socket;
    }

    public socketAuthentication(socket: Socket, next: Function) {
        const token = (socket.handshake.query as { token?: string }).token;
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
        this.challenge.use(this.socketAuthentication);

        this.challenge.on("connection", async (socket: Socket) => {
            let userEmail = (socket as { userEmail?: string }).userEmail;
            console.log("connection", userEmail);
            await cacheDbInstance.saveInCache(userEmail, socket.id);

            socket.on("onlineUsers", async () => {
                let onlineUsers = await cacheDbInstance.getKeysFromCache();
                let indexOfCurrentUser = onlineUsers.indexOf(userEmail);
                onlineUsers.splice(indexOfCurrentUser, 1);
                socket.emit("onlineUsersList", JSON.stringify(onlineUsers));
            });

            socket.on("disconnect", async () => {
                await cacheDbInstance.removeKeyFromCache(userEmail);
                console.log("disconnect", userEmail);
            });
        });
    }
}

