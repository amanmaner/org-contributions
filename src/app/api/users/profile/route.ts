import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { homeNumber, phone, address, housingType, fatherName, motherName, spouseName, childrenCount, occupation } = body;

    await connectDB();

    // Check for duplicate home numbers (warning only, not blocking)
    let duplicateWarning = null;
    if (homeNumber) {
      const normalizedHomeNumber = homeNumber.trim().toUpperCase();
      const existingUsers = await User.find({ 
        homeNumber: normalizedHomeNumber,
        _id: { $ne: (session.user as any).id }
      }).select("name membershipNumber");
      
      if (existingUsers.length > 0) {
        duplicateWarning = `Note: ${existingUsers.length} other member(s) are using home number "${normalizedHomeNumber}". If this is your family, that's correct. If not, please contact admin.`;
      }
    }

    // Build update object - only include fields that are actually provided
    const updateFields: Record<string, any> = {};
    if (homeNumber !== undefined) updateFields.homeNumber = homeNumber ? homeNumber.trim().toUpperCase() : "";
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (housingType !== undefined) updateFields.housingType = housingType || undefined;
    if (fatherName !== undefined) updateFields.fatherName = fatherName;
    if (motherName !== undefined) updateFields.motherName = motherName;
    if (spouseName !== undefined) updateFields.spouseName = spouseName;
    if (childrenCount !== undefined) updateFields.childrenCount = childrenCount;
    if (occupation !== undefined) updateFields.occupation = occupation;

    const updatedUser = await User.findByIdAndUpdate(
      (session.user as any).id,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      ...updatedUser.toObject(), 
      warning: duplicateWarning 
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
