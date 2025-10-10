import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Resource from "@/models/Resource";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const level = searchParams.get("level");
    const category = searchParams.get("category");
    const isFree = searchParams.get("isFree");

    // Build MongoDB query
    const filter: any = {};

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { titleKorean: { $regex: query, $options: "i" } },
        { descriptionKorean: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ];
    }

    if (level) {
      filter.level = level;
    }

    if (category) {
      filter.category = category;
    }

    if (isFree !== null && isFree !== undefined) {
      filter.isFree = isFree === "true";
    }

    const resources = await Resource.find(filter)
      .sort({ rating: -1, title: 1 })
      .lean();

    return NextResponse.json(resources, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
