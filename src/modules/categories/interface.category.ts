import { Types } from "mongoose";

export interface ICategory {
  _id?: Types.ObjectId;

  slug: string;
  name: string;    
  nameEn: string;  
  image: string;
  description?: string;

  isActive: boolean;
  createdBy?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}