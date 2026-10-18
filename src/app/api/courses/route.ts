import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const courses = await db.course.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
    return NextResponse.json({ courses });
  } catch (e) {
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await db.course.create({
      data: {
        name: body.name?.trim() ?? "",
        category: body.category || null,
        description: body.description || null,
        duration: body.duration || null,
      },
    });
    return NextResponse.json({ course: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}
