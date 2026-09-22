import mongoose, { Model, Schema } from "mongoose";

export interface IGeneratorCategory {
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const generatorCategorySchema = new Schema<IGeneratorCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    thumbnail: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

generatorCategorySchema.index({
  isActive: 1,
  sortOrder: 1,
});

const GeneratorCategory: Model<IGeneratorCategory> =
  mongoose.models.GeneratorCategory ||
  mongoose.model<IGeneratorCategory>(
    "GeneratorCategory",
    generatorCategorySchema,
  );

export default GeneratorCategory;