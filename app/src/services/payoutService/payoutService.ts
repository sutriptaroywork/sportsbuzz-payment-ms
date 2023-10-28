import { messagesEnglish, StatusCodeEnums, statusEnums } from "@/enums/commonEnum/commonEnum";
import { HttpException } from "@/library/HttpException/HttpException";
import userWithdrawDao from "@/src/daos/userWithdraw/userWithdrawDao";
import payoutOptionDao from "@/src/daos/payoutOptionDao/payoutOptionDao";
import UserDao from "@/src/daos/user/userDaos";
import settingsDao from "@/src/daos/settingsDao/settingsDao";
import bankDao from "@/src/daos/bank/bankDao";
import kycDao from "@/src/daos/kyc/kycDao";
//import db from "@/databaseConfig/sqlConfig";
import {
  convertToDecimal,
  getPaginationValues,
  pick,
  s3,
} from "@/helpers/helper_functions";
import { payoutStatusEnums } from "@/enums/payoutStatusEnums/payoutStatusEnums";
import UserBalanceDao from "@/src/daos/userBalance/userBalanceDaos";
import PassbookDao from "@/src/daos/passbook/passbookDao";
import StatisticDao from "@/src/daos/statistic/statisticDao";
import { ObjectId } from "bson";
import { payoutOptionOutput } from "@/models/payoutOptionModel/payoutOptionModel";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { payoutOptionEnums } from "@/enums/payoutOptionEnums/payoutOption";
import { kycStatusEnums } from "@/enums/kycStatusEnums/kycStatusEnums";
import payoutProcessInterface from "@/interfaces/payoutProcess/payoutProcessInterface";
import { adminPayEnums } from "@/enums/adminPayEnums/adminPayEnums";
import { credentialDao } from "@/src/daos/credentialDao/credentialDao";
import payoutUpdateInterface, { payoutUpdateResponse } from "@/interfaces/payoutUpdate/payoutUpdateInterface";
import Flatted from "flatted";
import bcrypt from "bcryptjs";
import {
  adminWithdrawCountResponse,
  adminWithdrawListInterface,
  adminWithdrawListResponse,
} from "@/interfaces/admin/adminWithdrawList/adminWithdrawList";
import { userWithdrawOutput } from "@/models/userWithdrawModel/userWithdrawModel";
import payoutCreateInterface from "@/interfaces/payoutCreate/payoutCreate";
import { UserModelOutput } from "@/models/userModel/userModel";
import { SettingsOutput } from "@/models/settingsModel/settingsModel";
import { sKeyEnums } from "@/enums/sKeyEnums/sKeyEnums";
import { withdrawStatusResponse } from "@/interfaces/withdrawStatusResponse/withdrawStatusResponse";
import { adminWithdrawInterface } from "@/interfaces/admin/adminWithdraw/adminWithdraw";
import {
  adminPayoutOptionsListInterface,
  adminPayoutOptionsListResponse,
} from "@/interfaces/payoutPayload/payoutPayloadInterface";
import { settingsEnums } from "@/enums/settingsEnums/settingsEnums";
import { environmentEnums } from "@/enums/environmentEnums/environmentEnums";
import TransactionDao from "@/src/daos/Transaction/TransactionDao";
import { TransactionTypeEnums } from "@/enums/transactionTypeEnums/transactionTypesEnums";
import { UserFieldsWithdraw } from "@/interfaces/userFields/userFieldsInterface";
import AdminDao from "@/src/daos/admin/AdminDao";
import PayoutCommonService from "./payoutCommonService";
import CashfreeCommonService from "../cashfreeService/cashfreeCommonService";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";


export default class payoutService {
  private adminDao: AdminDao;
  private credentialDao: credentialDao;
  private userWithdrawDao: userWithdrawDao;
  private payoutOptionDao: payoutOptionDao;
  private userBalanceDao: UserBalanceDao;
  private passbookDao: PassbookDao;
  private statisticDao: StatisticDao;
  private userDao: UserDao;
  private settingsDao: settingsDao;
  private bankDao: bankDao;
  private kycDao: kycDao;
  private payoutCommonService: PayoutCommonService;
  private transactionDao: TransactionDao;
  private cashfreeCommonService: CashfreeCommonService;

  constructor() {
    this.adminDao = new AdminDao();
    this.credentialDao = new credentialDao();
    this.userWithdrawDao = new userWithdrawDao();
    this.payoutOptionDao = new payoutOptionDao();
    this.userBalanceDao = new UserBalanceDao();
    this.passbookDao = new PassbookDao();
    this.statisticDao = new StatisticDao();
    this.userDao = new UserDao();
    this.settingsDao = new settingsDao();
    this.bankDao = new bankDao();
    this.kycDao = new kycDao();
    this.transactionDao = new TransactionDao();
    this.payoutCommonService = new PayoutCommonService();
    this.cashfreeCommonService = new CashfreeCommonService();
  }

  public adminList = async (payload: adminWithdrawListInterface): Promise<adminWithdrawListResponse> => {
    try {
      let {
        start = 0,
        limit = 10,
        sort = "dCreatedAt",
        order,
        search,
        status: paymentStatus,
        method,
        datefrom,
        dateto,
        isFullResponse,
        reversedFlag,
      } = payload;

      const orderBy = order && order === "asc" ? "ASC" : "DESC";
      start = start || 0;
      limit = limit || 0;
      sort = sort || "dCreatedAt";
      const { query, aUsers } = await this.payoutCommonService.adminWithdrawListQuery(
        paymentStatus,
        method,
        search,
        "W",
        reversedFlag,
      );

      if ((!datefrom || !dateto) && [true, "true"].includes(isFullResponse)) {
        return {
          status: StatusCodeEnums.BAD_REQUEST,
          message: messagesEnglish.date_filter_err,
        };
      }

      if ([true, "true"].includes(isFullResponse)) query.push({ eUserType: UserTypeEnums.USER });

      const data: userWithdrawOutput[] = await this.userWithdrawDao.findAllWithdraws(
        query,
        sort,
        orderBy,
        datefrom,
        dateto,
        isFullResponse,
        start,
        limit,
      );
      const aUserIds = [];

      if (data.length) {
        data.forEach((record) => {
          if (!aUsers.includes((user) => user._id.toString() === record.iUserId.toString())) {
            aUserIds.push(record.iUserId.toString());
          }
        });

        if (aUserIds.length) {
          const aWithdrawUsers = await this.userDao.findAllUserUsingIds(aUserIds);
          if (aWithdrawUsers.length) aUsers.push(...aWithdrawUsers);
        }
      }
      const withdrawData = await this.addUserFields(data, aUsers);

      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.withdraw),
        data: { rows: withdrawData },
      };
    } catch (error) {
      throw error;
    }
  };

  public adminGetCounts = async (payload: adminWithdrawListInterface): Promise<adminWithdrawCountResponse> => {
    try {
       let {
          search
        } = payload;
      let aUsers = [];
      const nSearchNumber = Number(search);
      if (!isNaN(nSearchNumber)) {
        aUsers = await this.userDao.findAllUsersWithRegex(search);
      } else {
        aUsers = await this.userDao.findAllUsersWithRegex(search);
      }
      const adminCounts: adminWithdrawCountResponse = await this.userWithdrawDao.adminGetCounts(payload,aUsers);
      return adminCounts;
    } catch (error) {
      throw error;
    }
  };

  public payoutOptionsList = async (): Promise<payoutOptionOutput[]> => {
    try {
      const options: payoutOptionOutput[] = await this.payoutOptionDao.listAll();
      return options;
    } catch (error) {
      console.error("payout options list error", error);
      throw error;
    }
  };

  public adminProcessWithdraw = async (payload: payoutProcessInterface): Promise<defaultResponseInterface> => {
    try {
      const { ePaymentStatus, iWithdrawId, iPassbookId, isVerify, Token } = payload;
      const oWithdraw = await this.userWithdrawDao.findOne({ where: { id: iWithdrawId } });
      console.log("withdraw process: ", oWithdraw);
      if (
        ePaymentStatus === payoutStatusEnums.SUCCESS &&
        (oWithdraw.ePaymentStatus === payoutStatusEnums.PENDING ||
          oWithdraw.ePaymentStatus === payoutStatusEnums.ON_HOLD)
      ) {
        const { success: hasBalance, message: balanceSuccess } = await this.cashfreeCommonService.getUserBalance(
          oWithdraw.iUserId,
          iWithdrawId,
          isVerify,
          Token,
        );

        if (!hasBalance)
          return {
            status: StatusCodeEnums.NOT_ACCEPTABLE,
            message: messagesEnglish.error_payout_balance_check.replace("##", balanceSuccess),
          };

        const { success: BenficiaryExist, message: benSuccess } = await this.cashfreeCommonService.getBenficiaryDetails(
          oWithdraw.iUserId,
          isVerify,
          Token,
          iWithdrawId,
          iPassbookId,
        );
        if (!BenficiaryExist)
          return {
            status: StatusCodeEnums.BAD_REQUEST,
            message: messagesEnglish.error_payout_fetchOrAdd_Beneficiary.replace("##", benSuccess),
          };
      }

      return await this.transactionDao.processAdminWithdraw(payload);
    } catch (error) {
      throw error;
    }
  };

  public adminWithdraw = async (payload: adminWithdrawInterface): Promise<defaultResponseInterface> => {
    try {
      let { nAmount, sPassword } = payload;
      nAmount = Number(nAmount) || 0;
      const pass = await this.credentialDao.findOneAndLean({ eKey: adminPayEnums.PAY });
      if (!bcrypt.compareSync(sPassword, pass.sPassword)) {
        return {
          status: StatusCodeEnums.BAD_REQUEST,
          message: messagesEnglish.auth_failed,
        };
      } 
      try {
        const result : defaultResponseInterface = await this.transactionDao.adminWithdrawCreate({ ...payload });
        return result
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  public userCancelWithdraw = async (iWithdrawId: number): Promise<defaultResponseInterface> => {
    try {
      const cancelTransaction = await this.transactionDao.cancelWithdraw(iWithdrawId);
      return cancelTransaction;
    } catch (error) {
      throw error;
    }
  };

  public createPayout = async (payoutPayload: payoutCreateInterface): Promise<defaultResponseInterface> => {
    try {
      let { nAmount: amount, payoutOptionId } = payoutPayload;
      const payoutOption: payoutOptionOutput = await this.payoutOptionDao.findById(payoutOptionId);
      if (!payoutOption || payoutOption.bEnable === false) {
        return {
          status: StatusCodeEnums.BAD_REQUEST,
          message: messagesEnglish.not_exist.replace("##", messagesEnglish.invalid_payout),
        };
      } 

      const { eKey: ePaymentGateway, nMinAmount, nMaxAmount } = payoutOption;
      const nFee = payoutOption.nWithdrawFee;

      const iUserId = payoutPayload.userId;
      const user: UserModelOutput = await this.userDao.getUserById(iUserId);

      if (user.bIsInternalAccount === true) {
        return {
          status: StatusCodeEnums.BAD_REQUEST,
          message: messagesEnglish.withdraw_not_permited.replace("##", messagesEnglish.internal_user),
        };
      }

      const withdrawValidation: SettingsOutput = await this.settingsDao.findOneAndLean({
        sKey: sKeyEnums.WITHDRAW,
      });
      if (!withdrawValidation) {
        return {
          status: StatusCodeEnums.NOT_FOUND,
          message: messagesEnglish.not_exist.replace("##", messagesEnglish.cvalidationSetting),
        };
      }

      if (parseInt(`${amount}`) < withdrawValidation.nMin) {
        return {
          status: StatusCodeEnums.BAD_REQUEST,
          message: messagesEnglish.min_err
            .replace("##", messagesEnglish.withdraw)
            .replace("#", `₹${withdrawValidation.nMin}`),
        };
      }
      if (parseInt(`${amount}`) > withdrawValidation.nMax) {
        return {
          status: StatusCodeEnums.BAD_REQUEST,
          message: messagesEnglish.max_err
            .replace("##", messagesEnglish.withdraw)
            .replace("#", `₹${withdrawValidation.nMax}`),
        };
      } 

      let sErrorMessage = "";
      if (!user.bIsMobVerified) {
        sErrorMessage = sErrorMessage
          ? sErrorMessage.concat(` ${messagesEnglish.mob_verify_err}`)
          : sErrorMessage.concat(messagesEnglish.mob_verify_err);
      }

      const kycDetails = await this.kycDao.findAcceptedKyc(user._id);
      if (!kycDetails) {
        sErrorMessage = sErrorMessage
          ? sErrorMessage.concat(` ${messagesEnglish.kyc_not_approved}`)
          : sErrorMessage.concat(messagesEnglish.kyc_not_approved);
      }
      if (kycDetails && kycDetails.oPan.eStatus !== kycStatusEnums.ACCEPTED) {
        sErrorMessage = sErrorMessage
          ? sErrorMessage.concat(` ${messagesEnglish.pancard_not_approved}`)
          : sErrorMessage.concat(messagesEnglish.pancard_not_approved);
      }
      if (kycDetails && kycDetails.oAadhaar.eStatus !== kycStatusEnums.ACCEPTED) {
        sErrorMessage = sErrorMessage
          ? sErrorMessage.concat(` ${messagesEnglish.aadharcard_not_approved}`)
          : sErrorMessage.concat(messagesEnglish.aadharcard_not_approved);
      }

      const bankDetails = await this.bankDao.findOneAndLean({
        iUserId: user._id,
      });
      if (!bankDetails || !bankDetails.sAccountNo || !bankDetails.sIFSC) {
        sErrorMessage = sErrorMessage
          ? sErrorMessage.concat(` ${messagesEnglish.fill_bankdetails_err}`)
          : sErrorMessage.concat(messagesEnglish.fill_bankdetails_err);
      }

      if (sErrorMessage) {
        throw new HttpException(StatusCodeEnums.BAD_REQUEST, sErrorMessage);
      }

      let nWithdrawFee = 0;
      if (parseInt(`${amount}`) >= nMinAmount && parseInt(`${amount}`) <= nMaxAmount) {
        nWithdrawFee = nFee;
      } 

      const withdrawRateLimit = await this.withdrawRateLimit(iUserId);
      let details = {};
      switch (payoutOption.eKey) {
        case payoutOptionEnums.ACCOUNT_IFSC:
          details = { name: user.sName, ifsc: bankDetails.sIFSC, account: bankDetails.sAccountNo };
          break;
        case payoutOptionEnums.UPI_ID:
          details = { name: user.sName, vpa: "" };
          break;
        default:
          details = { name: user.sName, ifsc: bankDetails.sIFSC, account: bankDetails.sAccountNo };
      }
      if (withdrawRateLimit.status === StatusCodeEnums.OK) {
        const winBifurcate = await this.settingsDao.findOneAndLean({ sKey: settingsEnums.WIN_BIFURCATE, eStatus: statusEnums.Y })
        const ePaymentGateway = payoutOptionEnums.CARD
        return await this.transactionDao.createWithdraw({
          user,
          nAmount: amount,
          nWithdrawFee,
          ePaymentGateway,
          winBifurcate,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  private withdrawRateLimit = async (iUserId: ObjectId | string): Promise<defaultResponseInterface> => {
    try {
      if (process.env.NODE_ENV !== environmentEnums.PRODUCTION) {
        return { status: StatusCodeEnums.OK, message: "success" };
      }

      const withdrawRateLimit = await this.settingsDao.findOneAndLean({ sKey: settingsEnums.USER_WITHDRAW_RATE_LIMIT, eStatus: statusEnums.Y });
      const withdrawRateLimitTimeFrame = await this.settingsDao.findOneAndLean({ sKey: settingsEnums.USER_WITHDRAW_RATE_LIMIT_TIME_FRAME, eStatus: statusEnums.Y });

      if (!withdrawRateLimit || !withdrawRateLimitTimeFrame) {
        return { status: StatusCodeEnums.OK, message: "success" };
      }

      const currentDate = new Date().toISOString();
      const fromDate = new Date(
        new Date().setMinutes(new Date().getMinutes() - parseInt(`${withdrawRateLimitTimeFrame.nMax}`)),
      ).toISOString();

      const count: number = await this.userWithdrawDao.findWithdrawCountInRange({ fromDate, currentDate, iUserId });

      if (count >= parseInt(`${withdrawRateLimit.nMax}`)) {
        return {
          status: StatusCodeEnums.TOO_MANY_REQUEST,
          message: messagesEnglish.limit_reached.replace("##", messagesEnglish.cWithdrawRequest),
        };
      }

      return { status: StatusCodeEnums.OK, message: "success" };
    } catch (error) {
      throw error;
    }
  };

  public checkWithdrawStatus = async (iUserId: string): Promise<withdrawStatusResponse> => {
    try {
      const user = await this.userDao.findById(iUserId);
      if (!user) {
        return {
          status: StatusCodeEnums.UNAUTHORIZED,
          message: messagesEnglish.err_unauthorized,
        };
      }
      if (user.bIsInternalAccount === true) {
        return {
          status: StatusCodeEnums.BAD_REQUEST,
          message: messagesEnglish.withdraw_not_permited.replace("##", messagesEnglish.internal_user),
        };
      }
      const { userWithdraw, bFlag } = await this.userWithdrawDao.checkWithdrawStatus(iUserId);
      if (!bFlag) {
        return {
          status: StatusCodeEnums.OK,
          message: messagesEnglish.success.replace("##", messagesEnglish.withdraw),
          data: { pending: false },
        };
      }
      userWithdraw.eUserType = undefined;
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.pending_withdrawal_exists,
        data: { pending: true, userWithdraw },
      };
    } catch (error) {
      throw error;
    }
  };

  public adminGet = async (id: string): Promise<payoutUpdateResponse> => {
    try {
      const payoutOption = await this.payoutOptionDao.findById(id);
      if (!payoutOption)
        throw new HttpException(
          StatusCodeEnums.NOT_FOUND,
          messagesEnglish.not_exist.replace("##", messagesEnglish.cpayoutOption),
        );

      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cpayoutOption),
        data: payoutOption,
      };
    } catch (error) {
      throw error;
    }
  };

  public add = async (payload: payoutUpdateInterface): Promise<payoutUpdateResponse> => {
    try {
      const data: payoutOptionOutput = await this.payoutOptionDao.create({ ...payload, bEnable: false });
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.add_success.replace("##", messagesEnglish.snewPaymentOption),
        data,
      };
    } catch (error) {
      throw error;
    }
  };

  public adminPayoutOptionsList = async (
    payload: adminPayoutOptionsListInterface,
  ): Promise<adminPayoutOptionsListResponse> => {
    try {
      const { start, limit, sorting, search } = getPaginationValues(payload);

      const query = search ? { sName: { $regex: new RegExp("^.*" + search + ".*", "i") } } : {};
      const projection = {
        sName: 1,
        nOrder: 1,
        sImage: 1,
        eKey: 1,
        sOffer: 1,
        bEnable: 1,
        dCreatedAt: 1,
      };
      const results: payoutOptionOutput = await this.payoutOptionDao.findAndSort({
        query,
        projection,
        start,
        limit,
        sorting,
      });

      const total: number = await this.payoutOptionDao.countDocuments({ ...query });

      const data = [{ total, results }];
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cpaymentOption),
        data,
      };
    } catch (error) {
      throw error;
    }
  };

  public passbookEntriesByTransactionTypes = async (iUserId: string): Promise<any> => {
    try {
      return await Promise.all([
        this.passbookDao.passbookEntriesByTransactionTypesHelper(iUserId, "nCash", TransactionTypeEnums.PLAY),
        this.passbookDao.passbookEntriesByTransactionTypesHelperBonusZero(iUserId, "nBonus", TransactionTypeEnums.PLAY),
        this.passbookDao.passbookEntriesByTransactionTypesHelper(iUserId, "nCash", TransactionTypeEnums.PLAY_RETURN),
        this.passbookDao.passbookEntriesByTransactionTypesHelperBonusZero(
          iUserId,
          "nBonus",
          TransactionTypeEnums.PLAY_RETURN,
        ),
        this.userWithdrawDao.findOnePendingWithUserId(iUserId),
        this.userBalanceDao.findUserBalance(iUserId),
        this.passbookDao.passbookEntriesByTransactionTypesHelper(
          iUserId,
          "nAmount",
          TransactionTypeEnums.CREATOR_BONUS,
        ),
        this.passbookDao.passbookEntriesByTransactionTypesHelper(iUserId, "nAmount", TransactionTypeEnums.BONUS),
        this.passbookDao.passbookEntriesByTransactionTypesHelper(iUserId, "nAmount", TransactionTypeEnums.REFER_BONUS),
        this.passbookDao.passbookEntriesByTransactionTypesHelper(iUserId, "nAmount", TransactionTypeEnums.BONUS_EXPIRE),
        this.passbookDao.passbookEntriesByTransactionTypesHelperCashZero(
          iUserId,
          "nCash",
          TransactionTypeEnums.CASHBACK,
        ),
        this.passbookDao.passbookEntriesByTransactionTypesHelperBonusZero(
          iUserId,
          "nBonus",
          TransactionTypeEnums.CASHBACK,
        ),
      ]);
    } catch (error) {
      throw error;
    }
  };

  public isPaymentDebuggerMismatch = async (iUserId: string): Promise<boolean> => {
    /**
     * Check data inside passbook and in statistics table are same or not:
     * if Not return false. Means Data is mismatch.
     */
    const [userBalance, statsData] = await Promise.all([
      await this.userBalanceDao.findOne({ where: { iUserId }, raw: true }),
      await this.statisticDao.findOneAndLean({ iUserId }),
    ]);

    if (!userBalance && !statsData) return true;
    /**
     * Comparing userblance and stats
     * [Total Deposit][Total Withdrawal][Total Winnings][Total Bonus Earned]
     * [Current Winning Balance] [Current Bonus] [Current Deposit Balance]
     */
    switch (true) {
      case convertToDecimal(userBalance.nTotalDepositAmount) !== convertToDecimal(statsData.nDeposits):
        return true;
      case convertToDecimal(userBalance.nTotalWithdrawAmount) !== convertToDecimal(statsData.nWithdraw):
        return true;
      case convertToDecimal(userBalance.nTotalWinningAmount) !== convertToDecimal(statsData.nTotalWinnings):
        return true;
      case convertToDecimal(userBalance.nTotalBonusEarned) !== convertToDecimal(statsData.nBonus):
        return true;
      case convertToDecimal(userBalance.nCurrentWinningBalance) - convertToDecimal(statsData.nActualWinningBalance) !==
        0:
        return true;
      case convertToDecimal(userBalance.nCurrentBonus) - convertToDecimal(statsData.nActualBonus) !== 0:
        return true;
      case convertToDecimal(userBalance.nCurrentDepositBalance) - convertToDecimal(statsData.nActualDepositBalance) !==
        0:
        return true;
    }

    let [nTotalPlayedCash, nTotalPlayedBonus, nTotalPlayReturnCash, nTotalPlayReturnBonus] =
      await this.passbookEntriesByTransactionTypes(iUserId);

    // comparing [Total Played Cash]
    nTotalPlayedCash = nTotalPlayedCash.length ? convertToDecimal(nTotalPlayedCash[0].total || 0) : 0;
    if (convertToDecimal(nTotalPlayedCash) !== convertToDecimal(statsData.nTotalPlayedCash)) return true;

    // comparing [Total Played Bonus]
    nTotalPlayedBonus = nTotalPlayedBonus.length ? convertToDecimal(nTotalPlayedBonus[0].total || 0) : 0;
    if (convertToDecimal(nTotalPlayedBonus) !== convertToDecimal(statsData.nTotalPlayedBonus)) return true;

    // comparing [Total Play Return Cash]
    nTotalPlayReturnCash = nTotalPlayReturnCash.length ? convertToDecimal(nTotalPlayReturnCash[0].total || 0) : 0;
    if (convertToDecimal(nTotalPlayReturnCash) !== convertToDecimal(statsData.nTotalPlayReturnCash)) return true;

    // comparing [Total Play Return Bonus]
    nTotalPlayReturnBonus = nTotalPlayReturnBonus.length ? convertToDecimal(nTotalPlayReturnBonus[0].total || 0) : 0;
    if (convertToDecimal(nTotalPlayReturnBonus) !== convertToDecimal(statsData.nTotalPlayReturnBonus)) return true;
    return false;
  };

  public update = async (payload: payoutUpdateInterface): Promise<payoutUpdateResponse> => {
    try {
      const projection = pick(payload, [
        "sTitle",
        "eType",
        "sImage",
        "sInfo",
        "eKey",
        "bEnable",
        "nWithdrawFee",
        "nMinAmount",
        "nMaxAmount",
      ]);

      const { sImage, id } = payload;

      const data: payoutOptionOutput = await this.payoutOptionDao.updateOne(
        id,
        { ...projection },
        { new: true, runValidators: true },
      );
      if (!data)
        throw new HttpException(
          StatusCodeEnums.NOT_FOUND,
          messagesEnglish.not_exist.replace("##", messagesEnglish.cpayoutOption),
        );

      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: data.sImage,
      };

      let payoutOption;
      if (s3Params && data.sImage !== sImage) {
        payoutOption = await s3.deleteObject(s3Params); // We'll remove old image from s3 bucket also
        payoutOption = Flatted.stringify(payoutOption);
      }
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.update_success.replace("##", messagesEnglish.cpayoutOptionDetails),
        data: payoutOption || data,
      };
    } catch (error) {
      throw error;
    }
  };

  public addUserFields = async (withdraw, users = []): Promise<UserFieldsWithdraw[]> => {
    try {
      let data;
      const oUser = {};
      const oAdmin = {};
      const { length } = withdraw;

      if (users.length) {
        data = users;
      } else {
        const withdrawIds = withdraw.map((p) => new ObjectId(p.iUserId));
        data = await this.userDao.findAllUserUsingIds(withdrawIds);
      }
      data.forEach((usr, i) => {
        oUser[usr._id.toString()] = i;
      });

      const aAdminId = withdraw.map(({ iWithdrawalDoneBy }) => {
        if (iWithdrawalDoneBy) return new ObjectId(iWithdrawalDoneBy);
      });

      const aAdmin = await this.adminDao.findAllByIds(aAdminId);
      aAdmin.forEach((usr, i) => {
        oAdmin[usr._id.toString()] = i;
      });

      for (let i = 0; i < length; i++) {
        const { iUserId, iWithdrawalDoneBy, ePaymentStatus } = withdraw[i];
        const user = typeof oUser[iUserId.toString()] === "number" ? { ...data[oUser[iUserId.toString()]] } : {};

        // const user = data.find((u) => u._id.toString() === iUserId.toString());
        if (
          user &&
          ![payoutStatusEnums.PENDING, payoutStatusEnums.CANCELLED, payoutStatusEnums.ON_HOLD].includes(
            ePaymentStatus,
          ) &&
          iWithdrawalDoneBy
        ) {
          // const admin = await AdminModel.findById(iWithdrawalDoneBy, {
          //   sUsername: 1,
          //   _id: 0,
          // }).lean();
          // const admin = aAdmin.find(({ _id }) => iWithdrawalDoneBy === _id.toString())
          const admin: any =
            typeof oAdmin[iWithdrawalDoneBy.toString()] === "number"
              ? { ...aAdmin[oAdmin[iWithdrawalDoneBy.toString()]] }
              : {};
          user.sName = admin ? admin.sUsername : "";
        }
        withdraw[i] = { ...withdraw[i], ...user, _id: undefined };
      }
      return withdraw;
    } catch (error) {
      throw error;
    }
  };
}
