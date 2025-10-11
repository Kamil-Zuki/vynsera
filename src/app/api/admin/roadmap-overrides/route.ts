import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const overridesPath = path.join(process.cwd(), "src", "data", "roadmap-overrides.json");

export async function GET() {
  if (!fs.existsSync(overridesPath)) return NextResponse.json({});
  const data = JSON.parse(fs.readFileSync(overridesPath, "utf-8"));
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const step = url.searchParams.get("step");
  const form = await request.formData();
  const overrideText = form.get("override") as string;

  let overrides: any = {};
  if (fs.existsSync(overridesPath)) {
    overrides = JSON.parse(fs.readFileSync(overridesPath, "utf-8"));
  }

  if (!step) {
    return NextResponse.json({ error: "Missing step param" }, { status: 400 });
  }

  try {
    const parsed = overrideText ? JSON.parse(overrideText) : null;
    if (parsed === null) {
      delete overrides[step];
    } else {
      overrides[step] = parsed;
    }
    fs.writeFileSync(overridesPath, JSON.stringify(overrides, null, 2), "utf-8");
    return NextResponse.redirect(new URL(`/admin/roadmap-review`, url.origin));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
