import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import PaymentRequest from "@/models/PaymentRequest";
import Contribution from "@/models/Contribution";

// GET: admin gets all requests; user gets their own
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query: any = {};

    if ((session.user as any).role !== "admin") {
      query.userId = (session.user as any).id;
    }

    if (status) {
      query.status = status;
    }

    const requests = await PaymentRequest.find(query)
      .populate("userId", "name email membershipNumber")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}

// POST: user submits a payment request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { year, amount, referenceNumber, notes } = body;

    if (!year || !amount || !referenceNumber) {
      return NextResponse.json(
        { error: "Year, amount, and reference number are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    await connectDB();

    const paymentRequest = await PaymentRequest.create({
      userId: (session.user as any).id,
      year,
      amount,
      referenceNumber,
      notes,
      status: "pending",
    });

    return NextResponse.json(paymentRequest, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}

// PUT: admin confirms or rejects a payment request
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, action } = body;

    if (!requestId || !["confirm", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await connectDB();

    const paymentReq = await PaymentRequest.findById(requestId);
    if (!paymentReq) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
    }

    if (paymentReq.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 409 });
    }

    if (action === "confirm") {
      // Check if contribution already exists for this user+year
      const existing = await Contribution.findOne({
        userId: paymentReq.userId,
        year: paymentReq.year,
      });

      if (existing) {
        return NextResponse.json(
          { error: "A contribution for this member and year already exists" },
          { status: 409 }
        );
      }

      await Contribution.create({
        userId: paymentReq.userId,
        year: paymentReq.year,
        amount: paymentReq.amount,
        paymentDate: new Date(),
        paymentMethod: "online",
        transactionId: paymentReq.referenceNumber,
        notes: `QR Payment - Ref: ${paymentReq.referenceNumber}`,
        recordedBy: (session.user as any).id,
      });
    }

    const updated = await PaymentRequest.findByIdAndUpdate(
      requestId,
      {
        status: action === "confirm" ? "confirmed" : "rejected",
        reviewedBy: (session.user as any).id,
        reviewedAt: new Date(),
      },
      { new: true }
    )
      .populate("userId", "name email membershipNumber")
      .populate("reviewedBy", "name");

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
