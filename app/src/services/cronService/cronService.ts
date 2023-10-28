import { HttpException } from "@/library/HttpException/HttpException";
import scheduler from "node-schedule";
import { messagesEnglish, StatusCodeEnums } from "@/enums/commonEnum/commonEnum";
import UserDepositDao from "@/src/daos/UserDeposit/UserDepositDao";
import userWithdrawDao from "@/src/daos/userWithdraw/userWithdrawDao";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import TransactionDao from "@/src/daos/Transaction/TransactionDao";
import CashfreeCommonService from "../cashfreeService/cashfreeCommonService";
import PaymentCommonService from "../paymentService/paymentCommonService";
import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";

export default class cronService {
  private cashfreeCommonService: CashfreeCommonService;
  private paymentCommonService: PaymentCommonService;

  private userDepositDao: UserDepositDao;
  private userWithdrawDao: userWithdrawDao;
  private transactionDao: TransactionDao;

  constructor() {
    this.cashfreeCommonService = new CashfreeCommonService();
    this.paymentCommonService = new PaymentCommonService();
    this.userDepositDao = new UserDepositDao();
    this.userWithdrawDao = new userWithdrawDao();
    this.transactionDao = new TransactionDao();
  }

  public depositCron = async (): Promise<defaultResponseInterface> => {
    try {
      let pendingDeposits: UserDepositOutput[];
      pendingDeposits = await this.userDepositDao.findPendingDeposits();
      for (const deposit of pendingDeposits) {
        const { ePaymentGateway } = deposit;
        if (ePaymentGateway === paymentOptionEnums.CASHFREE || ePaymentGateway === paymentOptionEnums.CASHFREE_UPI) {
          const { isSuccess, payload, error } = await this.cashfreeCommonService.checkCashfreeStatus(`${deposit.id}`);
          if (!isSuccess) {
            throw new HttpException(error.status, error.message);
          }
          // Calculate GST on Deposited Amount
          const { oGST } = await this.paymentCommonService.calculateGST(deposit.nCash.toString())
          deposit.nBonus = parseFloat(deposit.nBonus.toString()) + parseFloat(`${oGST.nRepayBonusAmount}`)
          await this.transactionDao.processPayment({deposit, payload, oGST});
        } else if (ePaymentGateway === paymentOptionEnums.JUSPAY) {
            await this.paymentCommonService.getOrderStatus(`${deposit.iOrderId}`)
        }
      }
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.successfully.replace("##", messagesEnglish.processDepositPayment),
      };
    } catch (error) {
      throw error;
    }
  };

  public payoutCronCashfree = async (): Promise<defaultResponseInterface> => {
    try {
      const dCurrentTime = new Date();
      dCurrentTime.setTime(dCurrentTime.getTime() - 60 * 60 * 1000);

      const initiatedWithdraws = await this.userWithdrawDao.findInitiatedWithdraws(dCurrentTime);
      for (const withdraw of initiatedWithdraws) {
        const { id, ePaymentGateway } = withdraw;
        if (ePaymentGateway === paymentGatewayEnums.CASHFREE) {
          const { isSuccess, payload, error } = await this.cashfreeCommonService.checkCashfreePayoutStatus(Number(id));
          if (!isSuccess) {
            throw new Error(error);
          }
          await this.transactionDao.processPayoutCashfreeCron(withdraw, payload);
        }
      }

      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.successfully.replace("##", messagesEnglish.processInitiatePayout),
      };
    } catch (error) {
      throw error;
    }
  };

}
