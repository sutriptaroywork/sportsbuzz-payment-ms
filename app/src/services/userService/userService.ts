import { ObjectId } from "mongodb";
import UserDao from "@/src/daos/user/userDaos";
import { UserModelOutput } from "@/models/userModel/userModel";
import { HttpException } from "@/library/HttpException/HttpException";
import { messagesEnglish, StatusCodeEnums } from "@/enums/commonEnum/commonEnum";
import { MatchLeagueAttributes } from "@/interfaces/matchLeague/matchLeagueInterface";

export default class UserService {
  private userDao: UserDao;

  constructor() {
    this.userDao = new UserDao();
  }

  public getUserById = async (
    userId: string,
    matchLeague: MatchLeagueAttributes,
    nTotalTeam: number,
  ): Promise<UserModelOutput> => {
    const user = await this.userDao.getUserById(userId);
    if (user.bIsInternalAccount === true) {
      if (matchLeague.bPrivateLeague === false) {
        throw new HttpException(StatusCodeEnums.OK, messagesEnglish.public_league_join_err, {
          data: { sKey: "OTHER", oValue: { nJoinSuccess: 0, nTotalTeam } },
        });
      } else if (matchLeague.bPrivateLeague === true && matchLeague.bInternalLeague === false) {
        throw new HttpException(StatusCodeEnums.OK, messagesEnglish.league_join_err, {
          data: { sKey: "OTHER", oValue: { nJoinSuccess: 0, nTotalTeam } },
        });
      }
    } else {
      if (matchLeague.bInternalLeague === true) {
        throw new HttpException(StatusCodeEnums.OK, messagesEnglish.league_join_err, {
          data: { sKey: "OTHER", oValue: { nJoinSuccess: 0, nTotalTeam } },
        });
      }
    }
    return user;
  };

  public checkReferral = async (referredById: ObjectId) => {
    return await this.userDao.checkReferral(referredById);
  };
}
