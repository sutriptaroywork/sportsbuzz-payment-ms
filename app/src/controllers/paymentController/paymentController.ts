import webhookService from "@/src/services/webhookService/webhookService";
import { Response, Request, NextFunction, Locals } from "express";
import payoutCreateInterface from "@/interfaces/payoutCreate/payoutCreate";
import PaymentService from "../../services/paymentService/paymentService";
import DepositService from "@/src/services/depositService/depositService";
import { paymentRequestDto } from "@/src/dtos/paymentRequest/paymentRequestDto";
import { extendedRequest } from "@/interfaces/extendedRequest/extendedRequest";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { depositPayloadInterface } from "@/interfaces/depositPayload/depositPayloadInterface";
import payoutService from "@/src/services/payoutService/payoutService";
import { cashfreeService } from "@/src/services/cashfreeService/cashfreeService";
import { StatusCodeEnums, languageEnums } from "@/enums/commonEnum/commonEnum";
import { passbookService } from "@/src/services/passbookService/passbookService";
import tdsService from "@/src/services/tdsService/tdsService";
import cronService from "@/src/services/cronService/cronService";
import { UserModelOutput } from "@/models/userModel/userModel";
import { GeneratePaymentInterface } from "@/interfaces/generatePayment/generatePaymentInterface";
import { orderStatusResponse } from "@/interfaces/juspayOrderStatusResponse/juspayOrderStatusResponse";
import { JuspayOrderStatusDto } from "@/src/dtos/juspayOrderStatus/juspayOrderStatus";
import { juspayWebhook } from "@/interfaces/juspayWebhook/juspayWebhookInterface";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import { paymentOptionOutput } from "@/models/paymentOptionModel/paymentOptionModel";
import { payoutOptionOutput } from "@/models/payoutOptionModel/payoutOptionModel";
import cashfreeReturnUrlWebhook from "@/interfaces/cashfreePayment/cashfreeDepositReturnUrl";
import { CashfreeDepositStatusPayload } from "@/interfaces/cashfreeDepositStatusPayload/cashfreeDepositStatusPayload";
import cashfreeDepositWebhookInterface from "@/interfaces/cashfreePayment/cashfreePayment";
import CashfreePayoutWebhook from "@/interfaces/cashfreePayment/cashfreePayment";
import { withdrawStatusResponse } from "@/interfaces/withdrawStatusResponse/withdrawStatusResponse";
import tdsBreakupInterface from "@/interfaces/tds/tdsBreakup";
import { TdsBreakupResponse } from "@/interfaces/tdsBreakupInterface/tdsBreakupInterface";
import { TaxfreeAmountResponse } from "@/interfaces/taxfreeAmountResponse/taxfreeAmountResponse";
import PaymentCommonService from "@/src/services/paymentService/paymentCommonService";
import CashfreeCommonService from "@/src/services/cashfreeService/cashfreeCommonService";
import DepositCommonService from "@/src/services/depositService/depositCommonService";
import passbookListInterface from "@/interfaces/passBook/passBookInterface";
import GSTbreakupInterface from "@/interfaces/gst/gstBreakupInterface";
export default class PaymentController {
  private cashfreeService: cashfreeService;
  private cashfreeCommonService: CashfreeCommonService;
  private cronService: cronService;
  private depositService: DepositService;
  private paymentService: PaymentService;
  private paymentCommonService: PaymentCommonService;
  private webhookService: webhookService;
  private payoutService: payoutService;
  private passbookService: passbookService;
  private tdsService: tdsService;
  private depositCommonService: DepositCommonService;

  constructor() {
    this.cashfreeService = new cashfreeService();
    this.cashfreeCommonService = new CashfreeCommonService();
    this.cronService = new cronService();
    this.depositCommonService = new DepositCommonService();
    this.depositService = new DepositService();
    this.paymentCommonService = new PaymentCommonService();
    this.paymentService = new PaymentService();
    this.webhookService = new webhookService();
    this.payoutService = new payoutService();
    this.passbookService = new passbookService();
    this.tdsService = new tdsService();
  }

  /* public createOrderSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqBody: sessionRequestDto = req.body as any;
      const result = await this.paymentService.createSession(reqBody);
      res.status(201).json({status: StatusCodeEnums.CREATE, message: messagesEnglish.action_success.replace('##', 'JUSPAY session'), data: {...result, gateway: paymentGatewayEnums.JUSPAY}});
    } catch (error) {
      next(error);
    }
  }; */

 public generatePayment = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentRequest: paymentRequestDto = req.body;

      const language = (((req as Request).header as any)?.userLanguage as languageEnums) || languageEnums.ENGLISH;

      const user: UserModelOutput = JSON.parse(req.headers.user as string);
      const genratePaymentPayload = {} as GeneratePaymentInterface;

      genratePaymentPayload.ePlatform = req.header("Platform") as PlatformTypesEnums;
      genratePaymentPayload.lang = language
      genratePaymentPayload.user = (user as UserModelOutput);
      console.log('generate payment flow')
      const result = await this.paymentService.generatePayment({ ...paymentRequest, ...genratePaymentPayload });
      res.status(StatusCodeEnums.CREATE).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getTdsBreakup = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqBody : tdsBreakupInterface = req.body;
      const payload = { ...reqBody };
      const result : TdsBreakupResponse = await this.tdsService.getTDSBreakUp(payload);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getTaxFreeAmount = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { iUserId } : { iUserId: string} = req.query as any;
      const result : TaxfreeAmountResponse = await this.tdsService.getTaxFreeAmount(iUserId);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public createDeposit = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqBody: depositPayloadInterface = req.body;
      const payload = { ...reqBody };
      const result : UserDepositOutput = await this.depositCommonService.createDeposit(payload);
      res.status(StatusCodeEnums.CREATE).json(result);
    } catch (error) {
      next(error);
    }
  };

  public depositReturnUrl = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postData : cashfreeReturnUrlWebhook = req.body;
      const result = await this.cashfreeService.depositReturnUrl(postData);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public juspayWebhook = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postData : juspayWebhook = req.body;
      const result : defaultResponseInterface = await this.paymentService.juspayDepositWebhook(postData);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public depositCron = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result : defaultResponseInterface = await this.cronService.depositCron();
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public payoutCron = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result : defaultResponseInterface = await this.cronService.payoutCronCashfree();
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getDepositOptions = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result: paymentOptionOutput = await this.depositService.depositOptionsList();
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getPayoutOptions = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result : payoutOptionOutput[] = await this.payoutService.payoutOptionsList();
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public userCancelWithdraw = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { withdrawId } : { withdrawId : string} = req.query as any;
      const result : defaultResponseInterface = await this.payoutService.userCancelWithdraw(parseInt(withdrawId));
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public createPayout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqBody : payoutCreateInterface = req.body;
      const result : defaultResponseInterface = await this.payoutService.createPayout(reqBody);
      res.status(Number(result.status)).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getDepositStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { iUserId, iOrderId } : CashfreeDepositStatusPayload = req.params as any;
      const result = await this.cashfreeService.checkDepositStatus({ iUserId, iOrderId });
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getJuspayDepositStatus = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params : JuspayOrderStatusDto = req.params as any ;
      const result : orderStatusResponse = await this.paymentCommonService.getOrderStatus(params.id);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getPayoutStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { iUserId } : { iUserId: string} = req.params as any;
      const result : withdrawStatusResponse = await this.payoutService.checkWithdrawStatus(iUserId);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public depositWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqParams : cashfreeDepositWebhookInterface = req.body;
      const result : defaultResponseInterface = await this.webhookService.cashfreeDepositWebhook(reqParams);
      res.status(StatusCodeEnums.CREATE).json(result);
    } catch (error) {
      next(error);
    }
  };

  public payoutWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqParams : CashfreePayoutWebhook = req.body;
      const result : defaultResponseInterface = await this.webhookService.cashfreeWebhook(reqParams);
      res.status(StatusCodeEnums.CREATE).json(result);
    } catch (error) {
      next(error);
    }
  };

  public passbookList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqParams : passbookListInterface = req.query as any;
      const result  = await this.passbookService.list(reqParams);
      res.status(StatusCodeEnums.CREATE).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getGSTBreakUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqBody : GSTbreakupInterface  = req.body as any;
      const result  = await this.paymentCommonService.getGSTBreakUp(reqBody);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
}
