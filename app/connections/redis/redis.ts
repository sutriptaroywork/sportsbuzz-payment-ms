import ConnectionProvider, { RedisClient } from "@buzzsports/sportsbuzz11-connection-provider";

import connectionEvent from "../../events/connectionEvent";
import redisConfig from "./redisConfig";

interface Redis extends InstanceType<typeof RedisClient> {}
/**
 * creating an instance of ConnectionProvider and initialising redis
 */
const instance = new ConnectionProvider({ redis: redisConfig, connectionEvent });
const connections: Redis[] = instance.redisInit();

export const [redisClient, redisClient2]: Redis[] = connections;

export default connections;
