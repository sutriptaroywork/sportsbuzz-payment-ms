import { ObjectId } from "mongoose";

export interface TeamInterface {
  iTeamId: ObjectId;
  sKey: string;
  sName: string;
  sShortName: string;
  sImage: string;
  nScore: number;
}
