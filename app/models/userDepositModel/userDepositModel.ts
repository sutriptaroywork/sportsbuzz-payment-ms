import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { UserDepositAttributes } from "@interfaces/userDeposit/userDepositInterface";
import { Model, DataTypes, IntegerDataType, DateDataType, Optional } from "sequelize";
import sequelizeConnection from "@/connections/database/mysql/mysql";
import { ObjectId } from "mongoose";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";

export interface UserDepositInput
  extends Optional<
    UserDepositAttributes,
    | "id"
    | "dProcessedDate"
    | "ePlatform"
    | "eUserType"
    | "iReferenceId"
    | "sPromocode"
    | "iPromocodeId"
    | "iTransactionId"
    | "iOrderId"
  > {}
export interface UserDepositOutput extends Required<UserDepositAttributes> {}

class UserDeposit extends Model<UserDepositInput, UserDepositOutput> implements UserDepositAttributes {
  public id: IntegerDataType;
  public iReferenceId: number;
  public iUserId: string;
  public ePaymentGateway: paymentOptionEnums;
  public ePaymentStatus: paymentStatusEnum;
  public sInfo: string;
  public sPromocode: string;
  public iPromocodeId: string;
  public iTransactionId: string;
  public iOrderId: string;
  public nAmount: number;
  public nCash: number;
  public nBonus: number;
  public eUserType: UserTypeEnums;
  public ePlatform: PlatformTypesEnums; // A = Android, I = iOS, W = Web, O = Other, AD = Admin
  public dProcessedDate: DateDataType;
}

UserDeposit.init(
  {
    id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    iReferenceId: { type: DataTypes.UUIDV4, defaultValue: DataTypes.UUIDV4, unique: true },
    iUserId: { type: DataTypes.STRING(24), allowNull: false },
    ePaymentGateway: {
      type: DataTypes.ENUM,
      values: [
        paymentGatewayEnums.PAYU,
        paymentGatewayEnums.RAZORPAY,
        paymentGatewayEnums.CASHFREE,
        paymentGatewayEnums.JUSPAY,
        paymentGatewayEnums.CASHFREE_UPI,
        paymentGatewayEnums.ADMIN,
      ],
    },
    ePaymentStatus: {
      type: DataTypes.ENUM,
      values: [
        paymentStatusEnum.CANCELLED,
        paymentStatusEnum.SUCCESS,
        paymentStatusEnum.REFUNDED,
        paymentStatusEnum.PENDING,
      ],
      defaultValue: paymentStatusEnum.PENDING,
    },
    sInfo: { type: DataTypes.TEXT },
    sPromocode: { type: DataTypes.STRING },
    iPromocodeId: { type: DataTypes.NUMBER },
    iTransactionId: { type: DataTypes.STRING },
    iOrderId: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4 },
    nAmount: { type: DataTypes.FLOAT(12, 2), defaultValue: 0 },
    nCash: { type: DataTypes.FLOAT(12, 2), allowNull: false, defaultValue: 0 },
    nBonus: { type: DataTypes.FLOAT(12, 2), defaultValue: 0 },
    eUserType: {
      type: DataTypes.ENUM,
      values: [UserTypeEnums.BOT, UserTypeEnums.COPY_BOT, UserTypeEnums.USER],
      defaultValue: UserTypeEnums.USER,
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
      defaultValue: PlatformTypesEnums.OTHER,
    }, // A = Android, I = iOS, W = Web, O = Other, AD = Admin
    dProcessedDate: { type: DataTypes.DATE },
  },
  {
    sequelize: sequelizeConnection.sequelize,
    createdAt: "dCreatedAt",
    updatedAt: "dUpdatedAt",
    tableName: "userdeposits",
    indexes: [
      {
        fields: ["iUserId", "iPromocodeId", "ePaymentStatus"], // ePaymentStatus, iPromocodeId
      },
    ],
  },
);

export default UserDeposit;
