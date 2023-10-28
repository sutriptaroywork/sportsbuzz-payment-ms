import { Schema } from "mongoose";
import { UsersDBConnect } from "@/connections/database/mongodb/mongodb";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { UserModelAttributes } from "@/interfaces/user/userInterface";
import { UserGenderEnums } from "@/enums/userGenderEnums/userGenderEnums";
import { UserStatusEnums } from "@/enums/userStatusEnums/userStatusEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { SocialMediaTypesEnums } from "@/enums/socialMediaTypesEnums/socialMediaTypesEnums";

export interface UserModelInput extends Omit<UserModelAttributes, "_id" | "age" | "createdAt" | "updatedAt"> {}
export interface UserModelOutput extends Required<UserModelAttributes> {}

const UserSchema = new Schema<UserModelAttributes>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      trim: true,
    },
    sName: {
      type: String,
      trim: true,
    },
    sUsername: { type: String, trim: true, required: true },
    sEmail: {
      type: String,
      trim: true,
    },
    bIsEmailVerified: {
      type: Boolean,
      default: false,
    },
    sMobNum: { type: String, trim: true, required: true },
    bIsMobVerified: {
      type: Boolean,
      default: false,
    },
    sProPic: {
      type: String,
      trim: true,
    },
    eType: {
      type: String,
      enum: UserTypeEnums,
      default: UserTypeEnums.USER,
    }, // U = USER B = BOT
    eGender: {
      type: String,
      enum: UserGenderEnums,
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
    oSocial: {
      sType: {
        type: String,
        enum: SocialMediaTypesEnums,
      },
      sId: {
        type: String,
      },
      sToken: {
        type: String,
      },
    },
    nLoyaltyPoints: {
      type: Number,
      default: 0,
    },
    iCityId: {
      type: Number,
    }, // check
    iStateId: {
      type: Number,
    }, // check
    iCountryId: {
      type: Number,
    }, // check or not in used
    sState: {
      type: String,
    },
    dDob: { type: Date },
    sCity: {
      type: String,
    },
    sAddress: {
      type: String,
    },
    nPinCode: {
      type: Number,
    },
    aDeviceToken: {
      type: Array,
    },
    eStatus: {
      type: String,
      enum: UserStatusEnums,
      default: UserStatusEnums.ACTIVE,
    },
    iReferredBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    sReferCode: {
      type: String,
    },
    sReferLink: {
      type: String,
    },
    dLoginAt: {
      type: Date,
    },
    dPasswordchangeAt: {
      type: Date,
    },
    sPassword: {
      type: String,
      trim: true,
      default: null,
    },
    sVerificationToken: {
      type: String,
    },
    bIsInternalAccount: {
      type: Boolean,
      default: false,
    },
    sExternalId: {
      type: String,
    },
    sReferrerRewardsOn: {
      type: String,
    },
    ePlatform: {
      type: String,
      enum: PlatformTypesEnums,
      required: true,
      default: PlatformTypesEnums.OTHER,
    },
    bIsKycApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const UserModel = UsersDBConnect.model("users", UserSchema);

export default UserModel;
