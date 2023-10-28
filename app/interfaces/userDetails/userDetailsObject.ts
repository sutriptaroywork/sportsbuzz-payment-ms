import defaultResponseInterface from "../defaultResponse/defaultResponseInterface";

export interface UserDetailsObject {
    nCurrentDepositBalance: number;
    nCurrentWinningBalance: number;
    nCurrentBonus: number;
    nTotalBonusEarned: number;
    nTotalDepositAmount: number;
    nTotalWithdrawAmount: number;
    nTotalWinningAmount: number;
    nTotalPlayedCash: number;
    nTotalPlayedBonus: number;
    nTotalPlayReturnCash: number;
    nTotalPlayReturnBonus: number;
    nLastPendingWithdraw: number;
    nWinBalanceAtLastPendingWithdraw: number;
    nTotalCreatorBonus: number;
    nTotalRegisterBonus: number;
    nTotalReferBonus: number;
    nTotalBonusExpired: number;
    nTotalCashbackCash: number;
    nTotalCashbackBonus: number;
}

export interface UserDetailsResponse extends defaultResponseInterface {
    data?: UserDetailsObject
}