import AdminModel, { AdminModelInput, AdminModelOutput } from "@/models/adminModel/adminModel";
import BaseMongoDao from "../baseMongoDao";
import { ObjectId } from "mongoose";

export default class AdminDao extends BaseMongoDao<AdminModelInput,AdminModelOutput> {
 constructor() {
    super(AdminModel)
 }

 public findAllByIds = async (aAdminId: ObjectId[]) : Promise<AdminModelOutput[]> =>  {
   return this.model.find({ _id: { $in: aAdminId } }, {
      sUsername: 1,
      _id: 1
    });
 }
}