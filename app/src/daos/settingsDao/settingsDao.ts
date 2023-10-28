import settingsModel, { SettingsInput, SettingsOutput } from "@/models/settingsModel/settingsModel";
import BaseMongoDao from "../baseMongoDao";

export default class settingsDao extends BaseMongoDao<SettingsInput, SettingsOutput> {
  constructor() {
    super(settingsModel);
  }
}
