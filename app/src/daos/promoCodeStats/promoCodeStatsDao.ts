import PromocodeStatisticModel, {
  PromoCodeStatisticModelInput,
  PromoCodeStatisticModelOutput,
} from "@/models/promoCodeStatsModel/promoCodeStatsModel";
import { UserLeagueModelOutput } from "@/models/userLeagueModel/userLeagueModel";
import { ObjectId } from "mongodb";
import BaseMongoDao from "../baseMongoDao";
import { PromoCodeTypesEnums } from "@/enums/promoCodeTypeEnums/promoCodeTypeEnums";

export default class PromoCodeStatsDao extends BaseMongoDao<
  PromoCodeStatisticModelInput,
  PromoCodeStatisticModelOutput
> {
  constructor() {
    super(PromocodeStatisticModel);
  }

  /**
   * This async method servers to create the statistics entry for a particular promotional code.
   * @param userId
   * @param promoCodeId
   * @param promoCodeDiscount
   * @param sTransactionType
   * @param matchId
   * @param matchLeagueId
   * @param userLeaguePayloadData
   * @returns
   */
  public createUserLeaguePromoCodeStats = async (
    userId: string,
    promoCodeId: ObjectId,
    promoCodeDiscount: number,
    sTransactionType: string,
    matchId: ObjectId,
    matchLeagueId: string,
    userLeaguePayloadData: UserLeagueModelOutput,
  ) => {
    const response = await this.model.create([
      {
        iUserId: userId,
        iPromocodeId: promoCodeId,
        nAmount: promoCodeDiscount,
        sTransactionType: PromoCodeTypesEnums.MATCH,
        iMatchId: matchId,
        iMatchLeagueId: matchLeagueId,
        iUserLeagueId: userLeaguePayloadData._id,
      },
    ]);
    return response;
  };

  /**
   * This async method servers to clear the traces of the promocode that exist already in DB as a collection since it is a mongoDB.
   * @param promoCodeStats
   */
  public clearTraces = async (promoCodeStats: any): Promise<void> => {
    await this.model.deleteOne({ _id: new ObjectId(promoCodeStats._id) });
  };
}
