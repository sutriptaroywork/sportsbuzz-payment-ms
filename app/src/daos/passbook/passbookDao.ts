import Passbook, { PassbookInput, PassbookOutput } from "@/models/passbookModel/passbookModel";
import BaseSqlDao from "../baseSqlDao";
import { Op, Transaction, col, fn } from "sequelize";
import { TransactionTypeEnums, passbookTransactionTypeEnums } from "@/enums/transactionTypeEnums/transactionTypesEnums";
import { passbookSearchType } from "@/enums/passbookSearchTypeEnums/passbookSearchTypeEnums";
import { PassbookStatusTypeEnums, PassbookTypeEnums, eTypeEnums } from "@/enums/passbookTypeEnums/passbookTypeEnums";
import { categoryTransactionType } from "@/enums/categoryTransactionTypeEnums/categoryTransactionTypeEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { StatusCodeEnums, messagesEnglish } from "@/enums/commonEnum/commonEnum";
import { dateFormat, defaultSearch, s3, searchValues } from "@/helpers/helper_functions";
import { UserModelOutput } from "@/models/userModel/userModel";
import { HttpException } from "@/library/HttpException/HttpException";
import {
  generateReportPayloadInterface,
  passbookAdminList,
  passbookMatchLeagueWiseList,
} from "@/interfaces/passBook/passbookAdminList/passbookAdminListInterface";
import { userWithdrawOutput } from "@/models/userWithdrawModel/userWithdrawModel";
import passbookListInterface from "@/interfaces/passBook/passBookInterface";
export default class PassbookDao extends BaseSqlDao<PassbookInput, PassbookOutput> {
  constructor() {
    super(Passbook);
  }

  public createJoinUserLeagueRecord = async (
    queryData: any,
    Transaction: { transaction: any; lock: boolean },
  ): Promise<any> => {
    //TODO: need to change from any to type for transaction.
    return await this.model.create(queryData, {
      Transaction: Transaction.transaction,
      lock: Transaction.lock,
    });
  };

  public findAllPassbooks = async (query: any, nOffset: number, nLimit: number) => {
    return await this.model.findAll({
      where: { [Op.and]: query },
      attributes: [
        "id",
        "eType",
        "nCash",
        "nBonus",
        "nAmount",
        "eTransactionType",
        "sRemarks",
        "dActivityDate",
        "dCreatedAt",
        "iMatchId",
        "iMatchLeagueId",
        "iTransactionId",
        "iUserLeagueId",
        "iSeriesId",
        "iCategoryId",
      ],
      order: [["id", "desc"]],
      offset: nOffset,
      limit: nLimit,
    });
  };

  public createPassbookEntry = async (params: any, t?: Transaction): Promise<PassbookOutput> => {
    return await this.model.create(params, { transaction: t, lock: true });
  };

  public listAllPassbooks = async (payload: passbookListInterface): Promise<PassbookOutput[]> => {
    try {
      let data = [];
      const query = [];
      let { nLimit, nOffset, eType, dStartDate, dEndDate, iUserId } = payload;

      nLimit = parseInt(nLimit) || 20;
      nOffset = parseInt(nOffset) || 0;

      if (dStartDate && dEndDate) {
        query.push({ dActivityDate: { [Op.gte]: new Date(Number(dStartDate) * 1000) } });
        query.push({ dActivityDate: { [Op.lte]: new Date(Number(dEndDate) * 1000) } });
      }

      if (eType === eTypeEnums.BONUS) {
        query.push({ iUserId });
        query.push({ nBonus: { [Op.gt]: 0 } });
        query.push({
          eTransactionType: {
            [Op.in]: passbookTransactionTypeEnums,
          },
        });

        data = await this.findAllPassbooks(query, nOffset, nLimit);
      } else if (eType === eTypeEnums.CASH) {
        query.push({ iUserId });
        query.push({ [Op.or]: [{ nCash: { [Op.gt]: 0 } }, { eTransactionType: TransactionTypeEnums.OPENING }] });

        data = await this.findAllPassbooks(query, nOffset, nLimit);
      } else if (eType === eTypeEnums.ALL) {
        query.push({ [Op.and]: [{ iUserId }, { eTransactionType: { [Op.ne]: TransactionTypeEnums.LOYALTY_POINT } }] });
        data = await this.findAllPassbooks(query, nOffset, nLimit);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  public matchLeagueList = async (
    payload: passbookMatchLeagueWiseList,
    users: UserModelOutput[],
  ): Promise<PassbookOutput[]> => {
    try {
      const {
        start = 0,
        limit = 10,
        sort = "dActivityDate",
        order,
        search,
        searchType = passbookSearchType.DEFAULT,
        datefrom,
        dateto,
        particulars,
        type,
        id,
        isFullResponse,
        eStatus = "",
        eUserType,
        iMatchLeagueId,
      } = payload;

      const orderBy = order && order === "asc" ? "ASC" : "DESC";

      const query = [];
      if (datefrom && dateto) {
        query.push({ dActivityDate: { [Op.gte]: new Date(datefrom) } });
        query.push({ dActivityDate: { [Op.lte]: new Date(dateto) } });
      }

      if (
        eStatus &&
        [
          `${PassbookStatusTypeEnums.REFUND}`,
          `${PassbookStatusTypeEnums.COMPLETED}`,
          `${PassbookStatusTypeEnums.REFUND}`,
        ].includes(eStatus.toUpperCase())
      ) {
        query.push({ eStatus: eStatus.toUpperCase() });
      }

      if (id) {
        query.push({ id: Number(id) });
      }
      if (type && [PassbookTypeEnums.DEBITED, PassbookTypeEnums.CREDITED].includes(type)) {
        query.push({ eType: type });
      }
      if (particulars) {
        query.push({ eTransactionType: particulars });
      }

      if (eUserType && [UserTypeEnums.USER, UserTypeEnums.BOT].includes(eUserType)) {
        query.push({ eUserType });
      }

      if (search) {
        if (searchType === passbookSearchType.PASSBOOK && isNaN(Number(search))) return [];
      }

        const userIds = users.map((user) => user._id.toString());

      if (search) {
        if (searchType === passbookSearchType.PASSBOOK) {
          query.push({ id: Number(search) });
        } else {
          if (!isNaN(Number(search))) {
            if (users.length) {
              query.push({ [Op.or]: [{ id: { [Op.like]: search + "%" } }, { iUserId: { [Op.in]: userIds } }] });
            } else {
              query.push({ id: { [Op.or]: [{ [Op.like]: search + "%" }] } });
            }
          } else {
            query.push({ iUserId: { [Op.in]: userIds } });
          }
        }
      }

      if ((!datefrom || !dateto) && [true, "true"].includes(isFullResponse)) {
        throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.date_filter_err);
      }

      const paginationFields = [true, "true"].includes(isFullResponse)
        ? {}
        : {
            offset: parseInt(`${start}`),
            limit: parseInt(`${limit}`),
          };

      const data : PassbookOutput[] = await this.model.findAll({
        where: {
          iMatchLeagueId,
          [Op.and]: query
        },
        order: [[sort, orderBy]],
        ...paginationFields,
        attributes: [
          "id",
          "iUserId",
          "bIsBonusExpired",
          "nAmount",
          "nBonus",
          "nCash",
          "eTransactionType",
          "iPreviousId",
          "iUserLeagueId",
          "iMatchId",
          "iMatchLeagueId",
          "iUserDepositId",
          "iWithdrawId",
          "sRemarks",
          "sCommonRule",
          "eType",
          "dActivityDate",
          "nNewWinningBalance",
          "nNewDepositBalance",
          "nNewTotalBalance",
          "nNewBonus",
          "dProcessedDate",
          "nWithdrawFee",
          "sPromocode",
          "eStatus",
          "eUserType",
          "iTransactionId",
          "nLoyaltyPoint",
          "eCategory",
        ],
        raw: true,
      });

      return data;
    } catch (error) {
      throw error;
    }
  };

  public matchLeagueWiseCount = async (payload: passbookMatchLeagueWiseList, users: UserModelOutput[]): Promise<number> => {
    try {
      let {
        search,
        searchType = passbookSearchType.DEFAULT,
        datefrom,
        dateto,
        particulars,
        type,
        id,
        eStatus = "",
        eUserType,
        iMatchLeagueId,
      } = payload;

      const query = [];
      if (datefrom && dateto) {
        query.push({ dActivityDate: { [Op.gte]: new Date(datefrom) } });
        query.push({ dActivityDate: { [Op.lte]: new Date(dateto) } });
      }

      if (
        eStatus &&
        [
          `${PassbookStatusTypeEnums.REFUND}`,
          `${PassbookStatusTypeEnums.COMPLETED}`,
          `${PassbookStatusTypeEnums.CANCEL}`,
        ].includes(eStatus.toUpperCase())
      ) {
        query.push({ eStatus: eStatus.toUpperCase() });
      }
      if (id) {
        query.push({ id: Number(id) });
      }
      if (type && [PassbookTypeEnums.DEBITED, PassbookTypeEnums.CREDITED].includes(type)) {
        query.push({ eType: type });
      }
      if (particulars) {
        query.push({ eTransactionType: particulars });
      }

      if (eUserType && [UserTypeEnums.USER, UserTypeEnums.BOT].includes(eUserType)) {
        query.push({ eUserType });
      }


      if (search) search = defaultSearch(search);

      if (search) {
        if (searchType === passbookSearchType.PASSBOOK && isNaN(Number(search)))
          return 0;
      }

      const userIds = users.map((user) => user._id.toString());

      if (search) {
        if (searchType === passbookSearchType.PASSBOOK) {
          query.push({ id: Number(search) });
        } else {
          if (!isNaN(Number(search))) {
            if (users.length) {
              query.push({ [Op.or]: [{ id: { [Op.like]: search + "%" } }, { iUserId: { [Op.in]: userIds } }] });
            } else {
              query.push({ id: { [Op.or]: [{ [Op.like]: search + "%" }] } });
            }
          } else {
            query.push({ iUserId: { [Op.in]: userIds } });
          }
        }
      }

      console.log(query)
      const count: number = await this.model.count({
        where: {
          iMatchLeagueId,
          [Op.and]: query,
        },
        raw: true,
      });

      return count;
    } catch (error) {
      throw error;
    }
  };
  public passbookAdminList = async (
    payload: passbookAdminList,
    users: UserModelOutput[] = [],
  ): Promise<PassbookOutput[]> => {
    try {
      let {
        start = 0,
        limit = 10,
        sort = "dActivityDate",
        order,
        search,
        searchType = passbookSearchType.DEFAULT,
        datefrom,
        dateto,
        particulars,
        type,
        id,
        isFullResponse,
        eStatus = "",
        eUserType,
        sportsType,
      } = payload;
      const orderBy = order && order === "asc" ? "ASC" : "DESC";

      const query = [];
      if (datefrom && dateto) {
        query.push({ dActivityDate: { [Op.gte]: new Date(datefrom) } });
        query.push({ dActivityDate: { [Op.lte]: new Date(dateto) } });
      }

      if (eStatus) {
        query.push({ eStatus: eStatus.toUpperCase() });
      }

      if (id) {
        query.push({ id: Number(id) });
      }
      if (type && [PassbookTypeEnums.DEBITED, PassbookTypeEnums.CREDITED].includes(type)) {
        query.push({ eType: type });
      }
      if (particulars) {
        query.push({ eTransactionType: particulars });
      }
      if (sportsType && (particulars ? Object.values(categoryTransactionType).includes(particulars) : true)) {
        query.push({ eCategory: sportsType });
      }
      if (eUserType && [UserTypeEnums.USER, UserTypeEnums.BOT].includes(eUserType)) {
        query.push({ eUserType });
      }

      if (search) search = defaultSearch(search);

      const userIds = users.map((user) => user._id.toString());

      if (search) {
        if (searchType === passbookSearchType.PASSBOOK) {
          query.push({ id: Number(search) });
        } else {
          if (!isNaN(Number(search))) {
            if (users.length) {
              query.push({ [Op.or]: [{ id: { [Op.like]: search + "%" } }, { iUserId: { [Op.in]: userIds } }] });
            } else {
              query.push({ id: { [Op.or]: [{ [Op.like]: search + "%" }] } });
            }
          } else {
            query.push({ iUserId: { [Op.in]: userIds } });
          }
        }
      }

      if ((!datefrom || !dateto) && [true, "true"].includes(isFullResponse)) {
        throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.date_filter_err);
      }

      if ([true, "true"].includes(isFullResponse)) query.push({ eUserType: UserTypeEnums.USER });
      const paginationFields = [true, "true"].includes(isFullResponse)
        ? {}
        : {
            offset: parseInt(`${start}`),
            limit: parseInt(`${limit}`),
          };
      console.log('query :', query)
      const data = await this.model.findAll({
        where: {
          [Op.and]: query,
        },
        order: [[sort, orderBy]],
        ...paginationFields,
        attributes: [
          "id",
          "iUserId",
          "bIsBonusExpired",
          "nAmount",
          "nBonus",
          "nCash",
          "eTransactionType",
          "iPreviousId",
          "iUserLeagueId",
          "iMatchId",
          "iMatchLeagueId",
          "iUserDepositId",
          "iWithdrawId",
          "sRemarks",
          "sCommonRule",
          "eType",
          "dActivityDate",
          "nNewWinningBalance",
          "nNewDepositBalance",
          "nNewTotalBalance",
          "nNewBonus",
          "dProcessedDate",
          "nWithdrawFee",
          "sPromocode",
          "eStatus",
          "eUserType",
          "iTransactionId",
          "nLoyaltyPoint",
          "eCategory",
        ],
        raw: true,
      });

      return data;
    } catch (error) {
      throw error;
    }
  };

  public passbookAdminCounts = async (payload: passbookAdminList, users: UserModelOutput[]): Promise<number> => {
    try {
      let {
        search,
        searchType = passbookSearchType.DEFAULT,
        datefrom,
        dateto,
        particulars,
        type,
        id,
        eStatus = PassbookStatusTypeEnums.EMPTY_SEARCH,
        isFullResponse,
        eUserType,
        sportsType,
      } = payload;

      const query = [];
      if (datefrom && dateto) {
        query.push({ dActivityDate: { [Op.gte]: new Date(datefrom) } });
        query.push({ dActivityDate: { [Op.lte]: new Date(dateto) } });
      }

      if (
        eStatus &&
        [
          `${PassbookStatusTypeEnums.REFUND}`,
          `${PassbookStatusTypeEnums.COMPLETED}`,
          `${PassbookStatusTypeEnums.REFUND}`,
        ].includes(eStatus.toUpperCase())
      ) {
        query.push({ eStatus: eStatus.toUpperCase() });
      }
      if (id) {
        query.push({ id: Number(id) });
      }
      if (type && [PassbookTypeEnums.DEBITED, PassbookTypeEnums.CREDITED].includes(type)) {
        query.push({ eType: type });
      }
      if (particulars) {
        query.push({ eTransactionType: particulars });
      }
      if (sportsType && (particulars ? Object.values(categoryTransactionType).includes(particulars) : true)) {
        query.push({ eCategory: sportsType });
      }

      if (eUserType && [UserTypeEnums.USER, UserTypeEnums.BOT].includes(eUserType)) {
        query.push({ eUserType });
      }

      if (search) search = defaultSearch(search);

      if (search) {
        if (searchType === passbookSearchType.PASSBOOK && isNaN(Number(search))) return 0;
        if (users.length === 0) return 0;
      }

      const userIds = users.map((user) => user._id.toString());

      if (search) {
        if (searchType === passbookSearchType.PASSBOOK) {
          query.push({ id: Number(search) });
        } else if (!isNaN(Number(search))) {
          if (users.length) {
            query.push({ [Op.or]: [{ id: { [Op.like]: search + "%" } }, { iUserId: { [Op.in]: userIds } }] });
          } else {
            query.push({ id: { [Op.or]: [{ [Op.like]: search + "%" }] } });
          }
        } else {
          query.push({ iUserId: { [Op.in]: userIds } });
        }
      }
      if ([true, "true"].includes(isFullResponse)) query.push({ eUserType: UserTypeEnums.USER });
      const count : number = await this.model.count({
        where: {
          [Op.and]: query,
        },
        raw: true,
      });
      return count;
    } catch (error) {
      throw error;
    }
  };

  public findPendingDetails = async ({
    iUserId,
    oPendingWithdraw,
  }: {
    iUserId: string;
    oPendingWithdraw: userWithdrawOutput;
  }): Promise<PassbookOutput> => {
    return await this.model.findOne({
      where: { iUserId, dCreatedAt: { [Op.lte]: oPendingWithdraw.dCreatedAt } },
      order: [["dCreatedAt", "DESC"]],
      raw: true,
    });
  };

public passbookEntriesByTransactionTypesHelper = async (iUserId: string, colName: string, eTransactionType: TransactionTypeEnums) : Promise<PassbookOutput[]> => {
    return this.model.findAll({
        attributes: [[fn("sum", col(colName)), "total"]],
        where: { eTransactionType, iUserId },
        raw: true,
      })
  }
  public passbookEntriesByTransactionTypesHelperBonusZero = async (iUserId: string, colName: string, eTransactionType: TransactionTypeEnums) : Promise<PassbookOutput[]> => {
    return this.model.findAll({
        attributes: [[fn("sum", col(colName)), "total"]],
        where: { eTransactionType, iUserId, nBonus: { [Op.gt]: 0 } },
        raw: true,
      })
  }

  public passbookEntriesByTransactionTypesHelperCashZero = async (iUserId: string, colName: string, eTransactionType: TransactionTypeEnums) : Promise<PassbookOutput[]> => {
    return this.model.findAll({
        attributes: [[fn("sum", col(colName)), "total"]],
        where: { eTransactionType, iUserId, nCash: { [Op.gt]: 0 } },
        raw: true,
      })
  }

  public transactionReport = async (payload: generateReportPayloadInterface): Promise<number> => {
    try {
      const {
        dDateFrom,
        dDateTo,
        eTransactionType,
        eType,
        eStatus = "",
        eCategory,
        iMatchId,
        iMatchLeagueId,
      } = payload;

      if (!iMatchId && (!dDateFrom || !dDateTo)) {
        throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.date_filter_err);
      }

      const query = [];
      if (dDateFrom && dDateTo) {
        query.push({ dActivityDate: { [Op.gte]: new Date(dDateFrom) } });
        query.push({ dActivityDate: { [Op.lte]: new Date(dDateTo) } });
      }

      if (iMatchId) {
        query.push({ iMatchId });
      }

      if (iMatchLeagueId) {
        query.push({ iMatchLeagueId });
      }

      if (
        eStatus &&
        [
          `${PassbookStatusTypeEnums.REFUND}`,
          `${PassbookStatusTypeEnums.COMPLETED}`,
          `${PassbookStatusTypeEnums.CANCEL}`,
        ].includes(eStatus.toUpperCase())
      ) {
        query.push({ eStatus: eStatus.toUpperCase() });
      }

      if (eType && [`${PassbookTypeEnums.DEBITED}`, `${PassbookTypeEnums.CREDITED}`].includes(eType)) {
        query.push({ eType });
      }

      if (eTransactionType) {
        query.push({ eTransactionType });
      }

      if (eCategory && (eTransactionType ? Object.values(categoryTransactionType).includes(eTransactionType) : true)) {
        query.push({ eCategory });
      }

      query.push({ eUserType: UserTypeEnums.USER });

      const nTotal: number = await this.model.count({
        where: { [Op.and]: query },
        raw: true,
      });

      return nTotal;
    } catch (error) {
      throw error;
    }
  };

  public getTransactionReportData = async (payload: generateReportPayloadInterface): Promise<PassbookOutput[]> => {
    try {
      const {
        dDateFrom,
        dDateTo,
        eTransactionType,
        eType,
        eStatus = "",
        eCategory,
        iMatchId,
        iMatchLeagueId,
      } = payload;

      const nLimit = 5000;
      let nSkip = 0;
      const sort = "id";
      const orderBy = "ASC";
      if (!iMatchId && (!dDateFrom || !dDateTo)) {
        throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.date_filter_err);
      }

      const query = [];
      if (dDateFrom && dDateTo) {
        query.push({ dActivityDate: { [Op.gte]: new Date(dDateFrom) } });
        query.push({ dActivityDate: { [Op.lte]: new Date(dDateTo) } });
      }

      if (iMatchId) {
        query.push({ iMatchId });
      }

      if (iMatchLeagueId) {
        query.push({ iMatchLeagueId });
      }

      if (
        eStatus &&
        [
          `${PassbookStatusTypeEnums.REFUND}`,
          `${PassbookStatusTypeEnums.COMPLETED}`,
          `${PassbookStatusTypeEnums.CANCEL}`,
        ].includes(eStatus.toUpperCase())
      ) {
        query.push({ eStatus: eStatus.toUpperCase() });
      }

      if (eType && [`${PassbookTypeEnums.DEBITED}`, `${PassbookTypeEnums.CREDITED}`].includes(eType)) {
        query.push({ eType });
      }

      if (eTransactionType) {
        query.push({ eTransactionType });
      }

      if (eCategory && (eTransactionType ? Object.values(categoryTransactionType).includes(eTransactionType) : true)) {
        query.push({ eCategory });
      }

      query.push({ eUserType: UserTypeEnums.USER });
      const data = await this.model.findAll({
        where: { [Op.and]: query },
        attributes: [
          "id",
          "iUserId",
          "nAmount",
          "nBonus",
          "nCash",
          "eTransactionType",
          "iUserLeagueId",
          "iMatchId",
          "iMatchLeagueId",
          "eType",
          "dActivityDate",
          "nNewTotalBalance",
          "nNewBonus",
          "sPromocode",
          "eStatus",
          "eUserType",
          "iTransactionId",
          "nLoyaltyPoint",
          "eCategory",
        ],
        order: [[sort, orderBy]],
        limit: nLimit,
        offset: nSkip,
        raw: true,
      });

      return data;
    } catch (error) {
      throw error;
    }
  };
}
