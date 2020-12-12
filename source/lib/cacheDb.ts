import { cacheServiceInstance } from "app/lib/redis";

class CacheDb {
    public saveInCache(key: string, value: string): Promise<string> {
        return cacheServiceInstance.set(key, value);
    }

    public getFromCache(key: string): Promise<string> {
        return cacheServiceInstance.get(key);
    }

    public getKeysFromCache(prefix: string = "*"): Promise<string[]> {
        return cacheServiceInstance.getAllKeys(prefix);
    }

    public removeKeyFromCache(key: string): Promise<string> {
        return cacheServiceInstance.remove(key);
    }

    public clearCache(): Promise<string> {
        return cacheServiceInstance.clearDb();
    }
}

export let cacheDbInstance = new CacheDb();
