import redis from "redis"
const redisPort = process.env.REDIS_PORT || 6379;
const client = redis.createClient(redisPort);
const esRedisGlobalKey = "ES_Global";
const esRedisExpireTime = 3600;

export default client;
export {
    esRedisGlobalKey,
    esRedisExpireTime
};
