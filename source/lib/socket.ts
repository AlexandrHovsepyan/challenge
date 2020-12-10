import { Server, Namespace, Socket} from "socket.io";
import { verify } from "jsonwebtoken";

export default class SocketController {
    private socket: Server;
    private challenge: Namespace;

    constructor(io: Server) {
        this.socket = io;
        this.emmitConnection();
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

