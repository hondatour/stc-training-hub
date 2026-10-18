import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const windowDays = Number(body?.windowDays ?? 7);
    const unbatched = await db.request.findMany({
      where: { batchId: null },
      orderBy: { startDate: "asc" },
    });

    const groups = new Map<string, typeof unbatched>();
    for (const r of unbatched) {
      if (!r.startDate) continue;
      const key = `${r.courseName.trim().toLowerCase()}__${r.courseType}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }

    const proposals = [];
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    for (const [key, reqs] of groups.entries()) {
      if (reqs.length < 2) continue;
      const sorted = [...reqs].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      const clusters = [];
      let current = [sorted[0]];
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(current[current.length - 1].startDate).getTime();
        const cur = new Date(sorted[i].startDate).getTime();
        if (Math.abs(cur - prev) <= windowDays * MS_PER_DAY) current.push(sorted[i]);
        else { clusters.push(current); current = [sorted[i]]; }
      }
      clusters.push(current);
      for (const cluster of clusters) {
        if (cluster.length < 2) continue;
        const countries = Array.from(new Set(cluster.map((r) => r.country).filter(Boolean)));
        const totalCandidates = cluster.reduce((s, r) => s + (r.qtyCandidates || 0), 0);
        proposals.push({
          key, courseName: cluster[0].courseName, courseType: cluster[0].courseType,
          requests: cluster, countries, totalCandidates,
          earliestStart: cluster[0].startDate, latestStart: cluster[cluster.length - 1].startDate,
        });
      }
    }
    proposals.sort((a, b) => {
      const aMulti = a.countries.length >= 2 ? 1 : 0;
      const bMulti = b.countries.length >= 2 ? 1 : 0;
      if (aMulti !== bMulti) return bMulti - aMulti;
      return b.totalCandidates - a.totalCandidates;
    });
    return NextResponse.json({ proposals, windowDays });
  } catch (e) {
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}
