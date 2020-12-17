import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import { User } from "app/modules/users/model";
import { IStartManager } from "app/types/IStartManager";

class DbManager implements IStartManager {
    private dbConnection: Connection;
    private connected: boolean = false;

    public get connection(): Connection {
        return this.dbConnection;
    }

    public async start(): Promise<void> {
        if (this.dbConnection != null) throw new Error("DbManager: You can call 'start' function only once");

        this.dbConnection = await createConnection({
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

        if (this.dbConnection) {
            this.connected = true;
            console.log("DbManager: connected");
        }
    }
}

export let dbManagerInstance = new DbManager();
