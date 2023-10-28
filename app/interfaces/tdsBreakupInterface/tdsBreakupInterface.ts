import defaultResponseInterface from "../defaultResponse/defaultResponseInterface";

export interface TdsObjectData {
        nAmountAfterTax: number,
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
}

export interface TdsBreakupResponse extends defaultResponseInterface {
    data?: TdsObjectData
}