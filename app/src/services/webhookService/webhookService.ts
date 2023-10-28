import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import { HttpException } from "@/library/HttpException/HttpException";
import UserDepositDao from "@/src/daos/UserDeposit/UserDepositDao";
import { messagesEnglish, StatusCodeEnums } from "@/enums/commonEnum/commonEnum";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import publishTransaction from "@/connections/rabbitmq/queue/transactionLogQueue";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { logTypeEnums } from "@/enums/logTypeTnums/logTypeEnums";
import cashfreeDepositWebhookInterface from "@/interfaces/cashfreePayment/cashfreePayment";
import CashfreePayoutWebhook from "@/interfaces/cashfreePayment/cashfreePayment";
import TransactionDao from "@/src/daos/Transaction/TransactionDao";
import PaymentCommonService from "../paymentService/paymentCommonService";

export default class webhookService {
  private userDepositDao: UserDepositDao;
  private transactionDao: TransactionDao;
  private paymentCommonService: PaymentCommonService;

  constructor() {
    this.userDepositDao = new UserDepositDao();
    this.transactionDao = new TransactionDao();
    this.paymentCommonService = new PaymentCommonService();
  }

  public cashfreeDepositWebhook = async (webhook: cashfreeDepositWebhookInterface | any): Promise<defaultResponseInterface> => {
    try {
      const { data = {} } = webhook;
      if (!data) {
        throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.error);
      }
      const { order, payment } = data;
      const { order_id: orderId = "" } = order;
      const { payment_status: paymentStatus, cf_payment_id: iTransactionId } = payment;

      const oDeposit = await this.userDepositDao.findUserDepositByOrderId(orderId);
      if (!oDeposit)
        return {
          status: StatusCodeEnums.BAD_REQUEST,
          message: messagesEnglish.not_found.replace("##", messagesEnglish.cDeposit),
        };

      const logData = {
        iDepositId: oDeposit.id || "",
        iOrderId: oDeposit.iOrderId || orderId,
        iTransactionId,
        eGateway: oDeposit.ePaymentGateway,
        eType: logTypeEnums.DEPOSIT,
        oReq: { sInfo: `${oDeposit.ePaymentGateway} payment gateway webhook(v2) event called.` },
        oRes: webhook,
      };
      await publishTransaction(logData);
         // Calculate GST on Deposited Amount
      const { oGST } = await this.paymentCommonService.calculateGST(oDeposit.nCash.toString())
      oDeposit.nBonus = parseFloat(oDeposit.nBonus.toString()) + parseFloat(`${oGST.nRepayBonusAmount}`)

      const updateData = {
        txStatus: paymentStatus === paymentStatusEnum.USER_DROPPED ? paymentStatusEnum.FAILED : paymentStatus,
        orderId,
        referenceId: iTransactionId,
        oGST
      };
      const { status: resStatus, message } = await this.transactionDao.userDepositUpdateBalance(updateData);
      if (resStatus && message) return { status: resStatus, message };
    } catch (error) {
      throw error;
    }
  };

  public cashfreeWebhook = async (postData: CashfreePayoutWebhook): Promise<defaultResponseInterface> => {
    try {
      const { event } = postData;

      if (event === paymentStatusEnum.TRANSFER_REVERSED) {
        const iWithdrawId = Number(postData.transferId.toString().replaceAll(process.env.CASHFREE_ORDERID_PREFIX, ""));

        const logData = {
          iWithdrawId,
          eGateway: paymentGatewayEnums.CASHFREE,
          eType: logTypeEnums.WITHDRAW,
          oReq: { sInfo: `Cashfree payout Webhook ${event} event.` },
          oRes: postData,
        };
        await publishTransaction(logData);

        await this.transactionDao.reversedTransaction(iWithdrawId);
      }
      if (
        Number(postData.acknowledged) &&
        [paymentStatusEnum.TRANSFER_SUCCESS, paymentStatusEnum.TRANSFER_ACKNOWLEDGED].includes(event)
      ) {
        const iWithdrawId = Number(postData.transferId.toString().replaceAll(process.env.CASHFREE_ORDERID_PREFIX, ""));

        const logData = {
          iWithdrawId,
          eGateway: paymentGatewayEnums.CASHFREE,
          eType: logTypeEnums.WITHDRAW,
          oReq: { sInfo: `Cashfree payout Webhook ${event} event.` },
          oRes: postData,
        };
        await publishTransaction(logData);
        if (iWithdrawId) await this.transactionDao.successTransaction(postData, iWithdrawId);
      }
      if ([paymentStatusEnum.TRANSFER_REJECTED, paymentStatusEnum.TRANSFER_FAILED].includes(event)) {
        const iWithdrawId = Number(postData.transferId.toString().replaceAll(process.env.CASHFREE_ORDERID_PREFIX, ""));

        const logData = {
          iWithdrawId,
          eGateway: paymentGatewayEnums.CASHFREE,
          eType: logTypeEnums.WITHDRAW,
          oReq: { sInfo: `Cashfree payout Webhook ${event} event.` },
          oRes: postData,
        };

        const ePaymentStatus =
          event === paymentStatusEnum.TRANSFER_FAILED ? paymentStatusEnum.CANCELLED : paymentStatusEnum.REFUNDED;
        await Promise.all([
          this.transactionDao.cancellOrRejectTransaction(postData, ePaymentStatus, iWithdrawId),
          publishTransaction(logData),
        ]);
      }
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.action_success.replace("##", messagesEnglish.cresponseGet),
      };
    } catch (error) {
      throw error;
    }
  };
}
