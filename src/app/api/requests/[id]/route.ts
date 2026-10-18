import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const updated = await db.request.update({
      where: { id },
      data: {
        ...(body.clientName !== undefined && { clientName: body.clientName }),
        ...(body.courseName !== undefined && { courseName: body.courseName }),
        ...(body.country !== undefined && { country: body.country }),
        ...(body.startDate !== undefined && { startDate: body.startDate }),
        ...(body.examDate !== undefined && { examDate: body.examDate || null }),
        ...(body.qtyCandidates !== undefined && { qtyCandidates: Number(body.qtyCandidates) || 0 }),
        ...(body.instructorName !== undefined && { instructorName: body.instructorName || null }),
        ...(body.instructorAssigned !== undefined && { instructorAssigned: body.instructorAssigned || null }),
        ...(body.courseType !== undefined && { courseType: body.courseType }),
        ...(body.examDayType !== undefined && { examDayType: body.examDayType || null }),
        ...(body.certificateType !== undefined && { certificateType: body.certificateType || null }),
        ...(body.issueCertDueDate !== undefined && { issueCertDueDate: body.issueCertDueDate || null }),
        ...(body.bookingConfirmed !== undefined && { bookingConfirmed: body.bookingConfirmed }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
        ...(body.superNotes !== undefined && { superNotes: body.superNotes || null }),
        ...(body.status !== undefined && { status: body.status || null }),
        ...(body.isVisible !== undefined && { isVisible: body.isVisible }),
        ...(body.batchId !== undefined && { batchId: body.batchId || null }),
        ...(body.contactPhone !== undefined && { contactPhone: body.contactPhone || null }),
      },
      include: { batch: true },
    });
    return NextResponse.json({ request: updated });
  } catch (e) {
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await db.request.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}
