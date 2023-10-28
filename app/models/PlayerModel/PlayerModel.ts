import { Schema } from "mongoose";
import * as TeamModel from "../teamModel/teamModel";
import { MatchDBConnect } from "@/connections/database/mongodb/mongodb";
import { PlayerAttributes } from "@/interfaces/player/playerInterface";
import { PlayerRoleEnums } from "@/enums/matchPlayerEnums/matchPlayerEnums";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { MatchProviderTypesEnums } from "@/enums/matchProviderTypesEnums/matchProviderTypeEnums";

export interface PlayerModelInput extends Omit<PlayerAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface PlayerModelOutput extends Required<PlayerAttributes> {}

const PlayerSchema = new Schema<PlayerAttributes>(
  {
    sKey: {
      type: String,
      trim: true,
      required: true,
    },
    sName: {
      type: String,
      trim: true,
    },
    eCategory: {
      type: String,
      enum: CategoryTypeEnums,
      default: CategoryTypeEnums.CRICKET,
    },
    sImage: {
      type: String,
      trim: true,
    },
    nFantasyCredit: {
      type: Number,
    },
    eRole: {
      type: String,
      trim: true,
      enum: PlayerRoleEnums,
      default: PlayerRoleEnums.BATSMAN,
    },
    iTeamId: {
      type: Schema.Types.ObjectId,
      ref: TeamModel.default,
    },
    eProvider: {
      type: String,
      enum: MatchProviderTypesEnums,
      default: MatchProviderTypesEnums.CUSTOM,
    },
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

const PlayerModel = MatchDBConnect.model("players", PlayerSchema);

export default PlayerModel;
