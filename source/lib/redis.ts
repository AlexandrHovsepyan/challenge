import * as redis from "redis";
import { promisify } from "util";

class CacheService {
    public client: redis.RedisClient;
    private readonly _set: (key: string, value: string) => Promise<string>;
    private readonly _get: (key: string) => Promise<string>;

    constructor() {
        this.client = redis.createClient({
           port: +process.env.REDIS_PORT,
           host: process.env.REDIS_HOST
        });

        this.client.on("error", (error: Error) => {
            console.error("CacheService Error: " + error);
        });

        this._set = promisify(this.client.set).bind(this.client);
        this._get = promisify(this.client.get).bind(this.client);
    }

    public set(key: string, value: string): Promise<string> {
        return this._set(key, value);
    }

    public get(key: string): Promise<string> {
        return this._get(key);
    }
}

export let cacheServiceInstance = new CacheService();