import { Types } from "mongoose";

interface IEngagement {
  count: number;
  users: Types.ObjectId[];
}

export interface IPost {
  _id: Types.ObjectId;
  slug: string;

  image: string;
  caption: string;
  hashtags: string[];

  likes: IEngagement;
  shares: IEngagement;

  likedBy: Types.ObjectId[];
  sharedBy: Types.ObjectId[];

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
