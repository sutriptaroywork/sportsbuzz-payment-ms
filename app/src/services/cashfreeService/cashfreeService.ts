import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { HttpException } from "@/library/HttpException/HttpException";
import axios from "axios";
import crypto from "crypto";
import UserDepositDao from "@/src/daos/UserDeposit/UserDepositDao";
import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import publishTransaction from "@/connections/rabbitmq/queue/transactionLogQueue";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { logTypeEnums } from "@/enums/logTypeTnums/logTypeEnums";
import { StatusCodeEnums, encodingAndEncryption, messagesEnglish } from "@/enums/commonEnum/commonEnum";
import checkCashfreeStatusResponseInterface from "@/interfaces/checkCashfreeStatus/checkCashfreeStatus";
import cashfreeReturnUrlWebhook from "@/interfaces/cashfreePayment/cashfreeDepositReturnUrl";
import { CashfreeDepositReturnUrlResponse } from "@/interfaces/cashfreeDepositReturnUrl/cashfreeDepositReturnUrl";
import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import verifyAppPaymentInterface from "@/interfaces/verifyAppPayment/verifyAppPaymentInterface";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import TransactionDao from "@/src/daos/Transaction/TransactionDao";
import CashfreeCommonService from "./cashfreeCommonService";
import UserDao from "@/src/daos/user/userDaos";
import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";
import { publishAdminLogs } from "@/connections/rabbitmq/queue/adminLogQueue";
import { CashfreeDepositStatusPayload, CashfreeDepositStatusResponse } from "@/interfaces/cashfreeDepositStatusPayload/cashfreeDepositStatusPayload";
import PaymentCommonService from "../paymentService/paymentCommonService";
export class cashfreeService {
  private cashfreeCommonService: CashfreeCommonService;
  private paymentCommonService: PaymentCommonService;
  private userDao: UserDao;
  private userDepositDao: UserDepositDao;
  private transactionDao: TransactionDao;

  constructor() {
    this.userDao = new UserDao();
    this.userDepositDao = new UserDepositDao();
    this.transactionDao = new TransactionDao();
    this.cashfreeCommonService = new CashfreeCommonService();
    this.paymentCommonService = new PaymentCommonService();
  }

  

  public adminReturnUrl = async (payload: cashfreeReturnUrlWebhook): Promise<string> => {
    try {
      const postData = payload;
      const orderId = postData.link_id || postData.order_id;

      // const ePaymentGateway = 'CASHFREE'

      const oDeposit = await this.userDepositDao.findUserDepositByOrderId(orderId);
      if (oDeposit.ePaymentStatus === paymentStatusEnum.SUCCESS) return process.env.CASHFREE_RETURN_URL;

      const logData = {
        iDepositId: oDeposit.id,
        iOrderId: oDeposit.iOrderId || orderId,
        eGateway: oDeposit.ePaymentGateway,
        eType: logTypeEnums.DEPOSIT,
        oReq: { sInfo: `${oDeposit.ePaymentGateway} payment gateway web-hook(v2) event called.` },
        oRes: postData,
      };
      await publishTransaction(logData);
      // apiLogServices.saveTransactionLog(logData);

      const response = await this.getOrderPaymentStatus({ iDepositId: `${oDeposit.id}`, orderId });

      const { isSuccess, result = {} } = response;

      if (isSuccess) {
        // Calculate GST on Deposited Amount
        const { oGST } = await this.paymentCommonService.calculateGST(oDeposit.nCash.toString())
        oDeposit.nBonus = parseFloat(oDeposit.nBonus.toString()) + parseFloat(`${oGST.nRepayBonusAmount}`)
        const postData = { txStatus: result.order_status, orderId, referenceId: result.cf_order_id, oGST };
        const { status: resStatus, message } = await this.transactionDao.userDepositUpdateBalance(postData);
        if (resStatus && message) {
          if ([PlatformTypesEnums.ANDROID, PlatformTypesEnums.IOS].includes(oDeposit?.ePlatform)) {
            process.env.CASHFREE_RETURN_URL = undefined;
            // return res.redirect(config.CASHFREE_RETURN_URL)
          }
          return process.env.CASHFREE_RETURN_URL;
        }
      } else {
        return process.env.CASHFREE_RETURN_URL;
      }
    } catch (error) {
      throw error;
    }
  };

  public depositReturnUrl = async (postData: cashfreeReturnUrlWebhook): Promise<CashfreeDepositReturnUrlResponse> => {
    try {
      const orderId = postData.link_id || postData.order_id;
      const oDeposit : UserDepositOutput = await this.userDepositDao.findUserDepositByOrderId(orderId);
      if (oDeposit.ePaymentStatus === paymentStatusEnum.SUCCESS) return { CASHFREE_REDIRECT: process.env.CASHFREE_RETURN_URL };

      const logData = {
        iDepositId: oDeposit.id,
        iOrderId: oDeposit.iOrderId || orderId,
        eGateway: oDeposit.ePaymentGateway,
        eType: logTypeEnums.DEPOSIT,
        oReq: { sInfo: `${oDeposit.ePaymentGateway} payment gateway web-hook(v2) event called.` },
        oRes: postData,
      };
      publishTransaction(logData);
      const response: checkCashfreeStatusResponseInterface = await this.cashfreeCommonService.checkCashfreeStatus(`${orderId}`);
      const { isSuccess, payload = {} } = response;

      // Calculate GST on Deposited Amount
      const { oGST } = await this.paymentCommonService.calculateGST(oDeposit.nCash.toString())
      oDeposit.nBonus = parseFloat(oDeposit.nBonus.toString()) + parseFloat(`${oGST.nRepayBonusAmount}`)
      if (isSuccess) {
        const postData = { txStatus: payload.order_status, orderId: orderId, referenceId: payload.cf_order_id, oGST };
        const { status: resStatus, message } = await this.transactionDao.userDepositUpdateBalance(postData);
        if (resStatus && message) {
          if ([PlatformTypesEnums.ANDROID, PlatformTypesEnums.IOS].includes(oDeposit?.ePlatform)) {
            process.env.CASHFREE_RETURN_URL = undefined;
            // return res.redirect(config.CASHFREE_RETURN_URL)
          }
          return { CASHFREE_REDIRECT: process.env.CASHFREE_RETURN_URL };
        }
      } else {
        return { CASHFREE_REDIRECT: process.env.CASHFREE_RETURN_URL };
      }
    } catch (error) {
      throw error;
    }
  };

  public checkDepositStatus = async (payload: CashfreeDepositStatusPayload): Promise<CashfreeDepositStatusResponse> => {
    try {
      const { iOrderId, iUserId } = payload;
      const user = await this.userDao.countDocuments({ _id: iUserId });
      if (!user) throw new HttpException(StatusCodeEnums.UNAUTHORIZED, messagesEnglish.err_unauthorized);

      // Fetching Deposit details based on id and reference id
      const userDeposit : UserDepositOutput = await this.userDepositDao.findUserDeposit(payload);
      //console.log("userdeposit :", userDeposit);
      if (!userDeposit)
        return {
          status: StatusCodeEnums.NOT_FOUND,
          message: messagesEnglish.not_exist.replace("##", messagesEnglish.cDeposit),
        };

      let { ePaymentStatus, ePaymentGateway } = userDeposit;

      if (ePaymentStatus === paymentStatusEnum.PENDING && ePaymentGateway !== paymentOptionEnums.ADMIN) {
        const logData = {
          iDepositId: userDeposit.id,
          iOrderId,
          eGateway: ePaymentGateway,
          eType: logTypeEnums.DEPOSIT,
          oReq: { sInfo: `${ePaymentGateway} payment gateway order payment status.` },
          oRes: {},
        };

        if ([paymentOptionEnums.CASHFREE, paymentOptionEnums.CASHFREE_UPI].includes(ePaymentGateway)) {
          const response = await this.getOrderPaymentStatus({ iDepositId: `${userDeposit.id}`, orderId: iOrderId });
          logData.oRes = response;

          const { isSuccess, result = {} } = response;

          if (isSuccess) {
            // Calculate GST on Deposited Amount
            const { oGST } = await this.paymentCommonService.calculateGST(userDeposit.nCash.toString())
            userDeposit.nBonus = parseFloat(userDeposit.nBonus.toString()) + parseFloat(`${oGST.nRepayBonusAmount}`)
            const postData = { txStatus: result.order_status, orderId: iOrderId, referenceId: result.cf_order_id , oGST };
            const { ePaymentStatus: eUpdatedStatus } = await this.transactionDao.userDepositUpdateBalance(postData);
            if (eUpdatedStatus) ePaymentStatus = eUpdatedStatus;
          }
        }
        await publishAdminLogs(logData);
      }

      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cDeposit),
        data: { ...userDeposit, ePaymentStatus },
      };
    } catch (error) {
      throw error
    }
  };
  
  private getOrderPaymentStatus = async (payload: {
    iDepositId: string;
    orderId: string;
  }): Promise<{ result: any; isSuccess: boolean }> => {
    const { iDepositId = "", orderId } = payload;
    try {
      try {
        const response = await axios.get(`${process.env.CASHFREE_STABLE_URL}/orders/${orderId}`, {
          headers: {
            "x-client-id": process.env.CASHFREE_APPID,
            "x-client-secret": process.env.CASHFREE_SECRETKEY,
            "x-api-version": "2022-09-01",
          },
        });

        const logData = {
          iDepositId,
          iOrderId: orderId,
          ePlatform: PlatformTypesEnums.ANDROID,
          eGateway: paymentGatewayEnums.CASHFREE,
          eType: logTypeEnums.DEPOSIT,
          oBody: payload,
          oReq: { url: `${process.env.CASHFREE_STABLE_URL}/orders/${orderId}`, orderId },
          oRes: response.data,
        };
        publishTransaction(logData);
        const result = response ? (response.data && response.data.order_status ? response.data : "") : "";
        return { result, isSuccess: true };
      } catch (error) {
        console.log("DepositTransactionError", error);
        const res = { status: error.response.status, message: error.response.data, isSuccess: false };
        const logData = {
          iDepositId,
          iOrderId: orderId,
          ePlatform: PlatformTypesEnums.ANDROID,
          eGateway: paymentGatewayEnums.CASHFREE,
          eType: logTypeEnums.DEPOSIT,
          oBody: payload,
          oReq: { url: `${process.env.CASHFREE_STABLE_URL}/orders/${orderId}`, orderId },
          oRes: res,
        };
        publishTransaction(logData);
      }
    } catch (error) {
      throw error;
    }
  };

  public verifyAppPayment = async (postData: verifyAppPaymentInterface): Promise<defaultResponseInterface> => {
    try {
      const { orderId, orderAmount, referenceId, txStatus, paymentMode, txMsg, txTime, signature } = postData;

      const ePaymentGateway = paymentGatewayEnums.CASHFREE;
      const iDepositId = orderId.includes(process.env.CASHFREE_ORDERID_PREFIX)
        ? Number(orderId.replaceAll(process.env.CASHFREE_ORDERID_PREFIX, ""))
        : Number(orderId);

      const logData = {
        iDepositId,
        iTransactionId: referenceId,
        eGateway: ePaymentGateway,
        eType: logTypeEnums.DEPOSIT,
        oRes: postData,
      };
      // await queuePush('TransactionLog', logData)
      publishTransaction(logData);

      const Hmac = crypto.createHmac(encodingAndEncryption.SHA_256, process.env.CASHFREE_SECRETKEY);
      const signatureData = orderId + orderAmount + referenceId + txStatus + paymentMode + txMsg + txTime;
      const expectedSignature = Hmac.update(signatureData).digest(encodingAndEncryption.BASE_64);

      if (signature === expectedSignature) {
        const oDeposit : UserDepositOutput = await this.userDepositDao.findUserDepositByOrderId(orderId)
        // Calculate GST on Deposited Amount
        const { oGST } = await this.paymentCommonService.calculateGST(oDeposit.nCash.toString())
        oDeposit.nBonus = parseFloat(oDeposit.nBonus.toString()) + parseFloat(`${oGST.nRepayBonusAmount}`)
        const { status, message } = await this.transactionDao.userDepositUpdateBalance({...postData, oGST});
        if (status && message) {
          return { status, message };
        }
      } else {
        throw new HttpException(
          StatusCodeEnums.BAD_REQUEST,
          messagesEnglish.invalid_signature,
        );
      }
    } catch (error) {
      throw error
    }
  };
}