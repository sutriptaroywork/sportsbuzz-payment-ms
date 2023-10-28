import { userWithdrawOutput } from "@/models/userWithdrawModel/userWithdrawModel";
import defaultResponseInterface from "../defaultResponse/defaultResponseInterface";

export interface withdrawStatusResponse extends defaultResponseInterface {
    data?: { pending: boolean, userWithdraw?: userWithdrawOutput }
}