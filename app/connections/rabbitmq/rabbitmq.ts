import ConnectionProvider, {
  RabbitMQConnection,
  RabbitmqConnectionClient,
  RabbitmqChannelClient,
} from "@buzzsports/sportsbuzz11-connection-provider";

import connectionEvent from "@/events/connectionEvent";
import rabbitmqConfig from "./rabbitmqConfig";

// import testQueue from './queue/testQueue';
// testQueue

interface RabbitmqConnectionInterface {
  instance: InstanceType<typeof RabbitMQConnection>;
  connection: RabbitmqConnectionClient;
}

interface DefaultInterface {
  getRabbitmqInstance: () => InstanceType<typeof RabbitMQConnection>;
  getChannel: () => RabbitmqChannelClient;
}
/**
 * creating an instance of ConnectionProvider and initialising rabbitmq
 * initialize function is a promise
 */
const instance = new ConnectionProvider({ rabbitmq: rabbitmqConfig, connectionEvent });
let channel: RabbitmqChannelClient;
let rabbitmqInstance: InstanceType<typeof RabbitMQConnection>;

(async () => {
  try {
    const [firstConnection]: RabbitmqConnectionInterface[] = await instance.rabbitmqInit();

    const connection: RabbitmqConnectionClient = firstConnection.connection;
    rabbitmqInstance = firstConnection.instance;
    channel = await connection.createChannel();
    process.once("SIGINT", async () => {
      // console.log('RabbitMQ Graceful shutdown')
      await connection.close();
    });
  } catch (e) {
    console.error("RabbitMQ Connection Error", e);
  }
})();

// exporting instance and channel
const defaultValue: DefaultInterface = {
  getRabbitmqInstance: () => rabbitmqInstance,
  getChannel: () => channel,
};

export default defaultValue;
