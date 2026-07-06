import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Contribution from "@/models/Contribution";

function escapeCsvField(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(headers: string[], rows: any[][]): string {
  const headerLine = headers.map(escapeCsvField).join(",");
  const dataLines = rows.map((row) => row.map(escapeCsvField).join(","));
  return [headerLine, ...dataLines].join("\r\n");
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const year = searchParams.get("year");

    let csv = "";
    let filename = "report.csv";

    if (type === "members" || type === "active-members") {
      const query: any = { role: "user" };
      if (type === "active-members") query.isActive = true;

      const members = await User.find(query).select("-password").sort({ membershipNumber: 1 });

      const headers = [
        "Membership #", "Name", "Email", "Phone", "Home Number", "Address",
        "Housing Type", "Occupation", "Father Name", "Mother Name",
        "Spouse Name", "Children Count", "Joining Date", "Status", "Approval Status",
      ];

      const rows = members.map((m) => [
        m.membershipNumber,
        m.name,
        m.email,
        m.phone,
        m.homeNumber,
        m.address,
        m.housingType,
        m.occupation,
        m.fatherName,
        m.motherName,
        m.spouseName,
        m.childrenCount,
        m.joiningDate ? new Date(m.joiningDate).toLocaleDateString("en-IN") : "",
        m.isActive ? "Active" : "Inactive",
        m.approvalStatus,
      ]);

      csv = buildCsv(headers, rows);
      filename = type === "active-members" ? "active-members.csv" : "all-members.csv";
    } else if (type === "contributions") {
      const query: any = {};
      if (year) query.year = parseInt(year);

      const contributions = await Contribution.find(query)
        .populate("userId", "name email membershipNumber homeNumber phone")
        .populate("recordedBy", "name")
        .sort({ paymentDate: -1 });

      const headers = [
        "Membership #", "Member Name", "Email", "Phone", "Home #",
        "Year", "Amount", "Payment Date", "Payment Method", "Transaction ID",
        "Notes", "Recorded By",
      ];

      const rows = contributions.map((c) => {
        const user = c.userId as any;
        return [
          user?.membershipNumber,
          user?.name,
          user?.email,
          user?.phone,
          user?.homeNumber,
          c.year,
          c.amount,
          new Date(c.paymentDate).toLocaleDateString("en-IN"),
          c.paymentMethod?.replace("_", " "),
          c.transactionId,
          c.notes,
          (c.recordedBy as any)?.name,
        ];
      });

      csv = buildCsv(headers, rows);
      filename = year ? `contributions-${year}.csv` : "all-contributions.csv";
    } else if (type === "unpaid") {
      const targetYear = year ? parseInt(year) : new Date().getFullYear();

      const paidUserIds = (
        await Contribution.find({ year: targetYear }).distinct("userId")
      ).map(String);

      const unpaidMembers = await User.find({
        role: "user",
        isActive: true,
        _id: { $nin: paidUserIds },
      })
        .select("-password")
        .sort({ membershipNumber: 1 });

      const headers = [
        "Membership #", "Name", "Email", "Phone", "Home Number", "Address", "Joining Date",
      ];

      const rows = unpaidMembers.map((m) => [
        m.membershipNumber,
        m.name,
        m.email,
        m.phone,
        m.homeNumber,
        m.address,
        m.joiningDate ? new Date(m.joiningDate).toLocaleDateString("en-IN") : "",
      ]);

      csv = buildCsv(headers, rows);
      filename = `unpaid-members-${targetYear}.csv`;
    } else {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
