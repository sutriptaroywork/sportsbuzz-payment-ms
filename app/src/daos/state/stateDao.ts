import stateModel, { StateInputModel, StateOutputModel } from "@/models/stateModel/stateModel";
import BaseMongoDao from "../baseMongoDao";

export default class stateDao extends BaseMongoDao<StateInputModel, StateOutputModel> {
  constructor() {
    super(stateModel);
  }
}
