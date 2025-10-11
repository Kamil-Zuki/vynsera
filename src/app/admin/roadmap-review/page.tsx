"use server";
import fs from "fs";
import path from "path";
import React from "react";
import AdminSuggestedStep from "@/components/AdminSuggestedStep";

async function readJSON(p: string) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export default async function RoadmapAdminPage() {
  const base = path.join(process.cwd(), "src", "data");
  const roadmap = await readJSON(path.join(base, "roadmap.json"));
  const suggested = await readJSON(path.join(base, "roadmap-suggested-resources.json"));
  const overrides = (await readJSON(path.join(base, "roadmap-overrides.json"))) || {};

  return (
    <div style={{ padding: 20 }}>
      <h1>Roadmap – Suggested Resources Review</h1>
      <p>This page shows suggested resources per step and allows you to edit overrides. After saving, run the apply script to persist to DB.</p>
      {!roadmap && <div>No roadmap.json found</div>}
      {roadmap?.steps?.map((step: any) => (
        <section key={step.id} style={{ marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 12 }}>
          <h3>{step.id} — {step.title}</h3>
          <AdminSuggestedStep stepId={step.id} stepTitle={step.title} suggested={(suggested?.[step.id] || [])} />
        </section>
      ))}
    </div>
  );
}
