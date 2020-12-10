import * as redis from "redis";
import { promisify } from "util";

class CacheService {
    public client: redis.RedisClient;

    constructor() {
        this.client = redis.createClient({
           port: +process.env.REDIS_PORT,
           host: process.env.REDIS_HOST
        });
    }
}