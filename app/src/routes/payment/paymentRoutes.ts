import Routes from "../index";
import { Router } from "express";
// import UserController from "@/src/controller/userController/userController";
import validationMiddleware from "../../../middleware/validation.middleware";
//import { sessionRequestDto } from "../../dtos/sessionRequest/sessionRequestDto";
//import { orderStatusRequestDto } from "../../dtos/orderRequest/orderStatusRequestDto";
import PaymentController from "../../controllers/paymentController/paymentController";
//import { payoutRequestDto } from "../../dtos/payoutRequest/payoutRequestDto";
//import { webhookRequestDto } from "@/src/dtos/webhookRequest/webhookRequestDto";

import { orderStatusRequestDto } from "@/src/dtos/orderRequest/orderStatusRequestDto";
import { checkPayoutStatusDto } from "@/src/dtos/checkPayoutStatus/checkPayoutStatus";

// import UserController from "@controllers/userController/userController";
// import UserController from "../../controllers/userController/userController";

export default class PaymentRoutes implements Routes {
  public path: string;
  public router: Router;
  public paymentController: PaymentController;

  constructor() {
    this.path = "/payment";
    this.router = Router();
    this.paymentController = new PaymentController();
    this.initializeRoutes();
  }

  private initializeRoutes = (): void => {
    // this.router.get(`${this.path}/`, )
    //GeneratePayment
    this.router.post(`${this.path}/create`, this.paymentController.generatePayment);
    this.router.all(`${this.path}/deposit/return-url`, this.paymentController.depositReturnUrl);
    this.router.all(`${this.path}/deposit/juspay-webhook`, this.paymentController.juspayWebhook);
    this.router.post(`${this.path}/createDeposit`, this.paymentController.createDeposit);

    this.router.post(`${this.path}/createPayout`, this.paymentController.createPayout);
    this.router.get(`${this.path}/get/depositOptions`, this.paymentController.getDepositOptions);

    this.router.get(`${this.path}/get/payoutOptions`, this.paymentController.getPayoutOptions);

    this.router.get(`${this.path}/user/:iUserId/deposit/:iOrderId`, this.paymentController.getDepositStatus);

    this.router.get(`${this.path}/payout/cancel`, this.paymentController.userCancelWithdraw);

    this.router.all(`${this.path}/webhook/deposit`, this.paymentController.depositWebhook);

    this.router.all(`${this.path}/webhook/payout`, this.paymentController.payoutWebhook);

   /* this.router.post(
      `${this.path}/session-auth`,
      validationMiddleware(sessionRequestDto, "body"),
      this.paymentController.createOrderSession,
    ); */

    //TDS routes
    this.router.post(`${this.path}/tds/getTDSbreakup`, this.paymentController.getTdsBreakup);
    this.router.get(`${this.path}/tds/getTaxfreeAmount`, this.paymentController.getTaxFreeAmount);

    /* this.router.post(
      `${this.path}/payout`,
      validationMiddleware(payoutRequestDto, "body"),
      this.paymentController.createPayout,
    ); */

    this.router.get(
      `${this.path}/getOrderStatus/order/:id`,
      validationMiddleware(orderStatusRequestDto, "params"),
      this.paymentController.getJuspayDepositStatus,
    );

    this.router.get(
      `${this.path}/getPayoutStatus/user/:iUserId`,
      validationMiddleware(checkPayoutStatusDto, "params"),
      this.paymentController.getPayoutStatus,
    );
    this.router.get(`${this.path}/getPassbookList`, this.paymentController.passbookList);

    //Cron routes
    this.router.get(`${this.path}/deposit/cron`, this.paymentController.depositCron);
    this.router.get(`${this.path}/payout/cron`, this.paymentController.payoutCron);

    //GST
    this.router.post(`${this.path}/gst/gst-breakup`, this.paymentController.getGSTBreakUp)
  };
}
