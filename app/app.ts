import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import UserRoutes from "./src/routes/payment/paymentRoutes";
import errorMiddleware from "./middleware/error.middleware";
import connection from "./connections/index";
import { StatusCodeEnums } from "./enums/commonEnum/commonEnum";
import PaymentRoutes from "./src/routes/payment/paymentRoutes";
import adminRoutes from "./src/routes/admin/adminRoutes";
connection;
dotenv.config();

// INTIALIZE APP
const app = express();
try {
  //mongooseConnection(process.env.DATABASE_URL, process.env.DATABASE_NAME)

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(morgan("dev"));

  const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  console.log('alpha log')

  app.use(cors(corsOptions));

  app.get("/addServiceNameBaseURL", (req: Request, res: Response): void => {
    res.json({ message: `Welcome to Sportsbuzz11 with ${process.env.NODE_ENV} enviroment` });
  });

  app.use("/", new PaymentRoutes().router);
  app.use("/admin", new adminRoutes().router);

  app.get("/health-check", (req, res) => {
    const sDate = new Date().toJSON();
    return res.status(StatusCodeEnums.OK).jsonp({ status: StatusCodeEnums.OK, sDate });
  });

  app.use(errorMiddleware);

  app.use(function onError(err, _req, res, _next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    console.log(err);
    res.statusCode = 500;
    res.end(`error: "Something went wrong: " +`);
  });
} catch (error) {
  console.log(error, "-=-=-");
}

module.exports = app;
