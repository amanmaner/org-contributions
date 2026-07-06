import mongoose, { Schema, models } from "mongoose";

export interface IPaymentRequest {
  _id?: string;
  userId: mongoose.Types.ObjectId | string;
  year: number;
  amount: number;
  referenceNumber: string;
  status: "pending" | "confirmed" | "rejected";
  notes?: string;
  reviewedBy?: mongoose.Types.ObjectId | string;
  reviewedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentRequestSchema = new Schema<IPaymentRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    referenceNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
    notes: String,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

const PaymentRequest =
  models.PaymentRequest ||
  mongoose.model<IPaymentRequest>("PaymentRequest", PaymentRequestSchema);

export default PaymentRequest;
