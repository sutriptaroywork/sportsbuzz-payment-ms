/**
 * Push Token Notification Queue in RabbitMQ
 */
import rabbitmq from "../rabbitmq";

const routingQueueKey = "DEPOSIT_NOTIFY";
/**
 * for publishing data
 * @param {object} msg
 */
export const depositNotificationPublish = async (msg) => {
  console.log("------>", msg);
  rabbitmq.getRabbitmqInstance().publish(rabbitmq.getChannel(), routingQueueKey, msg);
};
/**
 * consuming data, start after all connections established
 */

export default depositNotificationPublish;
