import * as async from "async";
import * as dotenv from "dotenv";
dotenv.config();
import { HttpServer } from "./source/service/HttpServer";
import { postgresManagerInstance } from "./source/db/PostgresManager";
import { IStartManager } from "./source/utils/IStartManager";

async.eachSeries([
    postgresManagerInstance,
    HttpServer.getInstance()
], async (item: IStartManager, callback: (error?: Error) => void) => {
    try {
        await item.start();
        callback(null);
    } catch (error) {
        callback(error);
    }
}, (error: Error) => {
    if (error) {
        console.error("Service could not be started: ", error);
    } else {
        console.log(`Service running on port ${HttpServer.getInstance().port}`);
    }
});