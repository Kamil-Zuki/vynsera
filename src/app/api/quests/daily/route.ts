import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import dailyQuestsData from "@/data/daily-quests.json";
import type { DailyQuest } from "@/types";

// GET /api/quests/daily - Get today's daily quests
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

    // Generate today's quests
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const quests: DailyQuest[] = dailyQuestsData.map((questTemplate: any) => {
      // Check if quest is weekend-only
      const isWeekend = [0, 6].includes(new Date().getDay()); // Sunday = 0, Saturday = 6
      if (questTemplate.requirement.additionalConditions?.weekendOnly && !isWeekend) {
        return null;
      }

      // Calculate progress based on user's current stats
      const progress = calculateQuestProgress(questTemplate, user);
      const isCompleted = progress >= questTemplate.requirement.value;
      
      // Check if reward has been claimed today
      const today = new Date().toISOString().split("T")[0];
      const claimedToday = user.claimedRewards?.some((reward: any) => 
        reward.questId === questTemplate.id && reward.date === today
      );

      return {
        ...questTemplate,
        expiresAt: tomorrow.toISOString(),
        isCompleted,
        progress: Math.min(progress, questTemplate.requirement.value),
        maxProgress: questTemplate.requirement.value,
        reward: {
          ...questTemplate.reward,
          claimed: claimedToday || false,
        },
      };
    }).filter(Boolean) as DailyQuest[];

    return NextResponse.json({
      quests,
      date: today,
    });
  } catch (error) {
    console.error("Error fetching daily quests:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily quests" },
      { status: 500 }
    );
  }
}

// POST /api/quests/claim - Claim quest reward
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questId } = await request.json();

    if (!questId) {
      return NextResponse.json(
        { error: "Quest ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the quest template
    const questTemplate = dailyQuestsData.find((q: any) => q.id === questId);
    if (!questTemplate) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Check if quest is completed
    const progress = calculateQuestProgress(questTemplate, user);
    if (progress < questTemplate.requirement.value) {
      return NextResponse.json(
        { error: "Quest not completed" },
        { status: 400 }
      );
    }

    // Award rewards
    if (questTemplate.reward.xp) {
      user.stats.xp = (user.stats?.xp || 0) + questTemplate.reward.xp;
      
      // Check for level up
      const newLevel = Math.floor(user.stats.xp / 100) + 1;
      if (newLevel > (user.stats?.level || 1)) {
        user.stats.level = newLevel;
      }
    }

    // Track daily activity
    await trackDailyActivity(user, "quest_completed", 1);

    await user.save();

    return NextResponse.json({
      message: "Reward claimed successfully",
      rewards: questTemplate.reward,
      newLevel: user.stats.level,
      newXP: user.stats.xp,
    });
  } catch (error) {
    console.error("Error claiming quest reward:", error);
    return NextResponse.json(
      { error: "Failed to claim reward" },
      { status: 500 }
    );
  }
}

// Helper function to calculate quest progress
function calculateQuestProgress(questTemplate: any, user: any): number {
  const { type, value } = questTemplate.requirement;

  switch (type) {
    case "steps_completed":
      return user.completedSteps?.length || 0;
    case "resources_viewed":
      return user.stats?.totalResourcesViewed || 0;
    case "watchlist_items":
      return user.watchlist?.length || 0;
    case "days_active":
      return user.stats?.totalDaysActive || 0;
    case "custom":
      // Handle custom quests with multiple requirements
      if (questTemplate.requirement.additionalConditions?.stepsRequired) {
        const stepsProgress = Math.min(
          user.completedSteps?.length || 0,
          questTemplate.requirement.additionalConditions.stepsRequired
        );
        const resourcesProgress = questTemplate.requirement.additionalConditions.resourcesRequired
          ? Math.min(
              user.stats?.totalResourcesViewed || 0,
              questTemplate.requirement.additionalConditions.resourcesRequired
            )
          : 1;
        
        return Math.min(stepsProgress, resourcesProgress);
      }
      return 1; // Default for custom quests
    default:
      return 0;
  }
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

