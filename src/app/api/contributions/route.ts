import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Contribution from "@/models/Contribution";
import User from "@/models/User";

// Get contributions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const year = searchParams.get("year");

    let query: any = {};

    // If user is not admin, only show their own contributions
    if ((session.user as any).role !== "admin") {
      query.userId = (session.user as any).id;
    } else if (userId) {
      query.userId = userId;
    }

    if (year) {
      query.year = parseInt(year);
    }

    const contributions = await Contribution.find(query)
      .populate("userId", "name email membershipNumber")
      .populate("recordedBy", "name")
      .sort({ paymentDate: -1 });

    return NextResponse.json(contributions);
  } catch (error: any) {
    console.error("Get contributions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get contributions" },
      { status: 500 }
    );
  }
}

// Create contribution (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, year, amount, paymentDate, paymentMethod, transactionId, notes } = body;

    if (!userId || !year || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: "User, year, amount, and payment method are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if contribution already exists for this user and year
    const existingContribution = await Contribution.findOne({ userId, year });
    if (existingContribution) {
      return NextResponse.json(
        { error: "Contribution already recorded for this user and year" },
        { status: 409 }
      );
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const contribution = await Contribution.create({
      userId,
      year,
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod,
      transactionId,
      notes,
      recordedBy: (session.user as any).id,
    });

    const populatedContribution = await Contribution.findById(contribution._id)
      .populate("userId", "name email membershipNumber")
      .populate("recordedBy", "name");

    return NextResponse.json(populatedContribution, { status: 201 });
  } catch (error: any) {
    console.error("Create contribution error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create contribution" },
      { status: 500 }
    );
  }
}
