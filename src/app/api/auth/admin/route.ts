import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/auth/admin
// Body: { password: string }
// Returns { ok: true, hash } if password matches the stored adminPassword setting.
// Default password: "Adminstc2026" (user-set)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const submitted = (body?.password || "").toString();
    const setting = await db.setting.findUnique({ where: { key: "adminPassword" } });
    const stored = setting?.value || "Adminstc2026";
    if (submitted === stored) {
      const hash = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      return NextResponse.json({ ok: true, hash });
    }
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  } catch (e) {
    console.error("POST /api/auth/admin error:", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
