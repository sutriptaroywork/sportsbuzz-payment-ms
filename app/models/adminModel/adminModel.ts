import { Schema } from "mongoose";
import * as RoleModel from "../adminRoleModel/adminRoleModel";
import { AdminsDBConnect } from "@/connections/database/mongodb/mongodb";
import { AdminAttributes } from "@/interfaces/admin/adminInterface";
import { AdminTypeEnums } from "@/enums/adminTypeEnums/adminTypeEnums";
import { AdminStatusEnums } from "@/enums/adminStatusEnums/adminStatusEnums";
import { AdminPermissionTypeEnums } from "@/enums/adminPermissionTypeEnums/adminPermissionTypeEnums";
import { AdminPanelPermissionScopeEnums } from "@/enums/adminPanelPermissionScopeEnums/AdminPanelPermissionScopeEnums";

export interface AdminModelInput extends Omit<AdminAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface AdminModelOutput extends Required<AdminAttributes> {}

const AdminSchema = new Schema<AdminAttributes>(
  {
    sName: {
      type: String,
      trim: true,
      required: true,
    },
    sUsername: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    sEmail: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    sMobNum: {
      type: String,
      trim: true,
      required: true,
    },
    sProPic: {
      type: String,
      trim: true,
    },
    eType: {
      type: String,
      enum: AdminTypeEnums,
      required: true,
    },
    aPermissions: [
      {
        eKey: {
          type: String,
          enum: AdminPanelPermissionScopeEnums,
        },
        eType: {
          type: String,
          enum: AdminPermissionTypeEnums,
        },
      },
    ],
    iRoleId: {
      type: Schema.Types.ObjectId,
    },
    sPassword: {
      type: String,
      trim: true,
      required: true,
    },
    eStatus: {
      type: String,
      enum: AdminStatusEnums,
      default: AdminStatusEnums.ACTIVE,
    },
    aJwtTokens: [
      {
        sToken: {
          type: String,
        },
        sPushToken: {
          type: String,
          trim: true,
        },
        dTimeStamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    dLoginAt: {
      type: Date,
    },
    dPasswordchangeAt: {
      type: Date,
    },
    sVerificationToken: {
      type: String,
    },
    sExternalId: {
      type: String,
    },
    sDepositToken: {
      type: String,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const AdminModel = AdminsDBConnect.model("admins", AdminSchema);

export default AdminModel;
