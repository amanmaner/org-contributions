import mongoose, { Schema, models } from "mongoose";

export interface IContribution {
  _id?: string;
  userId: mongoose.Types.ObjectId | string;
  year: number;
  amount: number;
  paymentDate: Date;
  paymentMethod: "cash" | "bank_transfer" | "cheque" | "online";
  transactionId?: string;
  notes?: string;
  recordedBy: mongoose.Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ContributionSchema = new Schema<IContribution>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: 2000,
      max: 2100,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "cheque", "online"],
      required: true,
    },
    transactionId: String,
    notes: String,
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for userId and year (one contribution per user per year)
ContributionSchema.index({ userId: 1, year: 1 }, { unique: true });

const Contribution =
  models.Contribution || mongoose.model<IContribution>("Contribution", ContributionSchema);

export default Contribution;
