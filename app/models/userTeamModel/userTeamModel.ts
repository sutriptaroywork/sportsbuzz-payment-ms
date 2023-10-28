import { Schema } from "mongoose";
import UserModel from "../userModel/userModel";
import MatchModel from "../matchModel/matchModel";
import { FantasyTeamConnect } from "@/connections/database/mongodb/mongodb";
import MatchPlayerModel from "../matchPlayerModel/matchPlayerModel";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { UserTeamAttributes } from "@/interfaces/userTeam/userTeamInterface";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";

export interface UserTeamModelInput extends Omit<UserTeamAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface UserTeamModelOutput extends Required<UserTeamAttributes> {}

const UserTeamSchema = new Schema<UserTeamAttributes>(
  {
    iMatchId: {
      type: Schema.Types.ObjectId,
      ref: MatchModel,
    },
    iUserId: {
      type: Schema.Types.ObjectId,
      ref: UserModel,
    },
    sName: {
      type: String,
      trim: true,
      required: true,
    },
    iCaptainId: {
      type: Schema.Types.ObjectId,
      ref: MatchPlayerModel,
      required: true,
    },
    iViceCaptainId: {
      type: Schema.Types.ObjectId,
      ref: MatchPlayerModel,
      required: true,
    },
    nTotalPoints: {
      type: Number,
    },
    sHash: {
      type: String,
      trim: true,
    },
    bPointCalculated: {
      type: Boolean,
      default: false,
    },
    bSwapped: {
      type: Boolean,
      default: false,
    }, // it's true when combination bot replaced with copy bot userTeam and vice versa.
    eCategory: {
      type: String,
      enum: CategoryTypeEnums,
      default: CategoryTypeEnums.CRICKET,
    },
    eType: {
      type: String,
      enum: UserTypeEnums,
      default: UserTypeEnums.USER,
    }, // U = USER B = BOT
    dUpdatedAt: {
      type: Date,
    },
    dCreatedAt: {
      type: Date,
      default: Date.now,
    },
    sExternalId: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" },
  },
);

const UserTeamModel = FantasyTeamConnect.model("userteams", UserTeamSchema);

export default UserTeamModel;
