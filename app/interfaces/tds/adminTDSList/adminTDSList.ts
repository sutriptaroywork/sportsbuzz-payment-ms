import { tdsStatusEnums } from "@/enums/tdsStatusEnums/tdsStatusEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import { UserBalanceOutput } from "@/models/userBalanceModel/userBalanceModel";
import { userTdsOutput } from "@/models/userTdsModel/userTdsModel";
import { IntegerDataType } from "sequelize";

export interface AdminTDSListInterface {
    start: string | number,
    limit : string | number,
    datefrom : string,
    dateto: string,
    search: string,
    sort: string,
    order: string,
    isFullResponse: boolean,
    eStatus: tdsStatusEnums,
    eUserType: UserTypeEnums,
    sportsType: string
}

export interface AdminTDSListResponse extends defaultResponseInterface {
    data: userTdsOutput[]
}

export interface AdminTDSCountResponse extends defaultResponseInterface {
    data: AdminTdsCount|number
}

export interface AdminTDSupdate {eStatus: tdsStatusEnums, id: number}

export interface AdminTDSupdateResponse extends defaultResponseInterface { data: userTdsOutput}

export interface AdminTDSMatchLeagueListInterface {
    start: string | number,
    limit : string | number,
    datefrom : string,
    dateto: string,
    search: string,
    sort: string,
    order: string,
    isFullResponse: boolean,
    eStatus: tdsStatusEnums,
    eUserType: UserTypeEnums,
    sportsType: string,
    id: string
}

export interface AdminTdsCount {
    count: number;
    rows?: any
}

export interface CalculateTDSResponse {
 isSuccess: boolean, oTDS: {
    nAmountAfterTax,
        nTotalWithdrawalAmount: number,
        nTotalDepositedAmount: number,
        nOpeningBalanceOfYear: number,
        nTotalProcessedAmount: number,
        nTaxableAmount: number,
        nRequestedAmount: number,
        nTDSAmount: number,
        nPercentage: number | string,
        nTaxFreeAmount: number,
        dFinancialYear: string,
        bEligible: boolean,
 }, oData : {
    iUserId: string,nFinalAmount: number, iWithdrawId?: IntegerDataType,
                  iAdminId?: string,
                  iPassbookId?: number,
                  oldBalance?: UserBalanceOutput
 }
}