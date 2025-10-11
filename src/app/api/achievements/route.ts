import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import AchievementModel from "@/models/Achievement";
import type { Achievement } from "@/types";

// GET /api/achievements - Get all achievements with user's progress
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Fetch achievements from MongoDB
    const achievements = await AchievementModel.find({ active: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const session = await auth();

    if (!session?.user?.email) {
      // Return achievements without progress if not logged in
      return NextResponse.json({
        achievements: achievements.map((ach: any) => ({
          ...ach,
          _id: ach._id.toString(),
          unlocked: false,
          progress: 0,
        })),
      });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Merge achievements with user's unlocked status
    const userAchievements = user.achievements || [];
    const enrichedAchievements = achievements.map((ach: any) => {
      const userAch = userAchievements.find(
        (ua: any) => ua.achievementId === ach.id
      );

      if (userAch) {
        return {
          ...ach,
          _id: ach._id.toString(),
          unlocked: true,
          unlockedAt: userAch.unlockedAt,
          progress: userAch.progress || ach.requirement.value,
          maxProgress: ach.requirement.value,
        };
      }

      // Calculate progress for locked achievements
      const progress = calculateProgress(ach, user);

      return {
        ...ach,
        _id: ach._id.toString(),
        unlocked: false,
        progress,
        maxProgress: ach.requirement.value,
      };
    });

    return NextResponse.json({
      achievements: enrichedAchievements,
      stats: user.stats || {},
      streakData: user.streakData || {},
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

// POST /api/achievements/check - Check and award achievements
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Fetch achievements from MongoDB
    const achievements = await AchievementModel.find({ active: true }).lean();
    
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for newly unlocked achievements
    const newlyUnlocked: any[] = [];
    const userAchievements = user.achievements || [];
    const unlockedIds = new Set(
      userAchievements.map((ua: any) => ua.achievementId)
    );

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue;

      if (checkAchievementRequirement(achievement as any, user)) {
        // Award achievement
        user.achievements.push({
          achievementId: achievement.id,
          unlockedAt: new Date(),
          progress: achievement.requirement.value,
          maxProgress: achievement.requirement.value,
        });

        // Award XP
        if (achievement.reward?.xp) {
          user.stats.xp = (user.stats?.xp || 0) + achievement.reward.xp;
          
          // Check for level up (100 XP per level)
          const newLevel = Math.floor(user.stats.xp / 100) + 1;
          if (newLevel > (user.stats?.level || 1)) {
            user.stats.level = newLevel;
          }
        }

        newlyUnlocked.push({
          ...achievement,
          _id: (achievement as any)._id.toString(),
        });
      }
    }

    if (newlyUnlocked.length > 0) {
      await user.save();
    }

    return NextResponse.json({
      newAchievements: newlyUnlocked,
      totalUnlocked: user.achievements.length,
      stats: user.stats,
    });
  } catch (error) {
    console.error("Error checking achievements:", error);
    return NextResponse.json(
      { error: "Failed to check achievements" },
      { status: 500 }
    );
  }
}

// Helper function to calculate progress for an achievement
function calculateProgress(achievement: Achievement, user: any): number {
  const { type, value } = achievement.requirement;

  switch (type) {
    case "steps_completed":
      return user.completedSteps?.length || 0;
    case "days_streak":
      return user.streakData?.currentStreak || 0;
    case "resources_viewed":
      return user.stats?.totalResourcesViewed || 0;
    case "watchlist_items":
      return user.watchlist?.length || 0;
    case "total_days":
      return user.stats?.totalDaysActive || 0;
    case "custom":
      return 0;
    default:
      return 0;
  }
}

// Helper function to check if achievement requirement is met
function checkAchievementRequirement(achievement: Achievement, user: any): boolean {
  const { type, value } = achievement.requirement;

  switch (type) {
    case "steps_completed":
      return (user.completedSteps?.length || 0) >= value;
    case "days_streak":
      return (user.streakData?.currentStreak || 0) >= value;
    case "resources_viewed":
      return (user.stats?.totalResourcesViewed || 0) >= value;
    case "watchlist_items":
      return (user.watchlist?.length || 0) >= value;
    case "total_days":
      return (user.stats?.totalDaysActive || 0) >= value;
    case "custom":
      // Handle custom achievements (like "welcome")
      return achievement.id === "welcome";
    default:
      return false;
  }
}

