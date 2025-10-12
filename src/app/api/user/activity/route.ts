import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/user/activity - Get user's daily activity data
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

    // Generate activity data for the last year
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const activityData: Array<{ date: string; count: number; level: number }> = [];
    const activityMap = new Map<string, any>(
      (user.dailyActivity || []).map((activity: any) => [activity.date as string, activity])
    );

    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const activity = activityMap.get(dateStr) as any;

      const totalCount = (activity && typeof activity.totalCount === 'number') ? activity.totalCount : 0;

      activityData.push({
        date: dateStr,
        count: totalCount,
        level: getActivityLevel(totalCount),
      });
    }

    return NextResponse.json({
      activityData,
      streakData: user.streakData || {},
      stats: user.stats || {},
    });
  } catch (error) {
    console.error("Error fetching activity data:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity data" },
      { status: 500 }
    );
  }
}

// POST /api/user/activity - Track user activity
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activityType, count = 1 } = await request.json();

    if (!activityType) {
      return NextResponse.json(
        { error: "Activity type is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Track daily activity
    await trackDailyActivity(user, activityType, count);

    // Update relevant stats based on activity type
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

    switch (activityType) {
      case "step_completed":
        user.stats.totalStepsCompleted = (user.stats.totalStepsCompleted || 0) + count;
        break;
      case "resource_viewed":
        user.stats.totalResourcesViewed = (user.stats.totalResourcesViewed || 0) + count;
        break;
      case "watchlist_item_added":
        user.stats.totalWatchlistItems = (user.stats.totalWatchlistItems || 0) + count;
        break;
    }

    await user.save();

    return NextResponse.json({
      message: "Activity tracked successfully",
      stats: user.stats,
    });
  } catch (error) {
    console.error("Error tracking activity:", error);
    return NextResponse.json(
      { error: "Failed to track activity" },
      { status: 500 }
    );
  }
}

// Helper function to get activity level
function getActivityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

// Helper function to track daily activity
async function trackDailyActivity(user: any, activityType: string, count: number) {
  const today = new Date().toISOString().split("T")[0];
  
  // Initialize daily activity if it doesn't exist
  if (!user.dailyActivity) {
    user.dailyActivity = [];
  }

  let todayActivity = user.dailyActivity.find((activity: any) => activity.date === today);
  
  if (!todayActivity) {
    todayActivity = {
      date: today,
      activities: [],
      totalCount: 0,
    };
    user.dailyActivity.push(todayActivity);
  }

  // Add or update activity
  const existingActivity = todayActivity.activities.find(
    (activity: any) => activity.type === activityType
  );

  if (existingActivity) {
    existingActivity.count += count;
  } else {
    todayActivity.activities.push({
      type: activityType,
      count,
      timestamp: new Date(),
    });
  }

  todayActivity.totalCount += count;
}

