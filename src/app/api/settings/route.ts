import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public settings (adminPassword is NEVER returned here)
const PUBLIC_SETTING_KEYS = new Set(["brandName","tagline","whatsappNumber","contactEmail","homeIntro"]);

export async function GET() {
  try {
    const rows = await db.setting.findMany();
    const settings: Record<string, string> = {};
    for (const r of rows) if (PUBLIC_SETTING_KEYS.has(r.key)) settings[r.key] = r.value;
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const entries = Object.entries(body || {}) as [string, string][];
    for (const [key, value] of entries) {
      await db.setting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      });
    }
    const rows = await db.setting.findMany();
    const settings: Record<string, string> = {};
    for (const r of rows) if (PUBLIC_SETTING_KEYS.has(r.key)) settings[r.key] = r.value;
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}
