import { Types } from "mongoose";

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

export interface IGeneratorCategory {
  _id?: Types.ObjectId;

  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;

  isActive: boolean;
  sortOrder: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface IGeneratorEvent {
  _id?: Types.ObjectId;

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

export interface IGeneratorTemplate {
  _id?: Types.ObjectId;

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

export interface GenerateTemplateImagePayload {
  userId: string;

  templateId: string;

  values: Record<string, unknown>;

  requestId: string;
}