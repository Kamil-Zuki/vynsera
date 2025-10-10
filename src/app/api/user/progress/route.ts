import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Get user's progress
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ completedSteps: [] });
    }

    return NextResponse.json({ completedSteps: user.completedSteps || [] });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

// Update user's progress
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { completedSteps } = await request.json();

    if (!Array.isArray(completedSteps)) {
      return NextResponse.json(
        { error: "Invalid progress format" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: { completedSteps, lastActive: new Date() },
        $setOnInsert: {
          name: session.user.name,
          image: session.user.image,
          email: session.user.email,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      completedSteps: user.completedSteps,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
