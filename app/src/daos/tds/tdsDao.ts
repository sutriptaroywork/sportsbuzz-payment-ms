import UserTDSModel, { userTdsInput, userTdsOutput } from "@/models/userTdsModel/userTdsModel";
import BaseSqlDao from "../baseSqlDao";
import { Op } from "sequelize";
import { UserModelOutput } from "@/models/userModel/userModel";
import { tdsStatusEnums } from "@/enums/tdsStatusEnums/tdsStatusEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import {   AdminTDSListInterface, AdminTDSMatchLeagueListInterface, AdminTdsCount } from "@/interfaces/tds/adminTDSList/adminTDSList";


export default class UserTDSDao extends BaseSqlDao<userTdsInput, userTdsOutput> {

  constructor() {
    super(UserTDSModel);
  }

  public findTdsByEndOfYear = async (iUserId: string, endDate: string) => {
    return await this.model.findOne({ where: { iUserId, bIsEOFY: true, dCreatedAt: { [Op.eq]: endDate } }, raw: true });
  }

  public matchLeagueTdsList = async (payload: AdminTDSMatchLeagueListInterface, users: UserModelOutput[]): Promise<userTdsOutput[]> => {
    const {
      start = 0,
      limit = 10,
      datefrom,
      dateto,
      search,
      sort = "dCreatedAt",
      order,
      isFullResponse,
      eStatus,
      eUserType,
      id,
    } = payload;
    const orderBy = order && order === "asc" ? "ASC" : "DESC";

    const query = [];

    if (search) {
      if (!users.length) return [];
    }

    if (datefrom && dateto) {
      query.push({ dCreatedAt: { [Op.gte]: new Date(datefrom) } });
      query.push({ dCreatedAt: { [Op.lte]: new Date(dateto) } });
    }

    const userIds = users.map((user) => user._id.toString());
    if (users.length) {
      query.push({ iUserId: { [Op.in]: userIds } });
    }

    const paginationFields = [true, "true"].includes(isFullResponse)
      ? {}
      : {
          offset: parseInt(`${start}`),
          limit: parseInt(`${limit}`),
        };

    if (eStatus && Object.values(tdsStatusEnums).includes(eStatus)) {
      query.push({ eStatus });
    }

    if (eUserType && Object.values(UserTypeEnums).includes(eUserType)) {
      query.push({ eUserType });
    }
    const tdsData : userTdsOutput[] = await this.model.findAll({
      where: {
        [Op.or]: [{ iMatchLeagueId: id }, { iMatchId: id }],
        [Op.and]: query,
      },
      order: [[sort, orderBy]],
      ...paginationFields,
      attributes: [
        "id",
        "iUserId",
        "iMatchId",
        "iMatchLeagueId",
        "nAmount",
        "nOriginalAmount",
        "nPercentage",
        "dCreatedAt",
        "iPassbookId",
        "eStatus",
        "eUserType",
        "nActualAmount",
        "nEntryFee",
        "eCategory",
      ],
      raw: true,
    });
    //const results: userTdsOutput[] = users.length
     // ? await this.addUserFields(tdsData, users)
      //: await this.addUserFields(tdsData);
    return tdsData;
  };

  public matchLeagueTdsCount = async(payload: AdminTDSMatchLeagueListInterface, users: UserModelOutput[]) : Promise<AdminTdsCount> => {
    try {
      const { datefrom, dateto, eStatus, eUserType, id } = payload
      const query = []
     
      if (datefrom && dateto) {
        query.push({ dCreatedAt: { [Op.gte]: new Date(datefrom) } })
        query.push({ dCreatedAt: { [Op.lte]: new Date(dateto) } })
      }

      const userIds = users.map(user => user._id.toString())
      if (users.length) {
        query.push({ iUserId: { [Op.in]: userIds } })
      }

      if (eStatus && Object.values(tdsStatusEnums).includes(eStatus)) {
        query.push({ eStatus })
      }

      if (eUserType && Object.values(UserTypeEnums).includes(eUserType)) {
        query.push({ eUserType })
      }

      const count : AdminTdsCount = await this.model.count({
        where: {
          [Op.or]: [{ iMatchId: id }, { iMatchLeagueId: id }],
          // iMatchLeagueId: req.params.id.toString(),
          [Op.and]: query
        },
        raw: true
      })

      return count 
    } catch (error) {
      throw error
    }
  }

  public adminList = async (payload: AdminTDSListInterface, users: UserModelOutput[]): Promise<userTdsOutput[]> => {
    try {
      const {
    start = 0,
    limit = 10,
    datefrom,
    dateto,
    search,
    sort = "dCreatedAt",
    order,
    isFullResponse,
    eStatus,
    eUserType,
    sportsType,
  } = payload
      const orderBy = order && order === "asc" ? "ASC" : "DESC";

      const query = [];

      if (datefrom && dateto) {
        query.push({ dCreatedAt: { [Op.gte]: new Date(datefrom) } });
        query.push({ dCreatedAt: { [Op.lte]: new Date(dateto) } });
      }

      const userIds = users.map((user) => user._id.toString());
      if (users.length) {
        query.push({ iUserId: { [Op.in]: userIds } });
      }

      const paginationFields = [true, "true"].includes(isFullResponse)
        ? {}
        : {
            offset: Number(start),
            limit: Number(limit),
          };

      if (eStatus && Object.values(tdsStatusEnums).includes(eStatus)) {
        query.push({ eStatus });
      }

      if (eUserType && Object.values(UserTypeEnums).includes(eUserType)) {
        query.push({ eUserType });
      }

      if (sportsType) {
        query.push({ eCategory: sportsType });
      }

      const tdsData = await this.model.findAll({
        where: {
          [Op.and]: query,
        },
        order: [[sort, orderBy]],
        ...paginationFields,
        attributes: [
          "id",
          "iUserId",
          "iMatchId",
          "iMatchLeagueId",
          "nAmount",
          "nOriginalAmount",
          "nPercentage",
          "dCreatedAt",
          "iPassbookId",
          "eStatus",
          "eUserType",
          "nActualAmount",
          "nEntryFee",
          "eCategory",
        ],
        raw: true,
      });
      return tdsData;
      //return users.length ? await this.addUserFields(tdsData, users) : await this.addUserFields(tdsData);
    } catch (error) {
      throw error;
    }
  };

  public adminTdsCount = async (payload: AdminTDSListInterface, users: UserModelOutput[]): Promise<AdminTdsCount|number> => {
    try {
      const { datefrom, dateto, search, eStatus, eUserType, sportsType } = payload;

      const query = [];
     

      if (datefrom && dateto) {
        query.push({ dCreatedAt: { [Op.gte]: new Date(datefrom) } });
        query.push({ dCreatedAt: { [Op.lte]: new Date(dateto) } });
      }

      const userIds = users.map((user) => user._id.toString());
      if (users.length) {
        query.push({ iUserId: { [Op.in]: userIds } });
      }

      if (eStatus && Object.values(tdsStatusEnums).includes(eStatus)) {
        query.push({ eStatus });
      }

      if (eUserType && Object.values(UserTypeEnums).includes(eUserType)) {
        query.push({ eUserType });
      }

      if (sportsType) {
        query.push({ eCategory: sportsType });
      }

      const count: number = await this.model.count({
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

  public findTdsById = async (id: number): Promise<userTdsOutput> => {
    return await this.model.findOne({
      where: { id },
      attributes: [
        "id",
        "iUserId",
        "nAmount",
        "nOriginalAmount",
        "nPercentage",
        "dCreatedAt",
        "iPassbookId",
        "eStatus",
        "nActualAmount",
        "nEntryFee",
      ],
      raw: true,
    });
  };

  public findAndUpdate = async (id: number, eStatus: string): Promise<userTdsOutput> => {
    return await this.model.update({ eStatus }, { where: { id } });
  };
}
