import UserDepositDao from "@/src/daos/UserDeposit/UserDepositDao";
import { HttpException } from "../../../library/HttpException/HttpException";
import sessionResponseDto from "@/src/dtos/sessionResponse/sessionResponseDto";
import { StatusCodeEnums, messagesEnglish } from "@/enums/commonEnum/commonEnum";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { paymentResponseDto } from "@/src/dtos/paymentResponse/paymentResponseDto";
import PaymentOptionDao from "@/src/daos/paymentOptionDao/paymentOptionDao";
import { paymentPayload } from "@/interfaces/paymentPayload/paymentPayloadInterface";
import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";
import { paymentOptionHandling } from "@/interfaces/paymentOptionHandling/paymentOptionHandling";
import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import publishTransaction from "@/connections/rabbitmq/queue/transactionLogQueue";
import { currency } from "@/enums/currencyEnums/currencyEnums";
import { logTypeEnums } from "@/enums/logTypeTnums/logTypeEnums";
import { cashfreePaymentReturnInterface } from "@/interfaces/cashfreePayment/cashfreePayment";
import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import { juspayWebhook } from "@/interfaces/juspayWebhook/juspayWebhookInterface";
import { JuspaySessionResponse } from "@/interfaces/juspaySessionResponse/JuspaySessionResponse";
import { GeneratePaymentInterface } from "@/interfaces/generatePayment/generatePaymentInterface";
import { JuspayUtils } from "@/library/Juspay/JuspayUtils";
import TransactionDao from "@/src/daos/Transaction/TransactionDao";
import DepositCommonService from "../depositService/depositCommonService";
import CashfreeCommonService from "../cashfreeService/cashfreeCommonService";
import PaymentCommonService from "./paymentCommonService";
export default class PaymentService {
  private cashfreeCommonService: CashfreeCommonService;
  private depositCommonService: DepositCommonService;
  private paymentCommonService: PaymentCommonService;
  private juspayUtils: JuspayUtils;
  private paymentOptionDao: PaymentOptionDao;
 
  private transactionDao: TransactionDao;
  private userDepositDao: UserDepositDao;

  constructor() {
    this.depositCommonService = new DepositCommonService();
    this.cashfreeCommonService = new CashfreeCommonService();
    this.paymentCommonService = new PaymentCommonService()
    this.paymentOptionDao = new PaymentOptionDao();
    this.juspayUtils = new JuspayUtils();
    this.transactionDao = new TransactionDao();
    this.userDepositDao = new UserDepositDao();
  }

  public generatePayment = async (
    paymentParams: GeneratePaymentInterface,
  ): Promise<paymentResponseDto | sessionResponseDto> => {
    try {
      const juspayResponse: JuspaySessionResponse = await this.createJuspaySession(paymentParams);
      return sessionResponseDto.toResponse(juspayResponse);
    } catch (error) {
      try {
        const cashfreeResponse: paymentResponseDto = await this.generateCashfreePayment(paymentParams);
        return cashfreeResponse;
      } catch (error) {
        throw new Error(error);
      }
    }
  };

  public generateCashfreePayment = async (paymentPayload: paymentPayload): Promise<paymentResponseDto> => {
    try {
      const { ePlatform, user } = paymentPayload;
      const iUserId: string = user._id.toString();
      if (!ePlatform)
        throw new HttpException(
          StatusCodeEnums.BAD_REQUEST,
          messagesEnglish.fields_missing.replace("##", messagesEnglish.cPlatformHeaders),
        );

      if (![PlatformTypesEnums.ANDROID, PlatformTypesEnums.IOS, PlatformTypesEnums.WEB].includes(ePlatform))
        throw new HttpException(
          StatusCodeEnums.BAD_REQUEST,
          messagesEnglish.invalid.replace("##", messagesEnglish.cPlatformHeaders),
        );

      let { eType, nAmount, sPromocode } = paymentPayload;
      nAmount = Number(nAmount).toFixed(2);
      // TODO-ISSUE use proper naming convention
      const paymentOptionCount: number = await this.paymentOptionDao.countDepositOptions(eType);
      if (!paymentOptionCount)
        throw new HttpException(
          StatusCodeEnums.BAD_REQUEST,
          messagesEnglish.error_with.replace("##", messagesEnglish.cpaymentOption),
        );

      //console.log("user :", user);

      if (!user) throw new HttpException(StatusCodeEnums.UNAUTHORIZED, messagesEnglish.err_unauthorized);
      const payload = { ePaymentGateway: eType, nAmount: Number(nAmount), sPromocode, ePlatform, user };

      await this.depositCommonService.validateDepositRateLimit(iUserId);
      const userDeposit: UserDepositOutput = await this.depositCommonService.createDeposit(payload);

      if (user.bIsInternalAccount === true) {
        return paymentResponseDto.toResponseUserDeposit({
          status: StatusCodeEnums.OK,
          message: messagesEnglish.deposit_success,
          data: { bIsInternalUserDeposit: true },
        });
      }

      user.sEmail = user.sEmail || process.env.CASHFREE_MAIL_DEFAULT_ACCOUNT;
      const paymentOptionPayload = {
        eType,
        iOrderId: userDeposit.iOrderId,
        ePlatform,
        user,
        userDeposit: userDeposit,
      };
      const paymentResponse: paymentResponseDto = await this.paymentOptionHandling(paymentOptionPayload);
      return paymentResponse;
    } catch (err) {
      throw new Error(err);
    }
  };

  private paymentOptionHandling = async (payload: paymentOptionHandling): Promise<paymentResponseDto> => {
    try {
      const { iOrderId: orderId, eType, ePlatform, user, userDeposit } = payload;

      const oModifiedDepositData = await this.paymentCommonService.calculateGST(userDeposit.nCash.toString())
      if (!oModifiedDepositData.isSuccess) return { status: StatusCodeEnums.BAD_REQUEST, message: messagesEnglish.error_with.replace('##', 'payment') }

      const { nRequestedAmount } = oModifiedDepositData.oGST

      if ([paymentOptionEnums.CASHFREE, paymentOptionEnums.CASHFREE_UPI].includes(eType)) {
        let cashFreePayload;
        const sNotifyUrl = `${process.env.DEPLOY_HOST_URL}/${process.env.CASHFREE_NOTIFY_URL}`;
        const sReturnUrl = [PlatformTypesEnums.ANDROID, PlatformTypesEnums.IOS, PlatformTypesEnums.WEB].includes(
          ePlatform,
        )
          ? `${process.env.DEPLOY_HOST_URL}/${process.env.CASHFREE_RETURN_URL}`
          : `${process.env.DEPLOY_HOST_URL}/${process.env.CASHFREE_RETURN_URL_OTHER}`;
        const iOrderId = [PlatformTypesEnums.ANDROID, PlatformTypesEnums.IOS, PlatformTypesEnums.WEB].includes(
          ePlatform,
        )
          ? `${orderId}`
          : undefined;
        const nOrderAmount = nRequestedAmount;
        const sOrderCurrency = currency.INR;

        if ([PlatformTypesEnums.ANDROID, PlatformTypesEnums.IOS, PlatformTypesEnums.WEB].includes(ePlatform)) {
          cashFreePayload = {
            customer_details: {
              customer_id: user._id.toString(),
              customer_email: user.sEmail || "user@sportsbuzz11.com",
              customer_phone: user.sMobNum,
            },
            order_meta: {
              return_url: sReturnUrl,
              notify_url: sNotifyUrl,
            },
            order_id: `${orderId}`,
            order_amount: nOrderAmount,
            order_currency: sOrderCurrency,
          };
          if ([PlatformTypesEnums.ANDROID, PlatformTypesEnums.IOS].includes(ePlatform))
            delete cashFreePayload.order_meta.return_url;
        } else {
          cashFreePayload = {
            customer_details: {
              customer_phone: user.sMobNum,
            },
            link_notify: {
              send_sms: true,
            },
            link_meta: {
              notify_url: sNotifyUrl,
              return_url: sReturnUrl,
            },
            link_id: `${orderId}`,
            link_amount: nOrderAmount,
            link_currency: sOrderCurrency,
            link_purpose: "Payment for Deposit",
          };
          if (eType === paymentOptionEnums.CASHFREE_UPI) cashFreePayload.link_meta.upi_intent = true;
        }
        const response: cashfreePaymentReturnInterface = await this.cashfreeCommonService.cashFreePayment(
          cashFreePayload,
          ePlatform,
        );
        const { result } = response;
        // const { customer_details: oCustomer, order_meta: { notify_url: sNotifyUrl, return_url: sReturnUrl }, order_id: iOrderId, order_amount: nOrderAmount, order_currency: sOrderCurrency } = cashFreePayload
        const { customer_details: oCustomer } = cashFreePayload;
        const { customer_id: sCustId, customer_email: sCustEmail, customer_phone: sCustPhone } = oCustomer;

        const logData = {
          iUserId: user._id,
          iDepositId: userDeposit.id,
          iOrderId: userDeposit.iOrderId,
          ePlatform,
          eGateway: eType,
          eType: logTypeEnums.DEPOSIT,
          oBody: payload,
          oReq: cashFreePayload,
          oRes: result,
        };
        await publishTransaction(logData);
        // TODO make seperate log microserservice & log payments here
        if (result.payments.url || result.payment_session_id) {
          return paymentResponseDto.toResponse({
            status: StatusCodeEnums.CREATE,
            message: messagesEnglish.success.replace(
              "##",
              `${
                ePlatform === PlatformTypesEnums.ANDROID || ePlatform === PlatformTypesEnums.IOS
                  ? messagesEnglish.cCashFreePaymentToken
                  : messagesEnglish.cCashFreePaymentLink
              }`,
            ),
            data: {
              ...result,
              cf_order_id: null,
              iOrderId,
              nOrderAmount,
              sOrderCurrency,
              sCustId,
              sCustEmail,
              sCustName: user.sName,
              sCustPhone,
              sNotifyUrl,
              sReturnUrl,
              gateway: paymentGatewayEnums.CASHFREE,
            },
          });
        }
        throw new HttpException(
          StatusCodeEnums.BAD_REQUEST,
          messagesEnglish.error_with.replace(
            "##",
            `${
              ePlatform === PlatformTypesEnums.ANDROID || ePlatform === PlatformTypesEnums.IOS
                ? messagesEnglish.cCashFreePaymentToken
                : messagesEnglish.cCashFreePaymentLink
            }`,
          ),
        );
      } else {
        throw new HttpException(
          StatusCodeEnums.NOT_FOUND,
          messagesEnglish.not_exist.replace("##", messagesEnglish.cPaymentGateway),
        );
      }
    } catch (error) {
      throw error;
    }
  };

  public createJuspaySession = async (paymentData: GeneratePaymentInterface): Promise<JuspaySessionResponse> => {
    try {
      const { nAmount, user, sPromocode } = paymentData;
      if (!user) throw new HttpException(StatusCodeEnums.UNAUTHORIZED, messagesEnglish.err_unauthorized);
      const oModifiedDepositData = await this.paymentCommonService.calculateGST(nAmount)
      if (!oModifiedDepositData.isSuccess) throw new HttpException(StatusCodeEnums.BAD_REQUEST,  messagesEnglish.error_with.replace('##', 'payment'))

      const { nRequestedAmount } = oModifiedDepositData.oGST
      const depositPayload = { nAmount: Number(nAmount), sPromocode, user, ePaymentGateway: paymentOptionEnums.JUSPAY };
      const userDeposit: UserDepositOutput = await this.depositCommonService.createDeposit(depositPayload);
      const order_id = userDeposit.iOrderId;
      const sReturnUrl = process.env.JUSPAY_RETURN_URL || "https://game.beta.sportsbuzz11.com/profile";

      const sessionPayload = {
        udf1: process.env.JUSPAY_SESSION_SECRET,
        order_id,
        amount: nRequestedAmount,
        customer_id: user._id.toString(),
        customer_email: user.sEmail,
        customer_phone: user.sMobNum,
        return_url: sReturnUrl,
        payment_page_client_id: process.env.payment_page_client_id || "sportsbuzz",
        action: "paymentPage",
        description: "Deposit Amount",
      };
      console.log('juspay session create log')
      const JuspaySessionResponse: JuspaySessionResponse = await this.juspayUtils.apiCalling(sessionPayload);
      return JuspaySessionResponse;
    } catch (err) {
      throw new Error(err);
    }
  };

  /*public createPayout = async (paymentData: payoutRequestDto): Promise<AnyObject> => {
    try {
      const url = `${this.JuspayBaseUrl}/payout/merchant/v1/orders`;
      const payoutPayload = await this.payoutService.withdrawService(paymentData);
      const result = await this.apiCalling(url, payoutPayload);
      return result;
    } catch (err) {
      throw new Error(err)
    }
  }; 

  public getPayoutStatus = async (orderId: string): Promise<AnyObject> => {
    try {
      const url = `${this.JuspayBaseUrl}/payout/merchant/v1/orders`;
      const payload = `${orderId}?expand=fulfillment,payment,refund`;
      const result = await this.apiCalling(url, payload, "GET");
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }; */

  public juspayDepositWebhook = async (depositWebhook: juspayWebhook): Promise<defaultResponseInterface> => {
    try {
      const juspayPayload = depositWebhook;

      if (juspayPayload.event_name !== paymentStatusEnum.ORDER_SUCCEEDED) {
        throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.error);
      }
      console.log('juspay webhook :',juspayPayload)
      const { order_id, status } = juspayPayload.content.order.txn_detail;
      let oDeposit: UserDepositOutput = await this.userDepositDao.findUserDepositByOrderId(order_id);
      if (oDeposit === null) throw new HttpException(
          StatusCodeEnums.NOT_FOUND,
          messagesEnglish.not_exist.replace("##", messagesEnglish.cDeposit),
        );
      if (oDeposit.ePaymentStatus === paymentStatusEnum.SUCCESS) {
        return { status: StatusCodeEnums.OK, message: messagesEnglish.order_already_processed };
      }
    

      // Calculate GST on Deposited Amount
      const { oGST } = await this.paymentCommonService.calculateGST(`${oDeposit.nCash}`)
      oDeposit.nBonus = parseFloat(`${oDeposit.nBonus}`) + parseFloat(`${oGST.nRepayBonusAmount}`)
      const postData = {
        txStatus: status === paymentStatusEnum.CHARGED ? paymentStatusEnum.SUCCESS : status,
        orderId: order_id,
        deposit: oDeposit,
        referenceId: order_id,
        oGST
      };
      const { status: resStatus, message } = await this.transactionDao.userDepositUpdateBalance(postData);
      if (resStatus && message) {
        if ([PlatformTypesEnums.ANDROID, PlatformTypesEnums.IOS].includes(oDeposit?.ePlatform)) {
          return { status: resStatus, message };
        }
        return { status: resStatus, message };
      }
    } catch (error) {
      throw error;
    }
  };


  /* public depositCron = async (orderId: string): Promise<void> => {
    try {
      scheduler.scheduleJob(orderId, miscellaneous.cronInterval, async () => {
        const orderStatus = await this.getOrderStatus(orderId);

        if (orderStatus.status === orderStatusEnums.CHARGED) {
          const processDeposit = await this.webhookService.processDeposit(orderStatus);
          if (processDeposit.status === StatusCodeEnums.OK) scheduler.scheduledJobs[orderId].cancel();
        }
      });
    } catch (error) {
      throw new HttpException(error.status, error.message);
    }
  }; */
}