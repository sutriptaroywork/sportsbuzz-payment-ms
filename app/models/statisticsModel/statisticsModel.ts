import { Schema } from "mongoose";
import UserModel from "../userModel/userModel";
import MatchModel from "../matchModel/matchModel";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { GamesDBConnect } from "@/connections/database/mongodb/mongodb";
import { StatisticAttributes } from "@/interfaces/statistics/statisticsInterface";
import { ObjectId } from "mongodb";

export interface StatisticModelInput extends Omit<StatisticAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface StatisticModelOutput extends Required<StatisticAttributes> {
  iUserId: string;
}

const SportStats = {
  aMatchPlayed: [
    {
      iMatchId: {
        type: Schema.Types.ObjectId,
      },
      nPlayReturn: {
        type: Number,
        default: 0,
      },
    },
  ],
  nJoinLeague: {
    type: Number,
    default: 0,
  },
  nSpending: {
    type: Number,
    default: 0,
  },
  nSpendingCash: {
    type: Number,
    default: 0,
  },
  nSpendingBonus: {
    type: Number,
    default: 0,
  },
  nWinAmount: {
    type: Number,
    default: 0,
  },
  nWinCount: {
    type: Number,
    default: 0,
  },
  nCashbackCash: {
    type: Number,
    default: 0,
  },
  nCashbackCashCount: {
    type: Number,
    default: 0,
  },
  nCashbackBonus: {
    type: Number,
    default: 0,
  },
  nCashbackBonusCount: {
    type: Number,
    default: 0,
  },
  nCashbackAmount: {
    type: Number,
    default: 0,
  },
  nCashbackCount: {
    type: Number,
    default: 0,
  },
  nCashbackReturnCash: {
    type: Number,
    default: 0,
  },
  nCashbackReturnCashCount: {
    type: Number,
    default: 0,
  },
  nCashbackReturnBonus: {
    type: Number,
    default: 0,
  },
  nCashbackReturnBonusCount: {
    type: Number,
    default: 0,
  },
  nPlayReturn: {
    type: Number,
    default: 0,
  },
  nCreatePLeague: {
    type: Number,
    default: 0,
  },
  nJoinPLeague: {
    type: Number,
    default: 0,
  },
  nCreatePLeagueSpend: {
    type: Number,
    default: 0,
  },
  nJoinPLeagueSpend: {
    type: Number,
    default: 0,
  },
  nDiscountAmount: {
    type: Number,
    default: 0,
  },
  nTDSAmount: {
    type: Number,
    default: 0,
  },
  nTDSCount: {
    type: Number,
    default: 0,
  },
};

const StatisticSchema = new Schema<StatisticAttributes>(
  {
    iUserId: {
      type: Schema.Types.ObjectId,
      ref: UserModel,
      required: true,
      unique: true,
    },
    eUserType: {
      type: String,
      enum: UserTypeEnums,
      default: UserTypeEnums.USER,
    },
    oCricket: SportStats,
    oBaseball: SportStats,
    oFootball: SportStats,
    oBasketball: SportStats,
    oKabaddi: SportStats,
    nTDSAmount: {
      type: Number,
      default: 0,
    },
    nTDSCount: {
      type: Number,
      default: 0,
    },
    nTotalWinReturn: {
      type: Number,
      default: 0,
    },
    nTotalPlayReturn: {
      type: Number,
      default: 0,
    },

    nTotalPlayedCash: {
      type: Number,
      default: 0,
    },
    nTotalPlayedBonus: {
      type: Number,
      default: 0,
    },
    nTotalPlayReturnCash: {
      type: Number,
      default: 0,
    },
    nTotalPlayReturnBonus: {
      type: Number,
      default: 0,
    },

    nCashbackCash: {
      type: Number,
      default: 0,
    },
    nCashbackBonus: {
      type: Number,
      default: 0,
    },
    nTotalCashbackReturnCash: {
      type: Number,
      default: 0,
    },
    nTotalCashbackReturnBonus: {
      type: Number,
      default: 0,
    },
    nDeposits: {
      type: Number,
      default: 0,
    },
    nBonus: {
      type: Number,
      default: 0,
    },
    nWithdraw: {
      type: Number,
      default: 0,
    },
    nTotalWinnings: {
      type: Number,
      default: 0,
    },

    nActualDepositBalance: {
      type: Number,
      default: 0,
    },
    nActualWinningBalance: {
      type: Number,
      default: 0,
    },
    nActualBonus: {
      type: Number,
      default: 0,
    },

    aTotalMatch: [
      {
        iMatchId: {
          type: Schema.Types.ObjectId,
          ref: MatchModel,
        },
        nPlayReturn: {
          type: Number,
          default: 0,
        },
      },
    ],
    nTotalPLeagueSpend: {
      type: Number,
      default: 0,
    },
    nTotalSpend: {
      type: Number,
      default: 0,
    },
    nReferrals: {
      type: Number,
      default: 0,
    },
    nTotalJoinLeague: {
      type: Number,
      default: 0,
    },
    nTotalBonusExpired: {
      type: Number,
      default: 0,
    },
    nWinnings: {
      type: Number,
      default: 0,
    },
    nCash: {
      type: Number,
      default: 0,
    },
    nDepositCount: {
      type: Number,
      default: 0,
    },
    nWithdrawCount: {
      type: Number,
      default: 0,
    },
    nDiscountAmount: {
      type: Number,
      default: 0,
    },
    nDepositDiscount: {
      type: Number,
      default: 0,
    },
    nTeams: {
      type: Number,
      default: 0,
    },
    sExternalId: {
      type: String,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const StatisticsModel = GamesDBConnect.model("statistics", StatisticSchema);

export default StatisticsModel;
