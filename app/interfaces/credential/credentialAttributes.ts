import { adminPayEnums } from "@/enums/adminPayEnums/adminPayEnums";

export interface credentialAttributes {
  eKey: adminPayEnums;
  sPassword: string;
  sExternalId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
