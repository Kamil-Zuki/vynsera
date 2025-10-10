import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Get user's watchlist
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ watchlist: [] });
    }

    return NextResponse.json({ watchlist: user.watchlist || [] });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

// Update user's watchlist
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { watchlist } = await request.json();

    if (!Array.isArray(watchlist)) {
      return NextResponse.json(
        { error: "Invalid watchlist format" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: { watchlist, lastActive: new Date() },
        $setOnInsert: {
          name: session.user.name,
          image: session.user.image,
          email: session.user.email,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, watchlist: user.watchlist });
  } catch (error) {
    console.error("Error updating watchlist:", error);
    return NextResponse.json(
      { error: "Failed to update watchlist" },
      { status: 500 }
    );
  }
}
