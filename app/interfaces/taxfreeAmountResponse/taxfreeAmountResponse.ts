import defaultResponseInterface from "../defaultResponse/defaultResponseInterface";

export interface TaxfreeAmountResponse extends defaultResponseInterface {
    data?: {
        bEligible: boolean;
        nTaxFreeAmount: number;
    }
}