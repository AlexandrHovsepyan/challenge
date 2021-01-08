import { Server, Namespace, Socket} from "socket.io";
import { createAdapter } from "socket.io-redis";
import { verify } from "jsonwebtoken";
import { cacheDbInstance } from "app/lib/cacheDb";
import { socketSource } from "app/enums/socket";

const questions = [{
    question: "question1",
    answers: ["answer1", "answer2", "answer3", "answer4"],
    rightAnswer: 1
}, {
    question: "question2",
    answers: ["answer1", "answer2", "answer3", "answer4"],
    rightAnswer: 3
}, {
    question: "question3",
    answers: ["answer1", "answer2", "answer3", "answer4"],
    rightAnswer: 2
}];

export default class SocketController {
    private readonly socket: Server;
    private challenge: Namespace;
    private gameRoomName: string;

    constructor(io: Server) {
        this.socket = io;
        this.challenge = this.socket.of("/challenge");
        this.socket.adapter(createAdapter({
            pubClient: cacheDbInstance.cacheServiceClient,
            subClient: cacheDbInstance.cacheServiceClient.duplicate()
        }));
        this.emitConnectionAndListeners();
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

    public emitConnectionAndListeners(): void {
        this.challenge.use(this.socketAuthentication);

        this.challenge.on("connection", async (socket: Socket) => {
            let userEmail = (socket as { userEmail?: string }).userEmail;
            console.log("connection", userEmail);
            await cacheDbInstance.saveInCache(userEmail, socket.id);

            socket.on(socketSource.GET_ONLINE_USERS, async () => {
                this.onlineUsersList(socket, userEmail);
            });

            socket.on(socketSource.CHALLENGE_REQUEST, (receiverEmail: string) => {
                this.sendChallengeRequest(socket, userEmail, receiverEmail);
            });

            socket.on(socketSource.APPROVE_CHALLENGE_REQUEST, (receiverEmail: string) => {
                this.makeChallenge(socket, userEmail, receiverEmail);
            });

            socket.on(socketSource.CANCEL_CHALLENGE_REQUEST, (receiverEmail: string) => {
                this.cancelChallengeRequest(socket, receiverEmail, userEmail);
            });

            socket.on(socketSource.CHOOSE_SOME_ANSWER, (questionIndex: number, answerIndex: number) => {
                this.chooseSomeAnswer(socket, questionIndex, answerIndex);
            });

            socket.on("disconnect", async () => {
                this.userDisconnected(socket, userEmail);
            });
            socket.broadcast.emit(socketSource.NEW_USER_CONNECTION, userEmail);
        });
    }

    private async onlineUsersList(socket, userEmail) {
        try {
            let onlineUsers = await cacheDbInstance.getKeysFromCache();
            let indexOfCurrentUser = onlineUsers.indexOf(userEmail);
            onlineUsers.splice(indexOfCurrentUser, 1);
            socket.emit(socketSource.ONLINE_USERS_LIST, onlineUsers);
        } catch (error) {
            this.handleError(socket, error);
        }
    }

    private async userDisconnected(socket: Socket, userEmail: string) {
        try {
            await cacheDbInstance.removeKeyFromCache(userEmail);
            this.challenge.emit(socketSource.DISCONNECT_USER, userEmail);
            console.log("disconnect", userEmail);
        } catch (error) {
            this.handleError(socket, error);
        }
    }

    private async sendChallengeRequest(socket: Socket, senderEmail: string, receiverEmail: string) {
        try {
            if (receiverEmail) {
                const receiverSocketId = await cacheDbInstance.getFromCache(receiverEmail);
                this.challenge.to(receiverSocketId).emit(socketSource.NEW_CHALLENGE_REQUEST, senderEmail);
            }
        } catch (error) {
            this.handleError(socket, error);
        }
    }

    private async makeChallenge(socket: Socket, senderEmail: string, receiverEmail: string) {
        try {
            const receiverSocketId = await cacheDbInstance.getFromCache(receiverEmail);
            const roomName = receiverEmail + senderEmail;
            socket.join(roomName);
            this.challenge.sockets.get(receiverSocketId).join(roomName);
            this.gameRoomName = roomName;
            this.challenge.to(roomName).emit(socketSource.START_GAME, questions);
        } catch (error) {
            this.handleError(socket, error);
        }
    }

    private async cancelChallengeRequest(socket: Socket, receiverEmail: string, senderEmail: string) {
        try {
            const receiverSocketId = await cacheDbInstance.getFromCache(receiverEmail);
            this.challenge.to(receiverSocketId).emit(socketSource.CHALLENGE_REQUEST_CANCELED, senderEmail);
        } catch (error) {
            this.handleError(socket, error);
        }
    }

    private chooseSomeAnswer(socket: Socket, question: number, answer: number) {
        try {
            socket.broadcast.to(this.gameRoomName).emit(socketSource.ANSWER_CHOSEN, question, answer);
        } catch (error) {
            this.handleError(socket, error);
        }
    }

    private handleError(socket: Socket, error: Error) {
        socket.emit(socketSource.SERVER_SOCKET_ERROR, {
            message: error.message || "Something went wrong",
            error
        });
    }
}

