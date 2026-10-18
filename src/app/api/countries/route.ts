import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const countries = await db.country.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ countries });
  } catch (e) {
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await db.country.create({
      data: {
        name: body.name?.trim() ?? "",
        code: body.code?.trim() ?? "",
        flag: body.flag || null,
      },
    });
    return NextResponse.json({ country: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}
