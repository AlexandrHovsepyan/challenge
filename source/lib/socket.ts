import { Server, Namespace, Socket} from "socket.io";

export default class SocketController {
    private socket: Server;
    private challenge: Namespace;

    constructor(io: Server) {
        this.socket = io;
        this.emmitConnection();
    }

    public emmitConnection() {
        this.socket.on("connection", (socket: Socket) => {
            console.log("connection");
            socket.on("message", (message) => {
                console.log(message);
            });
        });
    }
}

