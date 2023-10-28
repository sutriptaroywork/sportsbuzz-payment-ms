import { StatusCodeEnums, messagesEnglish } from "@/enums/commonEnum/commonEnum";
import { dateFormat, defaultSearch, getPaginationValues, s3, searchValues } from "@/helpers/helper_functions";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import PassbookDao from "@/src/daos/passbook/passbookDao";
import UserBalanceDao from "@/src/daos/userBalance/userBalanceDaos";
import userWithdrawDao from "@/src/daos/userWithdraw/userWithdrawDao";
import * as csv from 'fast-csv'
import { transactionReportDao } from "@/src/daos/transactionReport/transactionReportDao";
import { generateReportPayloadInterface, passbookAdminList, passbookAdminListResponse, passbookMatchLeagueListResponse, passbookMatchLeagueWiseList } from "@/interfaces/passBook/passbookAdminList/passbookAdminListInterface";
import passbookListInterface from "@/interfaces/passBook/passBookInterface";
import { PassbookOutput } from "@/models/passbookModel/passbookModel";
import { UserBalanceOutput } from "@/models/userBalanceModel/userBalanceModel";
import { userWithdrawOutput } from "@/models/userWithdrawModel/userWithdrawModel";
import {  UserDetailsResponse } from "@/interfaces/userDetails/userDetailsObject";
import { PassbookAdminCounts } from "@/interfaces/passBook/passbookAdminCounts/passbookAdminCounts";
import transactionReportListInterface, {transactionListInterface, transactionListPayload} from "@/interfaces/passBook/transactionListInterface/transactionListInterface";
import UserDao from "@/src/daos/user/userDaos";
import { UserModelOutput } from "@/models/userModel/userModel";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { MatchDao } from "@/src/daos/match/matchDao";
import { UserFieldsPassbook } from "@/interfaces/userFields/userFieldsInterface";
import { transactionReporModelOutput } from "@/models/transactionReportModel/transactionReportModel";
import { generateReportPayload } from "@/interfaces/generateReport/generateReport";
import { TransactionTypeEnums } from "@/enums/transactionTypeEnums/transactionTypesEnums";
import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";

export class passbookService {
  private passbookDao: PassbookDao;
  private userWithdrawDao: userWithdrawDao;
  private userBalanceDao: UserBalanceDao;
  private transactionReportDao: transactionReportDao;
  private userDao: UserDao;
  private matchDao: MatchDao;

  constructor() {
    this.passbookDao = new PassbookDao();
    this.userWithdrawDao = new userWithdrawDao();
    this.userBalanceDao = new UserBalanceDao();
    this.transactionReportDao = new transactionReportDao();
    this.userDao = new UserDao();
    this.matchDao = new MatchDao();
  }

  public list = async (payload: passbookListInterface): Promise<transactionListInterface> => {
    try {
      const passbooks : PassbookOutput[] = await this.passbookDao.listAllPassbooks(payload)
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cpassbook),
        data: passbooks,
      };
    } catch (error) {
      throw error;
    }
  };
  public passbookEntriesByTransactionTypes = async (iUserId: string) : Promise<any >=> {
    try {
      return await Promise.all([
        this.passbookDao.passbookEntriesByTransactionTypesHelper(iUserId, 'nCash', TransactionTypeEnums.PLAY),
        this.passbookDao.passbookEntriesByTransactionTypesHelperBonusZero(iUserId, 'nBonus', TransactionTypeEnums.PLAY),
        this.passbookDao.passbookEntriesByTransactionTypesHelper(iUserId, 'nCash', TransactionTypeEnums.PLAY_RETURN),
        this.passbookDao.passbookEntriesByTransactionTypesHelperBonusZero(iUserId, 'nBonus', TransactionTypeEnums.PLAY_RETURN),
        this.userWithdrawDao.findOnePendingWithUserId(iUserId),
        this.userBalanceDao.findUserBalance(iUserId),
        this.passbookDao.passbookEntriesByTransactionTypesHelper(iUserId, 'nAmount', TransactionTypeEnums.CREATOR_BONUS),
        this.passbookDao.passbookEntriesByTransactionTypesHelper(iUserId, 'nAmount', TransactionTypeEnums.BONUS),
        this.passbookDao.passbookEntriesByTransactionTypesHelper(iUserId, 'nAmount', TransactionTypeEnums.REFER_BONUS),
        this.passbookDao.passbookEntriesByTransactionTypesHelper(iUserId, 'nAmount', TransactionTypeEnums.BONUS_EXPIRE),
        this.passbookDao.passbookEntriesByTransactionTypesHelperCashZero(iUserId, 'nCash', TransactionTypeEnums.CASHBACK),
        this.passbookDao.passbookEntriesByTransactionTypesHelperBonusZero(iUserId, 'nBonus', TransactionTypeEnums.CASHBACK),
      ])
    } catch (error) {
      throw error;
    }
  }

  public userDetails = async (iUserId: string): Promise<UserDetailsResponse> => {
    try {
      let oData : any = {}
      // passbook include for difference

      const [
        aTotalPlayedCash,
        aTotalPlayedBonus,
        aTotalPlayReturnCash,
        aTotalPlayReturnBonus,
        oPendingWithdraw,
        balance,
        aTotalCreatorBonus,
        aTotalRegisterBonus,
        aTotalReferBonus,
        aTotalBonusExpired,
        aTotalCashbackCash,
        aTotalCashbackBonus,
      ] : [ aTotalPlayedCash: PassbookOutput[] ,
        aTotalPlayedBonus: PassbookOutput[],
        aTotalPlayReturnCash: PassbookOutput[],
        aTotalPlayReturnBonus: PassbookOutput[],
        oPendingWithdraw: userWithdrawOutput,
        balance: UserBalanceOutput,
        aTotalCreatorBonus: PassbookOutput[],
        aTotalRegisterBonus: PassbookOutput[],
        aTotalReferBonus: PassbookOutput[],
        aTotalBonusExpired: PassbookOutput[],
        aTotalCashbackCash: PassbookOutput[],
        aTotalCashbackBonus: PassbookOutput[]
        ] = await this.passbookEntriesByTransactionTypes(iUserId);
      oData.nCurrentDepositBalance = balance.nCurrentDepositBalance;
      // nActualDepositBalance // for cash only -> statistics
      oData.nCurrentWinningBalance = balance.nCurrentWinningBalance;
      // nActualWinningBalance -> statistics
      oData.nCurrentBonus = balance.nCurrentBonus;
      // nActualBonus // for bonus only -> statistics

      // passbook include for total
      oData.nTotalBonusEarned = balance.nTotalBonusEarned; // for bonus only
      // nBonus -> statistics
      oData.nTotalDepositAmount = balance.nTotalDepositAmount; // for cash only
      // nDeposits -> statistics
      oData.nTotalWithdrawAmount = balance.nTotalWithdrawAmount; // for withdraw only
      // nWithdraw -> statistics
      oData.nTotalWinningAmount = balance.nTotalWinningAmount; // for winnings amount only
      // nTotalWinnings -> statistics

      // FOR total played with cash

      oData.nTotalPlayedCash = aTotalPlayedCash.length
        ? Number(parseFloat(aTotalPlayedCash[0].total || 0).toFixed(2))
        : 0;
      // nTotalPlayedCash -> statistics

      // FOR total played with bonus
      oData.nTotalPlayedBonus = aTotalPlayedBonus.length
        ? Number(parseFloat(aTotalPlayedBonus[0].total || 0).toFixed(2))
        : 0;
      // nTotalPlayedBonus -> statistics

      // FOR total play return with cash
      oData.nTotalPlayReturnCash = aTotalPlayReturnCash.length
        ? Number(parseFloat(aTotalPlayReturnCash[0].total || 0).toFixed(2))
        : 0;
      // nTotalPlayReturnCash -> statistics
      oData.nTotalPlayReturnBonus = aTotalPlayReturnBonus.length
        ? Number(parseFloat(aTotalPlayReturnBonus[0].total || 0).toFixed(2))
        : 0;
      // nTotalPlayReturnBonus -> statistics

      if (!oPendingWithdraw) {
        oData.nLastPendingWithdraw = 0;
        oData.nWinBalanceAtLastPendingWithdraw = 0;
      } else {
        const pendingDetails = await this.passbookDao.findPendingDetails({iUserId, oPendingWithdraw})
        oData.nLastPendingWithdraw = oPendingWithdraw.nAmount || 0;
        oData.nWinBalanceAtLastPendingWithdraw = pendingDetails.nNewWinningBalance || 0;
      }

      oData.nTotalCreatorBonus = aTotalCreatorBonus.length
        ? Number(parseFloat(aTotalCreatorBonus[0].total || 0).toFixed(2))
        : 0;

      oData.nTotalRegisterBonus = aTotalRegisterBonus.length
        ? Number(parseFloat(aTotalRegisterBonus[0].total || 0).toFixed(2))
        : 0;

      oData.nTotalReferBonus = aTotalReferBonus.length
        ? Number(parseFloat(aTotalReferBonus[0].total || 0).toFixed(2))
        : 0;

      oData.nTotalBonusExpired = aTotalBonusExpired.length
        ? Number(parseFloat(aTotalBonusExpired[0].total || 0).toFixed(2))
        : 0;

      oData.nTotalCashbackCash = aTotalCashbackCash.length
        ? Number(parseFloat(aTotalCashbackCash[0].total || 0).toFixed(2))
        : 0;
      // nCashbackCash -> statistics

      oData.nTotalCashbackBonus = aTotalCashbackBonus.length
        ? Number(parseFloat(aTotalCashbackBonus[0].total || 0).toFixed(2))
        : 0;
      // nCashbackBonus -> statistics

      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cpassbook),
        data: oData,
      };
    } catch (error) {
      throw error;
    }
  };

  private addUserFields = async (passbook, users = []): Promise<UserFieldsPassbook[]> => {
    const matchIds = passbook.map((p) => new ObjectId(p.iMatchId));
      const aMatchIds = [];
      matchIds.forEach((id, i) => matchIds[i] && aMatchIds.push(id));

      const userIds = passbook.map((p) => new ObjectId(p.iUserId));

      const [usersData, matchesData] = await Promise.all([
        this.userDao.userListPassbook(userIds),
        this.matchDao.fetchUsingMatchIds(aMatchIds),
      ]);

      let data = users;
      const oUser = {};
      const oMatch = {};

      data = Array.isArray(usersData) ? usersData : [];
      if (data.length)
      data.forEach((usr, i) => {
        oUser[usr._id.toString()] = i;
      });

      const matchData = Array.isArray(matchesData) ? matchesData : [];
      if (matchData.length)
        matchesData.forEach((match, i) => {
          oMatch[match._id.toString()] = i;
        });

      return passbook.map((p) => {
        // const user = data.find(u => u._id.toString() === p.iUserId.toString())
        const user = typeof oUser[p.iUserId.toString()] === "number" ? { ...data[oUser[p.iUserId.toString()]] } : {};
        let sMatchName = "";
        let dMatchStartDate = "";
        if (p.iMatchId && matchData && matchData.length) {
          // const match = matchData.find(u => u._id.toString() === p.iMatchId.toString())
          const match: any =
            typeof oMatch[p.iMatchId.toString()] === "number" ? { ...matchData[oMatch[p.iMatchId.toString()]] } : {};
          if (match && match.sName) sMatchName = match.sName;
          if (match && match.dStartDate) dMatchStartDate = match.dStartDate;
        }
        return { ...p, ...user, _id: undefined, sMatchName, dMatchStartDate };
      });
  }

  public adminList = async (payload: passbookAdminList): Promise<passbookAdminListResponse> => {
    try {
      const { search } = payload
      const userList: UserModelOutput[] = await this.userDao.getAdminUserList(payload);
      if(search && userList === null) {
        return {
          status: StatusCodeEnums.OK,
          message: messagesEnglish.success.replace("##", messagesEnglish.ctransactions),
          data: { rows: [] },
        };
      } 
      console.log('test', userList)
      const adminPassbookListResponse : PassbookOutput[] = await this.passbookDao.passbookAdminList(payload, userList);
      if(!adminPassbookListResponse.length) {
        return {
          status: StatusCodeEnums.OK,
          message: messagesEnglish.success.replace("##", messagesEnglish.ctransactions),
          data: { rows: [] },
        };
      }

      const passbookData = await this.addUserFields(adminPassbookListResponse, userList);

      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.ctransactions),
        data: { rows: passbookData },
      };
    } catch (error) {
      throw error;
    }
  };

  public adminGetCounts = async (payload: passbookAdminList): Promise<PassbookAdminCounts> => {
    try {
      const userList: UserModelOutput[] = await this.userDao.getAdminUserList(payload);
      if(userList === null) {
        return {
          status: StatusCodeEnums.OK,
          message: messagesEnglish.success.replace("##", messagesEnglish.ctransactions),
          data: { count: 0 },
        };
      }
      const count : number = await this.passbookDao.passbookAdminCounts(payload, userList)
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", `${messagesEnglish.ctransactions} ${messagesEnglish.cCounts}`),
        data: { count },
      };
    } catch (error) {
      throw error;
    }
  };

  public matchLeagueWiseList = async (payload : passbookMatchLeagueWiseList): Promise<passbookMatchLeagueListResponse> => {
    try {
      const { search } = payload
      const userList: UserModelOutput[] = await this.userDao.getAdminUserList(payload);
      if(search && !userList.length) {
        return {
          status: StatusCodeEnums.OK,
          message: messagesEnglish.success.replace("##", messagesEnglish.ctransactions),
          data: { rows: [] },
        };
      }
      const listResponse : PassbookOutput[] = await this.passbookDao.matchLeagueList(payload, userList)
      if(!listResponse.length) {
        return {
          status: StatusCodeEnums.OK,
          message: messagesEnglish.success.replace("##", messagesEnglish.ctransactions),
          data: { rows: [] },
        };
      }

      const matchLeagueWiseData = await this.addUserFields(listResponse, userList)
      return {
          status: StatusCodeEnums.OK,
          message: messagesEnglish.success.replace("##", messagesEnglish.ctransactions),
          data:  matchLeagueWiseData
        };
    } catch (error) {
      throw error;
    }
  };

  public matchLeagueWiseCount = async (payload: passbookMatchLeagueWiseList): Promise<PassbookAdminCounts> => {
    try {
      const { search } = payload
      const userList: UserModelOutput[] = await this.userDao.getAdminUserList(payload);
      if(search && !userList.length) {
        return {
          status: StatusCodeEnums.OK,
          message: messagesEnglish.success.replace("##", messagesEnglish.ctransactions),
          data: { count: 0 },
        };
      }
      const countResponse : number = await this.passbookDao.matchLeagueWiseCount(payload, userList)
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", `${messagesEnglish.ctransactions} ${messagesEnglish.cCounts}`),
        data: { count: countResponse },
      };
    } catch (error) {
      throw error;
    }
  };

  public transactionReport = async (payload: generateReportPayloadInterface): Promise<defaultResponseInterface> => {
    try {
      const nTotal: number = await this.passbookDao.transactionReport(payload)
      const report: transactionReporModelOutput = await this.transactionReportDao.create({
        ...payload,
        nTotal,
        oFilter: payload,
        // @ts-ignore
        iAdminId: new mongoose.Types.ObjectId(String(payload.iAdminId)),
      });

      const oData = { iReportId: report._id, nTotal };
      await this.generateReport(oData, payload);
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.cGenerationProcess.replace("##", messagesEnglish.creport),
      };
    } catch (error) {
      throw error;
    }
  };

    public generateReport = async (data: generateReportPayload, payload: generateReportPayloadInterface): Promise<void> => {
    try {
      const { iReportId, nTotal } = data;

      const nLimit = 5000;
      let nSkip = 0;
      
      const csvStream = csv.format({ headers: true, quoteHeaders: true });

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: process.env.s3TransactionReport + `${iReportId}.csv`,
        ContentType: "text/csv",
        Body: csvStream,
        ContentDisposition: "filename=Transaction Report.csv",
      };
      s3.upload(params, async function (err, data) {
        if (err) throw err
        await this.transactionReportDao.updateOne(
          { _id: iReportId },
          { sReportUrl: data.Key, eStatus: StatusTypeEnums.SUCCESS },
          { readPreference: "primary" },
        );
      });

      while (nSkip < nTotal) {
        const data: PassbookOutput[] = await this.passbookDao.getTransactionReportData(payload)

        const aPassBookData = await this.addUserFields(data);

        const aFields = [
          "ID",
          "Username",
          "Match Type",
          "Email",
          "Mobile No",
          "Cash",
          "Bonus",
          "Amount",
          "Loyalty Point",
          "Available Total Balance",
          "Available Bonus",
          "Promocode",
          "Type",
          "Transaction Type",
          "Transaction ID",
          "Match",
          "Match Date & Time",
          "Request Date",
        ];

        for (const oPassBook of aPassBookData) {
          oPassBook.dMatchStartDate = oPassBook?.dMatchStartDate ? dateFormat(oPassBook.dMatchStartDate) : null;
          oPassBook.dActivityDate = oPassBook?.dActivityDate ? dateFormat(oPassBook.dActivityDate) : null;
          const oData = {
            ID: "id",
            Username: "sUsername",
            "Match Type": "eCategory",
            Email: "sEmail",
            "Mobile No": "sMobNum",
            Cash: "nCash",
            Bonus: "nBonus",
            Amount: "nAmount",
            "Loyalty Point": "nLoyaltyPoint",
            "Available Total Balance": "nNewTotalBalance",
            "Available Bonus": "nNewBonus",
            Promocode: "sPromocode",
            Type: "eType",
            "Transaction Type": "eTransactionType",
            "Transaction ID": "iTransactionId",
            Match: "sMatchName",
            "Match Date & Time": "dMatchStartDate",
            "Request Date": "dActivityDate",
          };

          const oPassBookRow = aFields.reduce((oRow, sField) => {
            oRow[sField] = oPassBook[oData[sField]];
            return oRow;
          }, {});

          csvStream.write(oPassBookRow);
        }
        nSkip += nLimit;
      }
      csvStream.end();
    } catch (error) {
      throw error;
    }
  };

  public listTransactionReport = async (payload: transactionListPayload): Promise<transactionReportListInterface> => {
    try {
      const { start, limit, sorting } = getPaginationValues(payload);
      const { datefrom, dateto } = payload;

      let query = {};
      query = datefrom && dateto ? { dCreatedAt: { $gte: new Date(datefrom), $lte: new Date(dateto) } } : {};

      const [aData, nTotal] = await Promise.all([
        this.transactionReportDao.findAndSort({ query, sorting, start, limit }),
        this.transactionReportDao.countDocuments(query),
      ]);

      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.creport),
        data: { aData, nTotal },
      };
    } catch (error) {
      throw error
    }
  };
}