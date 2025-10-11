import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/user/streak - Get user's streak data
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      streakData: user.streakData || {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakHistory: [],
      },
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 }
    );
  }
}

// POST /api/user/streak - Update user's streak
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Initialize streak data if it doesn't exist
    if (!user.streakData) {
      user.streakData = {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakHistory: [],
      };
    }

    if (!user.stats) {
      user.stats = {
        totalStepsCompleted: 0,
        totalResourcesViewed: 0,
        totalWatchlistItems: 0,
        totalDaysActive: 0,
        level: 1,
        xp: 0,
      };
    }

    const today = new Date().toISOString().split("T")[0];
    const lastActiveDate = user.streakData.lastActiveDate;

    // Check if already active today
    if (lastActiveDate === today) {
      return NextResponse.json({
        streakData: user.streakData,
        message: "Already active today",
      });
    }

    // Calculate if streak continues
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastActiveDate === yesterdayStr) {
      // Continue streak
      user.streakData.currentStreak += 1;
    } else if (lastActiveDate === null || lastActiveDate < yesterdayStr) {
      // Streak broken, start new
      user.streakData.currentStreak = 1;
    }

    // Update longest streak if necessary
    if (user.streakData.currentStreak > user.streakData.longestStreak) {
      user.streakData.longestStreak = user.streakData.currentStreak;
    }

    // Update last active date
    user.streakData.lastActiveDate = today;

    // Add to streak history
    if (!user.streakData.streakHistory.includes(today)) {
      user.streakData.streakHistory.push(today);
    }

    // Update total days active
    user.stats.totalDaysActive = user.streakData.streakHistory.length;

    // Update last active
    user.lastActive = new Date();

    await user.save();

    return NextResponse.json({
      streakData: user.streakData,
      stats: user.stats,
      message: "Streak updated",
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    return NextResponse.json(
      { error: "Failed to update streak" },
      { status: 500 }
    );
  }
}

