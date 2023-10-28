import { ObjectId } from "mongodb";

export interface LeagueCategoryAttributes {
  _id: ObjectId;
  Title: string;
  Position: number;
  Remark: string;
  Key: string;
  Image: string;
  ExternalId: string;

  createdAt?: Date;
  updatedAt?: Date;
}
