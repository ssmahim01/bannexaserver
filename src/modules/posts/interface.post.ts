import { Types } from "mongoose";

export interface IPost {
  slug: string;

  image: string;
  caption: string;
  hashtags: string[];

  likes: number;
  shares: number;

  isTrending?: boolean;
  isPopular?: boolean;

  category: Types.ObjectId;

  author: {
    name: string;
    avatar?: string | null;
  };

  createdBy?: Types.ObjectId;

  isActive: boolean;
}