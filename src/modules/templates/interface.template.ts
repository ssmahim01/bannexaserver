import { Types } from "mongoose";

export interface ITemplate {
  slug: string;
  title: string;
  previewImage: string;
  downloads: number;
  category: Types.ObjectId;
  post?: Types.ObjectId;
  uses: number;

  canvasWidth: number;
  canvasHeight: number;
  author: {
    name?: string;
    avatar?: string | null;
  };

  // layers: {
  //   type: "image" | "text";
  //   x: number;
  //   y: number;
  //   width?: number;
  //   height?: number;
  //   fontSize?: number;
  //   color?: string;
  //   placeholder?: string;
  // }[];
  baseImagePublicId?: string;
  cloudinaryPublicId: string;
  isActive: boolean;

  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
