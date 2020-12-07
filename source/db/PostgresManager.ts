import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import { User } from "../modules/users/model";
import { IStartManager } from "../utils/IStartManager";

class PostgresManager implements IStartManager {
    private postgresConnection: Connection;
    private connected: boolean = false;

    public get connection(): Connection {
        return this.postgresConnection;
    }

    public async start(): Promise<void> {
        if (this.postgresConnection != null) throw new Error("PostgresManager: You can call 'start' function only once");

        this.postgresConnection = await createConnection({
            type: "postgres",
            host: process.env.POSTGRESQL_HOST,
            port: +process.env.POSTGRESQL_PORT,
            username: process.env.POSTGRESQL_USER,
            password: process.env.POSTGRESQL_PASSWORD,
            database: process.env.POSTGRESQL_DB,
            entities: [
                User
            ],
            synchronize: true,
            logging: false
        });

        if (this.postgresConnection) {
            this.connected = true;
            console.log("PostgresManager: connected");
        }
    }
}

export let postgresManagerInstance = new PostgresManager();