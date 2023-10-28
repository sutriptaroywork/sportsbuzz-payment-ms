import defaultResponseInterface from "../defaultResponse/defaultResponseInterface";
import { oGST } from "./calculateGSTResponse";

export default interface GSTbreakupResponse extends defaultResponseInterface {
    data?: oGST
}