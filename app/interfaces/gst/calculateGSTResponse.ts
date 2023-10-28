
export interface oGST { nAmountAfterGST: number; nRequestedAmount: number; nGSTAmount: number; nRepayBonusAmount: number; nPromocodeBonus?: number }
export default interface calculateGSTResponse {
    isSuccess: boolean; oGST: oGST
}