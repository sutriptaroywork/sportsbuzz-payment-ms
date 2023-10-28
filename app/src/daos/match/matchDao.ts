import MatchModel, { MatchModelInput, MatchModelOutput } from "@/models/matchModel/matchModel";
import BaseMongoDao from "../baseMongoDao";
import { ObjectId, Schema } from "mongoose";

export class MatchDao extends BaseMongoDao<MatchModelInput, MatchModelOutput> {
  constructor() {
    super(MatchModel);
  }

  public fetchUsingMatchIds = (aMatchIds: ObjectId[]) => {
    return this.model.find({ _id: { $in: aMatchIds } }, { sName: 1, dStartDate: 1 })
  }

  public fetchForName = (aMatchId: string[]) => {
    const matchIds = aMatchId.map( id =>  { if(id !== null) new Schema.Types.ObjectId(id) })
    return this.model.find({ _id: { $in: matchIds } }, { sName: 1 })
  }
}
