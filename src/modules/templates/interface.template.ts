import { Types } from "mongoose";

export interface ITemplate {
  slug: string;
  title: string;
  previewImage: string;
  downloads: number;

  canvasWidth: number;
  canvasHeight: number;

  layers: {
    type: "image" | "text";
    x: number;
    y: number;
    width?: number;
    height?: number;
    fontSize?: number;
    color?: string;
    placeholder?: boolean;
  }[];
  baseImagePublicId: string;
  cloudinaryPublicId: string;

  post: Types.ObjectId;

  isActive: boolean;

  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
