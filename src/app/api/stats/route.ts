import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [total, pending, confirmed, batched, batches, courses, countries] = await Promise.all([
      db.request.count(),
      db.request.count({ where: { bookingConfirmed: "Pending" } }),
      db.request.count({ where: { bookingConfirmed: "Confirmed" } }),
      db.request.count({ where: { batchId: { not: null } } }),
      db.batch.count(),
      db.course.count(),
      db.country.count(),
    ]);
    const candidates = await db.request.aggregate({ _sum: { qtyCandidates: true } });
    const byCountryRaw = await db.request.groupBy({ by: ["country"], _count: { _all: true }, _sum: { qtyCandidates: true } });
    const byCourseRaw = await db.request.groupBy({ by: ["courseName"], _count: { _all: true }, _sum: { qtyCandidates: true } });
    return NextResponse.json({
      total, pending, confirmed, batched, batches, courses, countries,
      totalCandidates: candidates._sum.qtyCandidates ?? 0,
      byCountry: byCountryRaw.map((r) => ({ country: r.country, count: r._count._all, candidates: r._sum.qtyCandidates ?? 0 })).sort((a, b) => b.count - a.count),
      byCourse: byCourseRaw.map((r) => ({ course: r.courseName, count: r._count._all, candidates: r._sum.qtyCandidates ?? 0 })).sort((a, b) => b.count - a.count),
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}
