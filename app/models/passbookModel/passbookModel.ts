import sequelizeConnection from "@/connections/database/mysql/mysql";
import { PassbookStatusTypeEnums, PassbookTypeEnums } from "@/enums/passbookTypeEnums/passbookTypeEnums";
import { TransactionTypeEnums } from "@/enums/transactionTypeEnums/transactionTypesEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { PassbookAttributes } from "@/interfaces/passBook/passBookInterface";
import { ObjectId } from "mongodb";
import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface PassbookInput extends Optional<PassbookAttributes, "id"> {}
export interface PassbookOutput extends Required<PassbookAttributes> { total?: any; }

class Passbook extends Model<PassbookAttributes, PassbookInput> implements PassbookAttributes {
  public id: number;
  public nOldWinningBalance: number;
  public nOldDepositBalance: number;
  public nOldTotalBalance: number;
  public nNewWinningBalance: number;
  public nNewDepositBalance: number;
  public nNewTotalBalance: number;
  public nOldBonus: number;
  public nNewBonus: number;
  public iUserId: string;
  public nAmount: number;
  public nBonus: number;
  public nCash: number;
  public eTransactionType: string;
  public dBonusExpiryDate: Date;
  public bIsBonusExpired: boolean;
  public bCreatorBonusReturn: boolean;
  public bWinReturn: boolean;
  public iPreviousId: number;
  public iUserLeagueId: string;
  public iMatchId: string;
  public iMatchLeagueId: string;
  public iSeriesId: string;
  public iCategoryId: string;
  public sPromocode: string;
  public iTransactionId: string;
  public iUserDepositId: string;
  public iWithdrawId: string;
  public nWithdrawFee: number;
  public sRemarks: string;
  public sCommonRule: string;
  public eUserType: UserTypeEnums;
  public eStatus: PassbookStatusTypeEnums;
  public eType: PassbookTypeEnums;
  public nLoyaltyPoint: string;
  public eCategory: string;
  public dActivityDate: Date;
  public dProcessedDate: Date;
}

Passbook.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    iUserId: {
      type: DataTypes.STRING(24),
      allowNull: false,
    },
    nAmount: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nBonus: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nCash: {
      type: DataTypes.FLOAT(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    nOldWinningBalance: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nOldDepositBalance: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nOldTotalBalance: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nNewWinningBalance: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nNewDepositBalance: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nNewTotalBalance: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nOldBonus: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nNewBonus: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    eTransactionType: {
      type: DataTypes.ENUM,
      values: [
        TransactionTypeEnums.BONUS,
        TransactionTypeEnums.BONUS_EXPIRE,
        TransactionTypeEnums.CASHBACK,
        TransactionTypeEnums.CASHBACK_RETURN,
        TransactionTypeEnums.CREATOR_BONUS,
        TransactionTypeEnums.CREATOR_BONUS_RETURN,
        TransactionTypeEnums.DEPOSIT,
        TransactionTypeEnums.LOYALTY_POINT,
        TransactionTypeEnums.OPENING,
        TransactionTypeEnums.PLAY,
        TransactionTypeEnums.PLAY_RETURN,
        TransactionTypeEnums.REFER_BONUS,
      ],
      defaultValue: TransactionTypeEnums.DEPOSIT,
    },
    dBonusExpiryDate: {
      type: DataTypes.DATE,
    },
    bIsBonusExpired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bCreatorBonusReturn: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }, // we'll check this flag after win return process we again win distribution time
    bWinReturn: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }, // we'll check this flag after win return process we again win distribution time
    iPreviousId: {
      type: DataTypes.INTEGER,
    },
    iUserLeagueId: {
      type: DataTypes.STRING(24),
    },
    iMatchId: {
      type: DataTypes.STRING(24),
    },
    iMatchLeagueId: {
      type: DataTypes.STRING(24),
    },
    iSeriesId: {
      type: DataTypes.STRING,
    },
    iCategoryId: {
      type: DataTypes.STRING,
    },
    sPromocode: {
      type: DataTypes.STRING,
    },
    iTransactionId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    }, // allowNull: false },
    iUserDepositId: {
      type: DataTypes.STRING(24),
    },
    iWithdrawId: {
      type: DataTypes.STRING(24),
    },
    nWithdrawFee: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    sRemarks: {
      type: DataTypes.TEXT,
    },
    sCommonRule: {
      type: DataTypes.STRING,
    },
    eUserType: {
      type: DataTypes.ENUM,
      values: [UserTypeEnums.BOT, UserTypeEnums.COPY_BOT, UserTypeEnums.USER],
      defaultValue: UserTypeEnums.USER,
    },
    eStatus: {
      type: DataTypes.ENUM,
      values: [PassbookStatusTypeEnums.CANCEL, PassbookStatusTypeEnums.COMPLETED, PassbookStatusTypeEnums.REFUND],
      defaultValue: PassbookStatusTypeEnums.COMPLETED,
    },
    eType: {
      type: DataTypes.ENUM,
      values: [PassbookTypeEnums.CREDITED, PassbookTypeEnums.DEBITED],
      defaultValue: PassbookTypeEnums.DEBITED,
    }, // Dr, Cr
    nLoyaltyPoint: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    eCategory: {
      type: DataTypes.STRING,
    },
    dActivityDate: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
    dProcessedDate: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: sequelizeConnection.sequelize,
    createdAt: "dCreatedAt",
    updatedAt: "dUpdatedAt",
    tableName: "passbooks",
    indexes: [
      {
        fields: ["iUserId", "dCreatedAt", "eTransactionType"],
      },
      {
        fields: ["iUserId", "iUserLeagueId", "eTransactionType", "iUserDepositId", "iWithdrawId"],
        name: "passbooks_unique",
        unique: true,
      },
    ],
  },
);

export default Passbook;
