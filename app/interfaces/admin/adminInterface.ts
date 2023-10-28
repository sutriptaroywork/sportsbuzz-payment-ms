import { ObjectId } from "mongodb";
import { AdminTypeEnums } from "@/enums/adminTypeEnums/adminTypeEnums";
import { AdminStatusEnums } from "@/enums/adminStatusEnums/adminStatusEnums";
import { AdminPermissionTypeEnums } from "@/enums/adminPermissionTypeEnums/adminPermissionTypeEnums";
import { AdminPanelPermissionScopeEnums } from "@/enums/adminPanelPermissionScopeEnums/AdminPanelPermissionScopeEnums";

interface Permission {
  eKey: AdminPanelPermissionScopeEnums;
  eType: AdminPermissionTypeEnums;
}

interface JWT {
  sToken: string;
  sPushToken: string;
  dTimeStamp: Date;
}

export interface AdminAttributes {
  _id: ObjectId;
  sName: string;
  sUsername: string;
  sEmail: string;
  sMobNum: string;
  sProPic: string;
  eType: AdminTypeEnums;
  aPermissions: Array<Permission>;
  iRoleId: ObjectId;
  sPassword: string;
  eStatus: AdminStatusEnums;
  aJwtTokens: Array<JWT>;
  dLoginAt: Date;
  dPasswordchangeAt: Date;
  sVerificationToken: string;
  sExternalId: string;
  sDepositToken: string;

  createdAt?: Date;
  updatedAt?: Date;
}
