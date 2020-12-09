import { Server, Namespace} from 'socket.io';

export default class SocketController {
    private socket: Server;

    constructor(io: Server) {
        this.socket = io;
    }
}

