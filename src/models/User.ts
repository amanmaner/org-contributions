import mongoose, { Schema, models } from "mongoose";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  membershipNumber?: string;
  homeNumber?: string;
  phone?: string;
  address?: string;
  housingType?: "owned" | "rented";
  familyMembers?: number;
  spouseName?: string;
  childrenCount?: number;
  fatherName?: string;
  motherName?: string;
  occupation?: string;
  joiningDate: Date;
  isActive: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    membershipNumber: {
      type: String,
      sparse: true,
      unique: true,
    },
    homeNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    phone: String,
    address: String,
    housingType: {
      type: String,
      enum: ["owned", "rented"],
    },
    familyMembers: {
      type: Number,
      min: 0,
    },
    spouseName: String,
    childrenCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    fatherName: String,
    motherName: String,
    occupation: String,
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Generate membership number before saving
UserSchema.pre("save", async function (next) {
  if (!this.membershipNumber && this.isNew) {
    const count = await mongoose.models.User.countDocuments();
    this.membershipNumber = `MEM${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

const User = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
