import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import AchievementModel from "@/models/Achievement";

// Admin check - you can modify this to check for admin role in your user model
async function isAdmin(session: any) {
  // For now, just check if user is authenticated
  // TODO: Add proper admin role check
  return !!session?.user?.email;
}

// GET /api/admin/achievements - Get all achievements (including inactive)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const achievements = await AchievementModel.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      achievements: achievements.map(ach => ({
        ...ach,
        _id: ach._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

// POST /api/admin/achievements - Create new achievement
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    await connectDB();
    
    // Check if achievement with same ID already exists
    const existing = await AchievementModel.findOne({ id: body.id });
    if (existing) {
      return NextResponse.json(
        { error: "Achievement with this ID already exists" },
        { status: 400 }
      );
    }

    const achievement = await AchievementModel.create(body);

    return NextResponse.json({
      achievement: {
        ...achievement.toObject(),
        _id: achievement._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating achievement:", error);
    return NextResponse.json(
      { error: "Failed to create achievement" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/achievements?id=achievement-id - Update achievement
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const achievementId = searchParams.get("id");
    
    if (!achievementId) {
      return NextResponse.json(
        { error: "Achievement ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    await connectDB();
    
    const achievement = await AchievementModel.findOneAndUpdate(
      { id: achievementId },
      body,
      { new: true, runValidators: true }
    );

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      achievement: {
        ...achievement.toObject(),
        _id: achievement._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating achievement:", error);
    return NextResponse.json(
      { error: "Failed to update achievement" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/achievements?id=achievement-id - Delete achievement
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const achievementId = searchParams.get("id");
    
    if (!achievementId) {
      return NextResponse.json(
        { error: "Achievement ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Soft delete - just mark as inactive
    const achievement = await AchievementModel.findOneAndUpdate(
      { id: achievementId },
      { active: false },
      { new: true }
    );

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Achievement deactivated successfully",
      achievement: {
        ...achievement.toObject(),
        _id: achievement._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return NextResponse.json(
      { error: "Failed to delete achievement" },
      { status: 500 }
    );
  }
}

