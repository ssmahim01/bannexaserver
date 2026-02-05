import { Schema, model } from "mongoose";
import { IPaymentMethod } from "./interface.method";
import { PAYMENT_METHOD_STATUS, PAYMENT_METHOD_TYPES } from "./constant.method";

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    type: {
      type: String,
      enum: Object.values(PAYMENT_METHOD_TYPES),
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    accountName: {
      type: String,
      trim: true,
    },

    bankName: {
      type: String,
      trim: true,
    },

    branchName: {
      type: String,
      trim: true,
    },

    routingNumber: {
      type: String,
      trim: true,
    },

    instructions: {
      type: String,
      trim: true,
    },

    logo: {
      type: String,
    },

    status: {
      type: String,
      enum: Object.values(PAYMENT_METHOD_STATUS),
      default: PAYMENT_METHOD_STATUS.ACTIVE,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

paymentMethodSchema.pre("save", async function (next) {
  if (this.isActive) {
    await model("PaymentMethod").updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false },
    );
  }
  next();
});

export const PaymentMethod = model<IPaymentMethod>(
  "PaymentMethod",
  paymentMethodSchema,
);
