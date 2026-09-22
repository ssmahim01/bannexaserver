import mongoose, { Model, Schema, Types } from "mongoose";

export type GeneratorFieldType =
  | "select"
  | "text"
  | "textarea"
  | "color";

export interface IGeneratorFieldOption {
  label: string;
  value: string;
}

export interface IGeneratorField {
  key: string;

  label: string;

  type: GeneratorFieldType;

  required: boolean;

  placeholder?: string;

  options?: IGeneratorFieldOption[];

  maxLength?: number;
}

export interface IGeneratorTemplate {
  category: Types.ObjectId;

  event: Types.ObjectId;

  name: string;

  slug: string;

  description?: string;

  thumbnail?: string;

  fields: IGeneratorField[];

  promptTemplate: string;

  negativePrompt?: string;

  isActive: boolean;

  sortOrder: number;

  createdAt: Date;

  updatedAt: Date;
}

const generatorFieldOptionSchema =
  new Schema<IGeneratorFieldOption>(
    {
      label: {
        type: String,
        required: true,
        trim: true,
      },

      value: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      _id: false,
    },
  );

const generatorFieldSchema =
  new Schema<IGeneratorField>(
    {
      key: {
        type: String,
        required: true,
        trim: true,
      },

      label: {
        type: String,
        required: true,
        trim: true,
      },

      type: {
        type: String,
        enum: [
          "select",
          "text",
          "textarea",
          "color",
        ],
        required: true,
      },

      required: {
        type: Boolean,
        default: false,
      },

      placeholder: {
        type: String,
        trim: true,
      },

      options: {
        type: [generatorFieldOptionSchema],
        default: undefined,
      },

      maxLength: {
        type: Number,
        min: 1,
        max: 2000,
      },
    },
    {
      _id: false,
    },
  );

const generatorTemplateSchema =
  new Schema<IGeneratorTemplate>(
    {
      category: {
        type: Schema.Types.ObjectId,
        ref: "GeneratorCategory",
        required: true,
        index: true,
      },

      event: {
        type: Schema.Types.ObjectId,
        ref: "GeneratorEvent",
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

      fields: {
        type: [generatorFieldSchema],
        default: [],
      },

      promptTemplate: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
      },

      negativePrompt: {
        type: String,
        trim: true,
        maxlength: 2000,
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

generatorTemplateSchema.index(
  {
    event: 1,
    slug: 1,
  },
  {
    unique: true,
  },
);

generatorTemplateSchema.index({
  event: 1,
  isActive: 1,
  sortOrder: 1,
});

const GeneratorTemplate: Model<IGeneratorTemplate> =
  mongoose.models.GeneratorTemplate ||
  mongoose.model<IGeneratorTemplate>(
    "GeneratorTemplate",
    generatorTemplateSchema,
  );

export default GeneratorTemplate;