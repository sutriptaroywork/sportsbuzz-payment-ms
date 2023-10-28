import cityModel, { cityInputModel, cityOutputModel } from "@/models/cityModel/cityModel";
import BaseMongoDao from "../baseMongoDao";

export default class cityDao extends BaseMongoDao<cityInputModel, cityOutputModel> {
  constructor() {
    super(cityModel);
  }
}
