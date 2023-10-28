import { StatusCodeEnums, messagesEnglish, promoCodeStats } from "@/enums/commonEnum/commonEnum";
import { JuspayFlagEnums } from "@/enums/flagEnums/flagEnums";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import { settingsEnums } from "@/enums/settingsEnums/settingsEnums";
import { convertToDecimal } from "@/helpers/helper_functions";
import calculateGSTResponse from "@/interfaces/gst/calculateGSTResponse";
import GSTbreakupInterface from "@/interfaces/gst/gstBreakupInterface";
import GSTbreakupResponse from "@/interfaces/gst/gstBreakupResponse";
import {
  JuspayOrderStatusResponse,
  orderStatusResponse,
} from "@/interfaces/juspayOrderStatusResponse/juspayOrderStatusResponse";
import { HttpException } from "@/library/HttpException/HttpException";
import { JuspayUtils } from "@/library/Juspay/JuspayUtils";
import { PromoCodeModelOutput } from "@/models/promoCodeModel/promoCodeModel";
import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import TransactionDao from "@/src/daos/Transaction/TransactionDao";
import UserDepositDao from "@/src/daos/UserDeposit/UserDepositDao";
import PromoCodeDao from "@/src/daos/promoCode/promoCodeDao";
import settingsDao from "@/src/daos/settingsDao/settingsDao";
import UserBalanceDao from "@/src/daos/userBalance/userBalanceDaos";

export default class PaymentCommonService {

  private juspayUtils: JuspayUtils;
     private promocodeDao: PromoCodeDao;
  private settingsDao: settingsDao;
    private transactionDao: TransactionDao;
    private userBalanceDao: UserBalanceDao;
  private userDepositDao: UserDepositDao;


  constructor() {
    this.juspayUtils = new JuspayUtils();
    this.userDepositDao = new UserDepositDao();
    this.userBalanceDao = new UserBalanceDao();
    this.transactionDao = new TransactionDao();
    this.promocodeDao = new PromoCodeDao();
    this.settingsDao = new settingsDao();
  }

  public getOrderStatus = async (orderId: string): Promise<orderStatusResponse> => {
    try {
      const orderStatus: JuspayOrderStatusResponse = await this.juspayUtils.apiCalling(
        orderId,
        JuspayFlagEnums.ORDER_STATUS,
      );
      let { order_id, status, txn_id } = orderStatus;
     // console.log("juspay order status: ", status);
      let userDeposit: UserDepositOutput = await this.userDepositDao.findUserDepositByOrderId(order_id);
      if (userDeposit === null)
        throw new HttpException(
          StatusCodeEnums.NOT_FOUND,
          messagesEnglish.not_exist.replace("##", messagesEnglish.cDeposit),
        );
      if (status == paymentStatusEnum.CHARGED) {
         // Calculate GST on Deposited Amount
        const { oGST } = await this.calculateGST(userDeposit.nCash.toString())
        userDeposit.nBonus = parseFloat(`${userDeposit.nBonus}`) + parseFloat(`${oGST.nRepayBonusAmount}`)
        const { alreadySuccess, ePaymentStatus } = await this.transactionDao.userDepositUpdateBalance({
          txStatus: paymentStatusEnum.SUCCESS,
          orderId: order_id,
          referenceId: txn_id,
          deposit: userDeposit,
          oGST
        });
        console.log("check 1", { alreadySuccess, ePaymentStatus });
        if (alreadySuccess) status = ePaymentStatus;
        console.log("check 2");
      }
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cDeposit),
        data: {
          id: userDeposit.id,
          iOrderId: order_id,
          ePaymentGateway: paymentGatewayEnums.JUSPAY,
          ePaymentStatus: status === paymentStatusEnum.CHARGED ? paymentStatusEnum.SUCCESS : status,
        },
      };
    } catch (err) {
      throw err;
    }
  };

    public calculateGST = async (nAmount: string): Promise<calculateGSTResponse> => {
    try {
      // Take GST Tax Percentage from Setting Model
      let nPercentage = 0;
      const gstSetting = await this.settingsDao.findOneAndLean({ sKey: settingsEnums.GST }, { nMax: 1 });
      if (gstSetting) {
        // Apply GST Percentage to Deposit Amount
        const nGSTConstant = gstSetting.nMax/(100 + gstSetting.nMax)
        const nGSTAmount = convertToDecimal(Number(nAmount) * nGSTConstant);
        const nAmountAfterGST = convertToDecimal(Number(nAmount) - nGSTAmount);
        const nRepayBonusAmount = nGSTAmount;
        // Make a BreakUp
        const oGSTBreakUp = {
          nAmountAfterGST,
          nRequestedAmount: Number(nAmount), // Deposit amount
          nGSTAmount,
          nRepayBonusAmount,
        };
        console.log("oGSTBreakUp :>> ", oGSTBreakUp, nPercentage);
        return { isSuccess: true, oGST: oGSTBreakUp };
      }
      throw new HttpException(StatusCodeEnums.NOT_FOUND, messagesEnglish.not_exist.replace('##', 'GST setting'))      
    } catch (error) {
      throw error;
    }
  };

  public getGSTBreakUp = async(gstPayload: GSTbreakupInterface) : Promise<GSTbreakupResponse> => {
    try {
      const { nAmount, sPromocode, iUserId } = gstPayload
      let nCash = 0
      let nBonus = 0
      let promocodeId, promocodes

      if (!nAmount) return { status: StatusCodeEnums.BAD_REQUEST, message: messagesEnglish.gst_calculate_error }

      // checking user has valid balance or not
      const oUserBalance = await this.userBalanceDao.findUserBalance(iUserId)
      if (!oUserBalance) return { status: StatusCodeEnums.NOT_FOUND, message: messagesEnglish.not_exist.replace('##', messagesEnglish.cBalance) }

      // Calculating GST on Deposit Amount
      const { oGST } = await this.calculateGST(nAmount)

      // If user has applied promocode than giving promocode bonus in response
      if (sPromocode) {
        const promocode : PromoCodeModelOutput = await this.promocodeDao.getPromocode(promoCodeStats.Y, sPromocode.toUpperCase())
        if (!promocode) return { status: StatusCodeEnums.BAD_REQUEST, message: messagesEnglish.invalid_promo_err }
        if (nAmount && !(promocode.nMaxAmount >= convertToDecimal(Number(nAmount), 2) && promocode.nMinAmount <= convertToDecimal(Number(nAmount), 2))) return { status: StatusCodeEnums.BAD_REQUEST, message: messagesEnglish.promo_amount_err.replace('#', promocode.nMinAmount.toString()).replace('##', promocode.nMaxAmount.toString()) }
        promocodes = promocode
        const { dExpireTime, nAmount: promoAmount, bIsPercent } = promocode
        if (dExpireTime && new Date(dExpireTime) < new Date(Date.now())) return { status: StatusCodeEnums.BAD_REQUEST, message: messagesEnglish.invalid_promo_err }
        promocodeId = promocode._id.toString()
        if (bIsPercent) {
          nBonus = Number(parseFloat((promoAmount * parseFloat(nAmount) / 100).toString()).toFixed(2))
          nCash = parseFloat(nAmount)
        } else {
          nBonus = parseFloat(promoAmount.toString())
          nCash = parseFloat(nAmount)
        }
        oGST.nPromocodeBonus = nBonus
      }

      return { status: StatusCodeEnums.OK, message: messagesEnglish.success.replace('##', messagesEnglish.gstBreakup), data: { ...oGST } }
    } catch (error) {
      throw error;
    }
    
  }
}
