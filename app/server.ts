import * as dotenv from "dotenv";
import SecretsManager from "./secretManagerSecrets";

dotenv.config();

const secretManager = new SecretsManager();

secretManager.getSecrets().then(() => {
  // process.env.DEPLOY_HOST_PORT = "1339";

  const app = require("./app");
  app.listen(process.env.DEPLOY_HOST_PORT, (): void => {
    console.log(`Server running on http://localhost:${process.env.DEPLOY_HOST_PORT}`);
  });
});
