import rabbitmq from "../rabbitmq";
const routingQueueKey = process.env.ADMIN_LOGS_QUEUE;

/**
 * for publishing data
 * @param {object} msg
 */
export const publishAdminLogs = async (msg) => {
  rabbitmq.getRabbitmqInstance().publish(rabbitmq.getChannel(), routingQueueKey, msg);
};
