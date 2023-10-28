import MatchLeagueModel, {
  MatchLeagueModelInput,
  MatchLeagueModelOutput,
} from "@/models/matchLeagueModel/matchLeagueModel";
import BaseMongoDao from "../baseMongoDao";
import { Schema } from "mongoose";

export class matchLeagueDao extends BaseMongoDao<MatchLeagueModelInput, MatchLeagueModelOutput> {
  constructor() {
    super(MatchLeagueModel);
  }

  public matchLeaguePopulate = async (aMatchLeagueId: string[]): Promise<any> => {
    const matchLeagueIds = aMatchLeagueId.map(d => {
      if(d !== null) new Schema.Types.ObjectId(String(d))
    });
    const query = { _id: { $in: matchLeagueIds } };
    const projection = { sName: 1, iMatchId: 1 };
    return await this.model.findOne(query, projection).populate("oMatch", ["sName"]).lean();
  };
}
