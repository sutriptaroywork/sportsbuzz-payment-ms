import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";
import { AdminPermissionTypeEnums } from "@/enums/adminPermissionTypeEnums/adminPermissionTypeEnums";
import { AdminPanelPermissionScopeEnums } from "@/enums/adminPanelPermissionScopeEnums/AdminPanelPermissionScopeEnums";

export interface AdminRoleAttributes {
  sName: string;
  aPermissions: Array<{
    sKey: AdminPanelPermissionScopeEnums;
    eType: AdminPermissionTypeEnums; // R = READ, W = WRITE, N = NONE - Rights
  }>;
  eStatus: StatusTypeEnums;
  sExternalId: string;

  createdAt?: Date;
  updatedAt?: Date;
}
