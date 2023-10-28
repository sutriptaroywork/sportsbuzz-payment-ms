
interface OptionCOnfig {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
  maxPoolSize?: number;
  minPoolSize?: number;
  readPreference?: "primary" | "primaryPreferred" | "secondary" | "secondaryPreferred" | "nearest";
}
interface MongoConfig {
  dbName: string;
  host: string;
  options: OptionCOnfig;
  onConnect: () => void;
  onDisconnect: () => void;
  onError: () => void;
}

function onConnect() {
  console.log("MongoDB Connection Created:", this.dbName);
}

function onDisconnect() {
  console.log("MongoDB Connection Disconnected:", this.dbName);
}

function onError() {
  console.log('MongoDB Connection onError:', this);
}

const MongoOption: OptionCOnfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const createDbObject = (dbName: string, db: string, maxPoolSize: number, minPoolSize?: number, maxIdleTimeMS?: number) => {
  return {
    dbName: dbName,
    host: `${process.env.MONGO_INITIAL}${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_ENDPOINT}/${db}`,
    options: {
      ...MongoOption,
      maxPoolSize,
      minPoolSize,
      maxIdleTimeMS
    },
    onConnect,
    onDisconnect,
    onError
  };
};

const createDbObject2 = (dbName: string, db: string, dbPoolSize: number) => {
  return {
    dbName: dbName,
    host: `${process.env.MONGO_INITIAL}${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_ENDPOINT_2}/${db}`,
    options: {
      ...MongoOption,
      maxPoolSize: dbPoolSize,
    },
    onConnect,
    onDisconnect,
  };
};

const mongoConfig: { config: MongoConfig[] } = {
  config: [
   /* createDbObject("Users", process.env.USER_DB_NAME, Number(process.env.USERS_DB_POOLSIZE || 10)),
    createDbObject("Admins", process.env.ADMIN_DB_NAME, Number(process.env.ADMINS_DB_POOLSIZE || 10)),
    createDbObject("Game", process.env.GAME_DB_NAME, Number(process.env.GAME_DB_POOLSIZE || 10)),
    createDbObject("Match", process.env.MATCH_DB_NAME, Number(process.env.MATCH_DB_POOLSIZE || 10)),
    createDbObject("FantasyTeam", process.env.FANTASY_TEAM_DB_NAME, Number(process.env.FANTASY_TEAM_DB_POOLSIZE || 10)),
    createDbObject("Leagues", process.env.LEAGUE_DB_NAME, Number(process.env.FANTASY_TEAM_DB_POOLSIZE || 10)),
    createDbObject2("Statistics", process.env.STATISTICS_DB_NAME, Number(process.env.STATISTICS_DB_POOLSIZE || 10)),
    createDbObject("Promocodes", process.env.PROMOCODE_DB_NAME, Number(process.env.PROMOCODES_DB_POOLSIZE || 10)),
    createDbObject(
      "Series Leader-Board",
      process.env.SERIES_LB_DB_NAME,
      Number(process.env.SERIES_LB_DB_POOLSIZE || 10),
    ),
    createDbObject(
      "Notifications",
      process.env.NOTIFICATION_DB_NAME,
      Number(process.env.NOTIFICATION_DB_POOLSIZE || 10),
    ),
    createDbObject("Report", process.env.REPORT_DB_URL, Number(process.env.REPORT_DB_POOLSIZE) || 10), */
    createDbObject('CONNECTION', '', Number(process.env.MONGODB_MAX_POOL_SIZE), Number(process.env.MONGODB_MIN_POOL_SIZE), Number(process.env.MONGODB_IDLE_TIME_OUT))
  ]
};

export default mongoConfig;
