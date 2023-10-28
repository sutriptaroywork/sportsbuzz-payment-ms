/**
 * Test queue in RabbitMQ
 */
import connectionEvent from "../../../events/connectionEvent";
import rabbitmq from "../rabbitmq";
const routingQueueKey = "TestQueue";

/**
 * for publishing data
 * @param {object} msg
 */
const publish = async (msg) => {
  rabbitmq.getRabbitmqInstance().publish(rabbitmq.getChannel(), routingQueueKey, msg);
};

const testCallback = (data) => {
  try {
    console.log("Testing RabbitMQ Queue", JSON.parse(data.content));
  } catch (e) {
    // console.log(e);
  }
};

/**
 * consuming data, start after all connections established
 */
connectionEvent.on("ready", () => {
  console.log(`#####STARTED CONSUMING ${routingQueueKey} QUEUE#####`);
  rabbitmq.getRabbitmqInstance().consume(rabbitmq.getChannel(), routingQueueKey, testCallback, { noAck: false });
  setInterval(() => {
    console.log("publishing");
    publish({ name: "test" });
  }, 5000);
});

export default {
  publish,
};
