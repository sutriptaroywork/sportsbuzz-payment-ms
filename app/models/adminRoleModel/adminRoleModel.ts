import { Schema } from "mongoose";
import { AdminsDBConnect } from "@/connections/database/mongodb/mongodb";
import { AdminRoleAttributes } from "@/interfaces/adminRole/adminRole";
import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";
import { AdminPermissionTypeEnums } from "@/enums/adminPermissionTypeEnums/adminPermissionTypeEnums";
import { AdminPanelPermissionScopeEnums } from "@/enums/adminPanelPermissionScopeEnums/AdminPanelPermissionScopeEnums";

export interface AdminRoleModelInput extends Omit<AdminRoleAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface AdminRoleModelOutput extends Required<AdminRoleAttributes> {}

const RoleSchema = new Schema<AdminRoleAttributes>(
  {
    sName: {
      type: String,
      required: true,
    },
    aPermissions: [
      {
        sKey: {
          type: String,
          enum: AdminPanelPermissionScopeEnums,
        },
        eType: {
          type: String,
          enum: AdminPermissionTypeEnums,
        },
      },
    ],
    eStatus: {
      type: String,
      enum: StatusTypeEnums,
      default: StatusTypeEnums.YES,
    },
    sExternalId: {
      type: String,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const RoleModel = AdminsDBConnect.model("roles", RoleSchema);

export default RoleModel;
