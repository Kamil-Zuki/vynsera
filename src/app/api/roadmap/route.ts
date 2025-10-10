import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Roadmap from "@/models/Roadmap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // Get the first (and should be only) roadmap
    const roadmap = await Roadmap.findOne().lean();

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    return NextResponse.json(roadmap, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return NextResponse.json(
      { error: "Failed to fetch roadmap" },
      { status: 500 }
    );
  }
}
