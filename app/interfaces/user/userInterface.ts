import { ObjectId } from "mongodb";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { UserStatusEnums } from "@/enums/userStatusEnums/userStatusEnums";
import { UserGenderEnums } from "@/enums/userGenderEnums/userGenderEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { SocialMediaTypesEnums } from "@/enums/socialMediaTypesEnums/socialMediaTypesEnums";

interface Social {
  sType: SocialMediaTypesEnums;
  sId: string;
  sToken: string;
}

interface JWT {
  sToken: string;
  sPushToken: string;
  dTimeStamp: Date;
}

export interface UserModelAttributes {
  _id: ObjectId;
  sName: string;
  sUsername: string;
  sEmail: string;
  bIsEmailVerified: boolean;
  sMobNum: string;
  sPassword: string;
  bIsMobVerified: boolean;
  sProPic: string;
  eType: UserTypeEnums;
  eGender: UserGenderEnums;
  aJwtTokens: Array<JWT>;
  oSocial: Social;
  nLoyaltyPoints: number;
  iCityId: number;
  iStateId: number;
  iCountryId: number;
  sState: string; //should be enum
  dDob: Date;
  sCity: string;
  sAddress: string;
  nPinCode: number;
  aDeviceToken: any;
  eStatus: UserStatusEnums;
  iReferredBy: ObjectId;
  sReferCode: string;
  sReferLink: string;
  dLoginAt: Date;
  dPasswordchangeAt: Date;
  sVerificationToken: string;
  bIsInternalAccount: boolean;
  sExternalId: string;
  sReferrerRewardsOn: string;
  ePlatform: PlatformTypesEnums;
  bIsKycApproved: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface userPopulateInterface {
  _id: ObjectId;
  iStateId: number;
  iCityId: number;
  sEmail: string;
  sMobNum: string;
  nPinCode: number;
}
