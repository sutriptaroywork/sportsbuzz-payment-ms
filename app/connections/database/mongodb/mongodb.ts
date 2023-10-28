import ConnectionProvider, { MongooseConnectionClient } from "@buzzsports/sportsbuzz11-connection-provider";

import connectionEvent from "../../../events/connectionEvent";
import mongoConfig from "./mongoConfig";

interface MongooseConnection extends InstanceType<typeof MongooseConnectionClient> {}

/**
 * creating an instance of ConnectionProvider and initialising mongodb
 */
const instance = new ConnectionProvider({ mongodb: mongoConfig, connectionEvent });
const connections = instance.mongoInit();

const mongoConnection = connections[0];
const useDbConfig = {
  useCache: true,
};

export const [
  UsersDBConnect,
  AdminsDBConnect,
  GamesDBConnect,
  MatchDBConnect,
  FantasyTeamConnect,
  LeaguesDBConnect,
  StatisticsDBConnect,
  SeriesLBDBConnect,
  NotificationsDBConnect,
  ReportsDBConnect,
]: MongooseConnection[] = [
  mongoConnection.useDb(process.env.USER_DB_NAME, useDbConfig),
  mongoConnection.useDb(process.env.ADMIN_DB_NAME, useDbConfig),
  mongoConnection.useDb(process.env.GAME_DB_NAME, useDbConfig),
  mongoConnection.useDb(process.env.MATCH_DB_NAME, useDbConfig),
  mongoConnection.useDb(process.env.FANTASY_TEAM_DB_NAME, useDbConfig),
  mongoConnection.useDb(process.env.LEAGUE_DB_NAME, useDbConfig),
  mongoConnection.useDb(process.env.STATISTICS_DB_NAME, useDbConfig),
  mongoConnection.useDb(process.env.SERIES_LB_DB_NAME, useDbConfig),
  mongoConnection.useDb(process.env.NOTIFICATION_DB_NAME, useDbConfig),
  mongoConnection.useDb(process.env.REPORT_DB_NAME, useDbConfig),
];

export default connections;
