import UserModel, { UserModelInput, UserModelOutput } from "@/models/userModel/userModel";
import { ObjectId } from "mongodb";
import BaseMongoDao from "../baseMongoDao";
import { passbookAdminList, passbookMatchLeagueWiseList } from "@/interfaces/passBook/passbookAdminList/passbookAdminListInterface";
import { passbookSearchType } from "@/enums/passbookSearchTypeEnums/passbookSearchTypeEnums";
import { defaultSearch, searchValues } from "@/helpers/helper_functions";

export default class UserDao extends BaseMongoDao<UserModelInput, UserModelOutput> {
  constructor() {
    super(UserModel);
  }

  public findAllUserUsingIds = async (userIds: ObjectId[]): Promise<UserModelOutput[]> => {
    return this.model.find({ _id: { $in: userIds } }, { sMobNum: 1, sEmail: 1, sUsername: 1, eType: 1 });
  };

  public findAllUsersWithRegex = async (sSearch: string): Promise<UserModelOutput[]> => {
    return this.model.find(
      { sMobNum: new RegExp("^.*" + sSearch + ".*", "i") },
      { sMobNum: 1, sEmail: 1, sUsername: 1 },
    );
  };

  public findAllUsers = async (): Promise<UserModelOutput> => {
    return await this.model.find();
  };

  public findAllUsersProjection = async (): Promise<UserModelOutput> => {
    return await this.model.find({}, { sMobNum: 1, sEmail: 1, sUsername: 1 }).lean();
  };
  public findAllUsersByDepositIds = async (depositIds: ObjectId[]): Promise<UserModelOutput[]> => {
    return await this.model.find({ _id: { $in: depositIds } }, { sMobNum: 1, sEmail: 1, sUsername: 1 });
  };
  public getUserById = async (userId: string, projection?: any): Promise<UserModelOutput> => {
    return await this.model.findById(new ObjectId(userId), projection).lean();
  };

  public checkReferral = async (referralId: ObjectId): Promise<UserModelOutput> => {
    return await this.model.findOne({ _id: referralId }, { sReferCode: 1, sUsername: 1, eType: 1, _id: 1 });
  };

  public getAdminUserList = async (payload: passbookAdminList): Promise<UserModelOutput[]> => {
    try {
      let { search, searchType } = payload;
      let userQuery = {};
      let users: UserModelOutput[] = [];
      if (search) {
        search = defaultSearch(search);
        switch (searchType) {
          case passbookSearchType.NAME:
            userQuery = { sName: { $regex: new RegExp("^.*" + search + ".*", "i") } };
            break;
          case passbookSearchType.USERNAME:
            userQuery = { sUsername: { $regex: new RegExp("^.*" + search + ".*", "i") } };
            break;
          case passbookSearchType.MOBILE:
            userQuery = { sMobNum: { $regex: new RegExp("^.*" + search + ".*", "i") } };
            break;
          case passbookSearchType.PASSBOOK:
            userQuery = {};
            break;
          default:
            userQuery = searchValues(search);
            break;
        }
        if (ObjectId.isValid(search)) {
          let user: UserModelOutput = await this.model.findById(search, { sMobNum: 1, sEmail: 1, sUsername: 1 });
          if(user !== null) users = [user];
        } else {
          users = await this.model.find(userQuery, { sMobNum: 1, sEmail: 1, sUsername: 1 }).lean();
        }
        if(!users.length) users = null
      }
      return users;
    } catch (error) {
      throw error;
    }
  };

  /*public getAdminUserListMatchLeague = async (payload: passbookMatchLeagueWiseList) => {
    try {
      let { search } = payload;
      let userQuery = {};
      let users: UserModelOutput[] = [];
      if (search) {
        search = defaultSearch(search);
        if (ObjectId.isValid(search)) {
          let user: UserModelOutput = await this.model.findById(search, { sMobNum: 1, sEmail: 1, sUsername: 1 });
          if(user !== null) users = [user];
        } else {
          users = await this.model.find(userQuery, { sMobNum: 1, sEmail: 1, sUsername: 1 }).lean();
        }
        if(!users.length) users = null
      }
      console.log(users)
      return users;
    } catch (error) {
      throw error;
    }
  } */

  public userListPassbook = async (userIds: ObjectId[]): Promise<UserModelOutput[]> => {
    return this.model.find({ _id: { $in: userIds } }, { sMobNum: 1, sEmail: 1, sUsername: 1 });
  };
}
