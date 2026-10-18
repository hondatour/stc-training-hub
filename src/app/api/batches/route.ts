import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const batches = await db.batch.findMany({
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
      include: { requests: true },
    });
    return NextResponse.json({ batches });
  } catch (e) {
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestIds: string[] = body.requestIds ?? [];
    const totalCandidates = await db.request
      .findMany({ where: { id: { in: requestIds } }, select: { qtyCandidates: true } })
      .then((rows) => rows.reduce((s, r) => s + (r.qtyCandidates || 0), 0));

    const created = await db.batch.create({
      data: {
        name: body.name?.trim() || `Batch — ${body.courseName}`,
        courseName: body.courseName?.trim() ?? "",
        startDate: body.startDate ?? "",
        examDate: body.examDate || null,
        status: body.status || "Proposed",
        notes: body.notes || null,
        totalCandidates,
      },
    });

    if (requestIds.length > 0) {
      await db.request.updateMany({ where: { id: { in: requestIds } }, data: { batchId: created.id } });
    }

    const withRequests = await db.batch.findUnique({ where: { id: created.id }, include: { requests: true } });
    return NextResponse.json({ batch: withRequests }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}
