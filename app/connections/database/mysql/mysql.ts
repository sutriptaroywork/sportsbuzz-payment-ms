import ConnectionProvider, {
  SequelizeClient,
  SequelizeQueryInterface,
} from "@buzzsports/sportsbuzz11-connection-provider";

import connectionEvent from "@/events/connectionEvent";
import mysqlConfig from "./mysqlConfig";

interface SequelizeClientInterface {
  instance: InstanceType<typeof SequelizeClient>;
  Sequelize: typeof SequelizeClient;
}

interface SequelizeInterface extends Omit<SequelizeClientInterface, "instance"> {
  sequelize: InstanceType<typeof SequelizeClient>;
  queryInterface: InstanceType<typeof SequelizeQueryInterface>;
}

/**
 * creating an instance of ConnectionProvider and initialising mysql
 */
const instance = new ConnectionProvider({ mysql: mysqlConfig, connectionEvent });
const connections = instance.mysqlInit();

const [sequelize]: SequelizeInterface[] = connections.map((sequelizeInstance: SequelizeClientInterface) => {
  return {
    sequelize: sequelizeInstance.instance,
    Sequelize: sequelizeInstance.Sequelize,
    // DataTypes: sequelize.Sequelize.DataTypes,
    queryInterface: sequelizeInstance.instance.getQueryInterface(),
  };
});

process.once("SIGINT", async () => {
  // console.log('MySQL Graceful shutdown')
  connections.map((sequelizeInstance: SequelizeClientInterface) => {
    // console.log('MySQL Graceful shutdown')
    sequelizeInstance.instance.close();
  });
});

export default sequelize;
