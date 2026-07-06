import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Initialize admin user if not exists
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@organization.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin already exists" },
        { status: 200 }
      );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    return NextResponse.json(
      { message: "Admin user created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Init admin error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize admin" },
      { status: 500 }
    );
  }
}

// Get current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById((session.user as any).id).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get user" },
      { status: 500 }
    );
  }
}
