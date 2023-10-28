const AWS = require("aws-sdk");

const constants = "CONSTANT";

export default class SecretsManager {
  private region: string;
  private accessKey: string;
  private secretsAccessKey: string;
  private client: any;

  constructor(options: any = {}) {
    this.region = options.region || process.env.AWS_REGION;
    (this.accessKey = options.accessKey || process.env.AWS_ACCESS_KEY),
      (this.secretsAccessKey = options.secretsAccessKey || process.env.AWS_SECRET_KEY);

    if (!this.region || !this.accessKey || !this.secretsAccessKey) {
      console.log(this.region, this.accessKey, this.secretsAccessKey);
      throw new Error("CREDENTIALS are Missing");
    }
    this.client = new AWS.SecretsManager({
      region: this.region,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });
  }

  private secretManager = async () => {
    return new Promise((resolve, reject) => {
      this.client.getSecretValue({ SecretId: process.env.NODE_ENV }, function (err, data) {
        if (err) {
          reject(err);
        } else {
          if ("SecretString" in data) {
            const secrets = JSON.parse(data.SecretString);

            resolve(secrets);
          } else {
            reject("CREDENTIALS are MisMatch");
          }
        }
      });
    });
  };

  private constantFromSecretManager = async () => {
    return new Promise((resolve, reject) => {
      this.client.getSecretValue({ SecretId: constants }, function (err, data) {
        if (err) {
          console.log(err, "-=-=>");
          reject(err);
        } else {
          if ("SecretString" in data) {
            const secrets = JSON.parse(data.SecretString);
            resolve(secrets);
          } else {
            reject("CREDENTIALS are MisMatch");
          }
        }
      });
    });
  };

  public getSecrets = async () => {
    const [secretManagerSecrets, constantSecrets] = await Promise.all([
      this.secretManager(),
      this.constantFromSecretManager(),
    ]);
    //console.log(secretManagerSecrets,"-=-=-=-=-=->>")
    //console.log(constantSecrets,"-=-=-=-=-=->>")
    process.env = Object.assign(process.env, secretManagerSecrets);
    process.env = Object.assign(process.env, constantSecrets);

    // for localhost

     /* process.env.REDIS_HOST = "localhost";
     process.env.REDIS_PORT = "6379";
     process.env.REDIS_2_HOST = "localhost";
     process.env.REDIS_2_PORT = "6379";
     process.env.RABBITMQ_URL = "amqp://127.0.0.1:5672";
     process.env.DB_SQL_USER = "anmol-sportsbuzz";
     process.env.DB_SQL_PASSWORD = "x9Dw978a2N7WyFl4";
     process.env.DB_SQL_HOST = "localhost";
     process.env.DB_SQL_NAME = "sportsbuzz11_stag";
     process.env.DB_SQL_PORT = "3307";  */
  };
}
