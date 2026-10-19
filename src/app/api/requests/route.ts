import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Fields safe to expose to clients on the public catalog.
// Notes are HIDDEN from clients (admin-only) — per user request.
const PUBLIC_FIELDS = ["id","clientName","courseName","country","startDate","examDate","qtyCandidates","courseType"] as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const course = searchParams.get("course");
    const status = searchParams.get("status");
    const visible = searchParams.get("visible");
    const batched = searchParams.get("batched");
    const where: Record<string, unknown> = {};
    if (country && country !== "all") where.country = country;
    if (course && course !== "all") where.courseName = course;
    if (status && status !== "all") where.bookingConfirmed = status;
    if (visible === "true") where.isVisible = true;
    if (batched === "true") where.batchId = { not: null };
    if (batched === "false") where.batchId = null;

    const requests = await db.request.findMany({
      where,
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
      include: visible === "true" ? undefined : { batch: true },
    });

    if (visible === "true") {
      const publicRequests = requests.map((r) => {
        const safe: Record<string, unknown> = {};
        for (const key of PUBLIC_FIELDS) safe[key] = (r as Record<string, unknown>)[key];
        return safe;
      });
      return NextResponse.json({ requests: publicRequests });
    }
    return NextResponse.json({ requests });
  } catch (e) {
    console.error("GET /api/requests error:", e);
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await db.request.create({
      data: {
        clientName: body.clientName?.trim() ?? "",
        courseName: body.courseName?.trim() ?? "",
        country: body.country?.trim() ?? "",
        startDate: body.startDate ?? "",
        examDate: body.examDate || null,
        qtyCandidates: Number(body.qtyCandidates) || 1,
        instructorName: body.instructorName || null,
        instructorAssigned: body.instructorAssigned || null,
        courseType: body.courseType || "Classroom",
        examDayType: body.examDayType || null,
        certificateType: body.certificateType || null,
        issueCertDueDate: body.issueCertDueDate || null,
        bookingConfirmed: body.bookingConfirmed || "Pending",
        notes: body.notes || null,
        superNotes: body.superNotes || null,
        status: body.status || null,
        isVisible: body.isVisible ?? true,
        contactPhone: body.contactPhone || null,
      },
    });
    return NextResponse.json({ request: created }, { status: 201 });
  } catch (e) {
    console.error("POST /api/requests error:", e);
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}
