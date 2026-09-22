import mongoose, { Model, Schema, Types } from "mongoose";

export interface IGeneratorEvent {
  category: Types.ObjectId;

  name: string;

  slug: string;

  description?: string;

  thumbnail?: string;

  isActive: boolean;

  sortOrder: number;

  createdAt: Date;

  updatedAt: Date;
}

const generatorEventSchema = new Schema<IGeneratorEvent>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "GeneratorCategory",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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

generatorEventSchema.index(
  {
    category: 1,
    slug: 1,
  },
  {
    unique: true,
  },
);

generatorEventSchema.index({
  category: 1,
  isActive: 1,
  sortOrder: 1,
});

const GeneratorEvent: Model<IGeneratorEvent> =
  mongoose.models.GeneratorEvent ||
  mongoose.model<IGeneratorEvent>(
    "GeneratorEvent",
    generatorEventSchema,
  );

export default GeneratorEvent;