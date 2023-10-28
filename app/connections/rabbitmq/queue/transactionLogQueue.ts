import rabbitmq from "../rabbitmq";
const routingQueueKey = process.env.TRANSACTION_LOGS_QUEUE;

/**
 * for publishing data
 * @param {object} msg
 */
const publishTransaction = async (msg): Promise<void> => {
  rabbitmq.getRabbitmqInstance().publish(rabbitmq.getChannel(), routingQueueKey, msg);
};

export default publishTransaction;
