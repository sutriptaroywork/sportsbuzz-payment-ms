import sequelizeConnection from "@/connections/database/mysql/mysql";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { payoutStatusEnums } from "@/enums/payoutStatusEnums/payoutStatusEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import userWithdrawAttributes from "@/interfaces/userWithdrawInterface/userWithdrawInterface";
import { DataTypes, DateDataType, IntegerDataType, Model, Optional } from "sequelize";

export interface userWithdrawInput
  extends Optional<userWithdrawAttributes, "id" | "sInfo" | "dProcessedDate" | "dReversedDate" | "bReversed"> {}

export interface userWithdrawOutput extends Required<userWithdrawAttributes> {}

class UserWithdraw extends Model<userWithdrawInput, userWithdrawOutput> implements userWithdrawAttributes {
  public id: IntegerDataType;
  public iUserId: string;
  public ePaymentGateway: paymentGatewayEnums;
  public ePaymentStatus: payoutStatusEnums; // pending success cancelled refunded initiated
  public sInfo: string;
  nAmount: number;
  nParentId: number;
  iWithdrawalDoneBy: string;
  dWithdrawalTime: DateDataType;
  nWithdrawFee: number;
  sIP: string;
  eUserType: UserTypeEnums;
  ePlatform: PlatformTypesEnums; // A = Android, I = iOS, W = Web, O = Other, AD = Admin
  dCreatedAt: DataTypes.DateDataType;
  dUpdatedAt: DataTypes.DateDataType;
  dProcessedDate: DateDataType;
  dReversedDate: DateDataType;
  bReversed: number;
  iTransactionId: string;
}

UserWithdraw.init(
  {
    id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    iUserId: { type: DataTypes.STRING(24), allowNull: false },
    ePaymentGateway: {
      type: DataTypes.ENUM,
      values: [paymentGatewayEnums.PAYU, paymentGatewayEnums.RAZORPAY],
      defaultValue: paymentGatewayEnums.PAYU,
    },
    ePaymentStatus: {
      type: DataTypes.ENUM,
      values: [
        payoutStatusEnums.CANCELLED,
        payoutStatusEnums.PENDING,
        payoutStatusEnums.REFUNDED,
        payoutStatusEnums.SUCCESS,
        payoutStatusEnums.ON_HOLD,
        payoutStatusEnums.INITIATED,
      ],
      defaultValue: payoutStatusEnums.PENDING,
    }, // pending success cancelled refunded initiated on_hold
    sInfo: { type: DataTypes.TEXT },
    nAmount: { type: DataTypes.FLOAT(12, 2), defaultValue: 0 },
    nParentId: { type: DataTypes.INTEGER, defaultValue: 0 },
    iWithdrawalDoneBy: { type: DataTypes.STRING(24) },
    dWithdrawalTime: { type: DataTypes.DATE },
    nWithdrawFee: { type: DataTypes.FLOAT(12, 2), defaultValue: 0 },
    sIP: { type: DataTypes.STRING },
    eUserType: {
      type: DataTypes.ENUM,
      values: [UserTypeEnums.BOT, UserTypeEnums.COPY_BOT, UserTypeEnums.USER],
      defaultValue: "U",
    },
    ePlatform: {
      type: DataTypes.ENUM,
      values: [
        PlatformTypesEnums.AD,
        PlatformTypesEnums.ANDROID,
        PlatformTypesEnums.IOS,
        PlatformTypesEnums.WEB,
        PlatformTypesEnums.OTHER,
      ],
      defaultValue: "O",
    }, // A = Android, I = iOS, W = Web, O = Other, AD = Admin
    dCreatedAt: { type: DataTypes.DATE },
    dUpdatedAt: { type: DataTypes.DATE },
    dProcessedDate: { type: DataTypes.DATE },
    dReversedDate: { type: DataTypes.DATE },
    bReversed: { type: DataTypes.INTEGER, defaultValue: 0 },
    // sReversedInfo: { type: DataTypes.TEXT },
    iTransactionId: { type: DataTypes.STRING },
  },
  {
    sequelize: sequelizeConnection.sequelize,
    createdAt: "dCreatedAt",
    updatedAt: "dUpdatedAt",
    tableName: "userwithdraws",
    indexes: [
      {
        fields: ["iUserId", "ePaymentStatus"], // ePaymentStatus
      },
    ],
  },
);

export default UserWithdraw;
