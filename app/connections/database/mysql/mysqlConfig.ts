import dotenv from "dotenv";
dotenv.config();
const config = process.env;
//console.log(process.env)
type Dialect = "mysql" | "postgres" | "sqlite" | "mariadb" | "mssql" | "db2" | "snowflake" | "oracle";

interface MysqlConfig {
  name: string;
  user: string;
  password: string;
  dbName: string;
  options: {
    host: string;
    port: number;
    dialect: Dialect;
    logging: boolean;
    dialectOptions: {
      multipleStatements: boolean;
    };
    replication: {
      read: [
        {
          host: string;
        },
      ];
      write: {
        host: string;
      };
    };
    pool: {
      max: number;
      min: number;
      handleDisconnects: boolean;
    };
  };
  onConnect: () => void;
  onDisconnect: () => void;
}

function onConnect() {
  console.log("MySQL Connection Created:", this.name);
}

function onDisconnect() {
  console.log("MySQL Connection Disconnected:", this.name);
}

const mysqlConfig: { config: MysqlConfig[] } = {
  config: [
    {
      name: config.DB_SQL_NAME,
      user: config.DB_SQL_USER,
      password: config.DB_SQL_PASSWORD,
      dbName: config.DB_SQL_NAME,
      options: {
        host: config.DB_SQL_HOST,
        port: Number(config.DB_SQL_PORT),
        dialect: config.DB_SQL_DIALECT as Dialect,
        logging: false,
        dialectOptions: {
          multipleStatements: true,
        },
        replication: {
          read: [
            {
              host: config.DB_SQL_HOST_REPLICA,
            },
          ],
          write: {
            host: config.DB_SQL_HOST,
          },
        },
        pool: {
          max: Number(config.DB_SQL_MAX_POOLSIZE),
          min: Number(config.DB_SQL_MIN_POOLSIZE),
          handleDisconnects: true,
        },
      },
      onConnect,
      onDisconnect,
    },
  ],
};
export default mysqlConfig;
