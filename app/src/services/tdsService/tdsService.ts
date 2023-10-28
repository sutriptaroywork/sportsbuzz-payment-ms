import { HttpException } from "@/library/HttpException/HttpException";
import moment from "moment";
import UserTDSDao from "@/src/daos/tds/tdsDao";
import { searchValues, createXlsxFile, sendMailTo } from "@/helpers/helper_functions";
import UserBalanceDao from "@/src/daos/userBalance/userBalanceDaos";
import UserDao from "@/src/daos/user/userDaos";
import { StatusCodeEnums, messagesEnglish } from "@/enums/commonEnum/commonEnum";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { ObjectId } from "mongodb";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import tdsBreakupInterface from "@/interfaces/tds/tdsBreakup";
import { userTdsOutput } from "@/models/userTdsModel/userTdsModel";
import { UserBalanceOutput } from "@/models/userBalanceModel/userBalanceModel";
import { TdsBreakupResponse } from "@/interfaces/tdsBreakupInterface/tdsBreakupInterface";
import { TaxfreeAmountResponse } from "@/interfaces/taxfreeAmountResponse/taxfreeAmountResponse";
import {
  AdminTDSCountResponse,
  AdminTDSListInterface,
  AdminTDSListResponse,
  AdminTDSMatchLeagueListInterface,
  AdminTDSupdate,
  AdminTDSupdateResponse,
  AdminTdsCount,
  CalculateTDSResponse,
} from "@/interfaces/tds/adminTDSList/adminTDSList";
import { FileResponse } from "@/interfaces/fileResponse/fileResponse";
import TransactionDao from "@/src/daos/Transaction/TransactionDao";
import { UserModelOutput } from "@/models/userModel/userModel";
import { KycModelOutput } from "@/models/kycModel/kycModel";
import { matchLeagueDao } from "@/src/daos/matchLeague/matchLeagueDao";
import { MatchDao } from "@/src/daos/match/matchDao";

export default class tdsService {
  private matchDao: MatchDao;
  private matchLeagueDao: matchLeagueDao;
  private userBalanceDao: UserBalanceDao;
  private UserTDSDao: UserTDSDao;
  private userDao: UserDao;
  private transactionDao: TransactionDao;

  constructor() {
    this.matchDao = new MatchDao();
    this.matchLeagueDao = new matchLeagueDao();
    this.userBalanceDao = new UserBalanceDao();
    this.UserTDSDao = new UserTDSDao();
    this.userDao = new UserDao();
    this.transactionDao = new TransactionDao();
  }

  public adminList = async (payload: AdminTDSListInterface): Promise<AdminTDSListResponse> => {
    try {
      const { search } = payload;
      let users: UserModelOutput[] = [];
      if (search) {
        const userQuery = searchValues(search);
        users = await this.userDao.findAll(userQuery, {
          sMobNum: 1,
          sEmail: 1,
          sUsername: 1,
          eType: 1,
        });
        if (!users)
          return {
            status: StatusCodeEnums.OK,
            message: messagesEnglish.success.replace("##", messagesEnglish.cTds),
            data: [],
          };
      }
      let tdsData: userTdsOutput[] = await this.UserTDSDao.adminList(payload, users);
      tdsData = await this.addUserFields(tdsData, users);
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cTds),
        data: tdsData,
      };
    } catch (error) {
      throw error;
    }
  };

  public adminCounts = async (payload: AdminTDSListInterface): Promise<AdminTDSCountResponse> => {
    try {
      const { search } = payload;
      let users = [];
      if (search) {
        const userQuery = searchValues(search);
        users = await this.userDao.findAll(userQuery, { sMobNum: 1, sEmail: 1, sUsername: 1, eType: 1 });
        if (users.length === 0) return;
        return {
          status: StatusCodeEnums.OK,
          message: messagesEnglish.success.replace("##", messagesEnglish.cCounts),
          data: { count: 0, rows: [] }
        };
      }
      const tdsCount: AdminTdsCount | number = await this.UserTDSDao.adminTdsCount(payload, users);
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cCounts),
        data: tdsCount,
      };
    } catch (error) {
      throw error;
    }
  };

  public adminUpdate = async (payload: AdminTDSupdate): Promise<AdminTDSupdateResponse> => {
    try {
      const { eStatus, id } = payload;
      const tds: userTdsOutput = await this.UserTDSDao.findTdsById(id);
      if (!tds)
        throw new HttpException(
          StatusCodeEnums.NOT_FOUND,
          messagesEnglish.not_exist.replace("##", messagesEnglish.cTds),
        );

      await this.UserTDSDao.findAndUpdate(id, eStatus);

      const data = { ...tds, eStatus };

      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.update_success.replace("##", messagesEnglish.cTds),
        data,
      };
    } catch (error) {
      throw error;
    }
  };

  public matchLeagueTdsList = async (payload: AdminTDSMatchLeagueListInterface): Promise<AdminTDSListResponse> => {
    try {
      const { search } = payload;
      let users: UserModelOutput[] = [];
      if (search) {
        const userQuery = searchValues(search);
        users = await this.userDao.findAll(userQuery, { sMobNum: 1, sEmail: 1, sUsername: 1, eType: 1 });
        if (!users.length)
          return {
            status: StatusCodeEnums.OK,
            message: messagesEnglish.success.replace("##", messagesEnglish.cTds),
            data: [],
          };
      }
      let results: userTdsOutput[] = await this.UserTDSDao.matchLeagueTdsList(payload, users);
      results = await this.addUserFields(results);
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cTds),
        data: results,
      };
    } catch (error) {
      throw error;
    }
  };

  public matchLeagueTdsCount = async (payload: AdminTDSMatchLeagueListInterface): Promise<AdminTDSCountResponse> => {
    try {
      const { search } = payload
      let users = []
      if (search) {
        const userQuery = searchValues(search)
        users = await this.userDao.findAll(userQuery, { sMobNum: 1, sEmail: 1, sUsername: 1, eType: 1 })
        if (users.length === 0) return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cCounts),
        data: { count : 0, rows: []}
      } 
      }
      const count: AdminTdsCount = await this.UserTDSDao.matchLeagueTdsCount(payload, users);
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cCounts),
        data: count
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  public processTDSEndOfYear = async (): Promise<defaultResponseInterface> => {
    try {
      console.log("::---------TDS DEDUCTION STARTED---------::");
      await this.deductTDSEndOfYear();
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.cBackgroundProcess.replace("##", messagesEnglish.tdsDeduction),
      };
    } catch (error) {
      throw error;
    }
  };

  public getTDSBreakUp = async (payload: tdsBreakupInterface): Promise<TdsBreakupResponse> => {
    try {
      const { nAmount, iUserId } = payload;
      const oData = {
        iUserId,
        nFinalAmount: Number(nAmount),
      };
      if (!nAmount) throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.tds_calculate_error);
      const oUserBalance: UserBalanceOutput = await this.userBalanceDao.findCurrentWinningBalance(oData.iUserId);
      if (!oUserBalance)
        throw new HttpException(
          StatusCodeEnums.NOT_FOUND,
          messagesEnglish.not_exist.replace("##", messagesEnglish.cBalance),
        );

      const { oTDS }: CalculateTDSResponse = await this.transactionDao.calculateTDS(oData);
      if (nAmount > oUserBalance?.nCurrentWinningBalance) oTDS.bEligible = true;

      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.tdsBreakup),
        data: { ...oTDS },
      };
    } catch (error) {
      throw error;
    }
  };

  private deductTDSEndOfYear = async () => {
    try {
      // Need to Calculate all users tds at the end of financial year
      /**
       * EOY Formula For TDS: Closing Win Balance + nTotalWithdraw + nTotalDeposit + nOpeningBalance + nDeductedTaxableAmount
       */

      // Get the Financial Year Start and End Dates
      let FINANCIAL_YEAR_END_DATE = `${new Date().getFullYear() + 1}-03-31`;
      FINANCIAL_YEAR_END_DATE = moment(new Date(FINANCIAL_YEAR_END_DATE)).endOf("day").toISOString();

      // Find Count of UserBalance Entries
      const nTotal : number = await this.userBalanceDao.findAndCountAll({ where: { eUserType: UserTypeEnums.USER } });
      const nLimit = 5000;
      let nSkip = 0;
      let nCount = 0;
      const aUserTDSReportData = [];
      // Pagination Logic for chunking
      while (nSkip < nTotal) {
        const aUserBalances : UserBalanceOutput[] = await this.userBalanceDao.findAll({
          where: { eUserType: UserTypeEnums.USER },
          limit: nLimit,
          offset: nSkip,
          raw: true,
        });
        for (const oUserBalance of aUserBalances) {
          const { iUserId, nCurrentWinningBalance, nCurrentDepositBalance, nCurrentTotalBalance, nCurrentBonus } =
            oUserBalance;
          // Check User Whose TDS deducted
          const oUserTDSExist = await this.UserTDSDao.findTdsByEndOfYear(iUserId, FINANCIAL_YEAR_END_DATE);
          if (oUserTDSExist) continue;

          // Get TDS Breakup
          const { oTDS } = await this.transactionDao.calculateTDS({
            iUserId,
            nFinalAmount: Number(nCurrentWinningBalance),
          });
          const {
            nTDSAmount,
            nPercentage,
            nTaxableAmount,
            nTotalWithdrawalAmount,
            nTotalDepositedAmount,
            nOpeningBalanceOfYear,
            nTotalProcessedAmount,
            dFinancialYear,
          } = oTDS;
          if (nTaxableAmount <= 0) continue;

          // Make Report Required Data
          const oUserTDSData = {
            iUserId,
            nOldWinningBalance: nCurrentWinningBalance,
            nCurrentWinningBalance: nCurrentWinningBalance - nTDSAmount,
            nTotalWithdrawalAmount,
            nTotalDepositedAmount,
            nOpeningBalanceOfYear,
            nTotalProcessedAmount,
            nTaxableAmount,
            nTDSAmount,
            nPercentage,
            dFinancialYear,
          };
          aUserTDSReportData.push(oUserTDSData);

          const deductTDS = {
            iUserId,
            nCurrentWinningBalance,
            nCurrentDepositBalance,
            nCurrentTotalBalance,
            nCurrentBonus,
            nTDSAmount,
            nPercentage,
            nTaxableAmount,
            FINANCIAL_YEAR_END_DATE,
          };
          // SQL Transaction
          await this.transactionDao.deductTDSEndofYear(deductTDS);

          nCount++;
        }
        nSkip += nLimit;
      }
      await this.generateTDSReports(aUserTDSReportData);
      console.log("Calculted COUNT::", nCount);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  private generateTDSReports = async (aTDSData: userTdsOutput[]): Promise<void> => {
    try {
      const schema = [
        {
          column: "UserId",
          type: String,
          value: (object) => object.iUserId,
          width: "16.5pt",
          align: "center",
        },
        {
          column: "Old Winning Balance",
          type: Number,
          value: (object) => object.nOldWinningBalance,
          align: "center",
        },
        {
          column: "Current Winning Balance",
          type: Number,
          width: "16.5pt",
          value: (object) => object.nCurrentWinningBalance,
          align: "center",
        },
        {
          column: "Opening Balance of Year",
          type: Number,
          width: "16.5pt",
          value: (object) => object.nOpeningBalanceOfYear,
          align: "center",
        },
        {
          column: "Total Withdrawals",
          type: Number,
          value: (object) => object.nTotalWithdrawalAmount,
          width: "22.5pt",
          align: "center",
        },
        {
          column: "Total Deposits",
          type: Number,
          value: (object) => object.nTotalDepositedAmount,
          align: "center",
          height: "12pt",
          span: 2,
        },
        {
          column: "Total TDS Amount",
          type: Number,
          value: (object) => object.nTotalProcessedAmount,
          align: "center",
          width: "14.5pt",
        },
        {
          column: "Taxable Amount",
          type: Number,
          value: (object) => object.nTaxableAmount,
          align: "center",
        },
        {
          column: "TDS Amount",
          type: Number,
          value: (object) => object.nTDSAmount,
          align: "center",
        },
        {
          column: "TDS Percentage",
          type: Number,
          value: (object) => object.nPercentage,
          align: "center",
        },
        {
          column: "Financial Year",
          type: String,
          value: (object) => object.dFinancialYear,
          align: "center",
        },
      ];
      const file: FileResponse = await createXlsxFile(schema, aTDSData, `TDSReport_${new Date()}`);
      const oOptions = {
        from: `SportsBuzz11 ${process.env.SMTP_FROM}`,
        to: "vaghesh.ext@sportsbuzz11.com",
        subject: `TDS Report of ${new Date()}`,
      };
      await sendMailTo({ oAttachments: file, oOptions });
    } catch (error) {
      throw error;
    }
  };

  public getTaxFreeAmount = async (iUserId: string): Promise<TaxfreeAmountResponse> => {
    try {
      const oData = {
        iUserId,
        nFinalAmount: 0,
      };
      const oUserBalance: UserBalanceOutput = await this.userBalanceDao.findCurrentWinningBalance(oData.iUserId);
      console.log(oUserBalance)
      if (!oUserBalance)
        throw new HttpException(
          StatusCodeEnums.NOT_FOUND,
          messagesEnglish.not_exist.replace("##", messagesEnglish.cBalance),
        );
      const { oTDS } = await this.transactionDao.calculateTDS(oData);
      let { nTaxFreeAmount, bEligible } = oTDS;
      if (nTaxFreeAmount > oUserBalance?.nCurrentWinningBalance) bEligible = true;
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cAmount),
        data: { nTaxFreeAmount, bEligible },
      };
    } catch (error) {
      throw error;
    }
  };

  public addUserFields = async (tds: userTdsOutput[], users = []): Promise<userTdsOutput[] | []> => {
    let data: UserModelOutput[] = [],
      kycs: KycModelOutput[];

    if (users.length) {
      data = users;
    } else {
      const tdsIds = tds.map((p) => new ObjectId(`${p.iUserId}`));
      data = await this.userDao.findAllUserUsingIds(tdsIds);
    }
    const aMatchLeagueId = tds.map(({ iMatchLeagueId }) => String(iMatchLeagueId));
    const aMatchId = tds.map(({ iMatchId }) => String(iMatchId));
    let aMatchLeagueData = [];
    let aMatchData = [];
    if (aMatchLeagueId.length) {
      aMatchLeagueData = await this.matchLeagueDao.matchLeaguePopulate(aMatchLeagueId);
    }
    if (aMatchId.length) {
      aMatchData = await this.matchDao.fetchForName(aMatchId);
    }
    return tds.map((p) => {
      const user = data.length > 0 ? data.find((u) => u._id.toString() === String(p.iUserId)) : [];
      let kyc = {};
      if (kycs) {
        kyc = kycs.find((u) => u.iUserId.toString() === String(p.iUserId));
      }
      const matchLeague =
        p && p.iMatchLeagueId ? aMatchLeagueData?.find(({ _id }) => _id.toString() === p.iMatchLeagueId) : {};
      const oMatch = p && p.iMatchId !== null ? aMatchData?.find(({ _id }) => _id.toString() === p.iMatchId) : {};
      return { ...p, ...user, ...kyc, oMatch, ...matchLeague, _id: undefined };
    });
  };
}
