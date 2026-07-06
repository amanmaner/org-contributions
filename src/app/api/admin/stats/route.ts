import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Contribution from "@/models/Contribution";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const totalMembers = await User.countDocuments({ role: "user" });
    const activeMembers = await User.countDocuments({ role: "user", isActive: true });
    
    const contributionsAgg = await Contribution.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const currentYear = new Date().getFullYear();
    const currentYearContributions = await Contribution.countDocuments({ year: currentYear });

    const stats = {
      totalMembers,
      activeMembers,
      totalContributions: contributionsAgg[0]?.count || 0,
      totalAmount: contributionsAgg[0]?.totalAmount || 0,
      currentYearContributions,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get stats" },
      { status: 500 }
    );
  }
}
