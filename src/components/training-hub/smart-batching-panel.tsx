"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Loader2, Layers3, RefreshCw, Users, Globe2, CalendarDays, CheckCircle2, PiggyBank, ArrowRight } from "lucide-react";
import { fmtDate, courseTypeColor, flagForCountry } from "@/lib/training-hub-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BatchProposal, BatchRow } from "@/lib/types/training-hub";

export function SmartBatchingPanel({ batches }: { batches: BatchRow[] }) {
  const qc = useQueryClient();
  const [windowDays, setWindowDays] = useState(7);
  const proposals = useQuery({
    queryKey: ["proposals", windowDays],
    queryFn: async () => { const res = await fetch("/api/batches/auto", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ windowDays }) }); if (!res.ok) throw new Error("Failed"); return res.json() as Promise<{ proposals: BatchProposal[] }>; },
  });
  const createBatch = useMutation({
    mutationFn: async (p: BatchProposal) => {
      const res = await fetch("/api/batches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `${p.courseName} — ${fmtDate(p.earliestStart)} (${p.countries.join("+")})`, courseName: p.courseName, startDate: p.earliestStart, examDate: p.requests[0]?.examDate || null, status: "Proposed", notes: `Auto-detected batch (${p.countries.length} countries, ${p.totalCandidates} candidates).`, requestIds: p.requests.map((r) => r.id) }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { toast.success("Batch created"); qc.invalidateQueries({ queryKey: ["requests"] }); qc.invalidateQueries({ queryKey: ["stats"] }); qc.invalidateQueries({ queryKey: ["batches"] }); qc.invalidateQueries({ queryKey: ["proposals"] }); },
  });

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-red-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm"><PiggyBank className="h-5 w-5" /></div>
            <div><h3 className="text-base font-semibold text-slate-900">Smart Batching — the cost saver</h3><p className="mt-1 max-w-2xl text-sm text-slate-700">When 2+ country branches need the same course within ~{windowDays} days, we can run them as a single batch — sharing instructor & proctor fees.</p></div>
          </div>
          <div className="flex items-center gap-2">
            <select value={windowDays} onChange={(e) => setWindowDays(Number(e.target.value))} className="rounded-lg border border-blue-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700">
              <option value={3}>±3 days</option><option value={5}>±5 days</option><option value={7}>±7 days</option><option value={14}>±14 days</option>
            </select>
            <Button size="sm" variant="outline" onClick={() => proposals.refetch()} className="border-blue-300 text-blue-700 hover:bg-blue-50"><RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${proposals.isFetching ? "animate-spin" : ""}`} />Re-scan</Button>
          </div>
        </div>
      </div>

      {batches.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2"><Layers3 className="h-4 w-4 text-blue-700" /><h3 className="text-sm font-semibold text-slate-900">Active batches ({batches.length})</h3></div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{batches.map((b) => <ExistingBatchCard key={b.id} batch={b} />)}</div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-red-500" /><h3 className="text-sm font-semibold text-slate-900">Auto-detected batch proposals</h3></div>
          {proposals.data && <span className="text-xs text-slate-500">{proposals.data.proposals.length} found</span>}
        </div>
        {proposals.isLoading && <div className="flex items-center justify-center py-12 text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning…</div>}
        {proposals.data && proposals.data.proposals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center"><CheckCircle2 className="h-8 w-8 text-blue-500" /><p className="mt-2 text-sm font-medium text-slate-700">No batchable opportunities right now</p></div>
        )}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">{proposals.data?.proposals.map((p) => <BatchProposalCard key={p.key} proposal={p} onCreate={() => createBatch.mutate(p)} isCreating={createBatch.isPending} />)}</div>
      </div>
    </div>
  );
}

function BatchProposalCard({ proposal, onCreate, isCreating }: { proposal: BatchProposal; onCreate: () => void; isCreating: boolean }) {
  const isMulti = proposal.countries.length >= 2;
  return (
    <div className={`flex flex-col gap-3 rounded-xl border p-4 ${isMulti ? "border-blue-300 bg-gradient-to-br from-blue-50/80 to-white" : "border-slate-200 bg-slate-50/50"}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2"><h4 className="text-sm font-semibold text-slate-900">{proposal.courseName}</h4><span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${courseTypeColor(proposal.courseType)}`}>{proposal.courseType}</span></div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-600"><CalendarDays className="h-3 w-3" />{fmtDate(proposal.earliestStart)}{proposal.earliestStart !== proposal.latestStart && <><ArrowRight className="h-3 w-3" />{fmtDate(proposal.latestStart)}</>}</div>
        </div>
        {isMulti && <Badge className="bg-blue-700 text-white hover:bg-blue-700"><PiggyBank className="mr-1 h-3 w-3" />Saves fees</Badge>}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-white p-2 text-center"><div className="text-[10px] uppercase tracking-wider text-slate-500">Requests</div><div className="text-base font-bold text-slate-900">{proposal.requests.length}</div></div>
        <div className="rounded-lg bg-white p-2 text-center"><div className="text-[10px] uppercase tracking-wider text-slate-500">Countries</div><div className="text-base font-bold text-slate-900">{proposal.countries.length}</div></div>
        <div className="rounded-lg bg-white p-2 text-center"><div className="text-[10px] uppercase tracking-wider text-slate-500">Candidates</div><div className="text-base font-bold text-slate-900">{proposal.totalCandidates}</div></div>
      </div>
      <div className="flex flex-wrap gap-1.5">{proposal.countries.map((c) => <span key={c} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">{flagForCountry(c)} {c}</span>)}</div>
      <Button size="sm" onClick={onCreate} disabled={isCreating} className={`mt-1 w-full ${isMulti ? "bg-blue-700 hover:bg-blue-800" : "bg-slate-700 hover:bg-slate-800"}`}>{isCreating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Layers3 className="mr-1.5 h-3.5 w-3.5" />}Create batch</Button>
    </div>
  );
}

function ExistingBatchCard({ batch }: { batch: BatchRow }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const disband = useMutation({
    mutationFn: async (id: string) => { const res = await fetch(`/api/batches/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { toast.success("Batch disbanded"); qc.invalidateQueries({ queryKey: ["requests"] }); qc.invalidateQueries({ queryKey: ["stats"] }); qc.invalidateQueries({ queryKey: ["batches"] }); qc.invalidateQueries({ queryKey: ["proposals"] }); },
  });
  const statusColor = batch.status === "Confirmed" ? "bg-blue-100 text-blue-800 border-blue-200" : batch.status === "Scheduled" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-slate-100 text-slate-700 border-slate-200";
  const countryList = Array.from(new Set((batch.requests || []).map((r) => r.country).filter(Boolean)));
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2"><h4 className="text-sm font-semibold text-slate-900">{batch.name}</h4><span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${statusColor}`}>{batch.status}</span></div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600"><span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{fmtDate(batch.startDate)}</span><span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{batch.totalCandidates} candidates</span><span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" />{countryList.length} countries</span></div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">{countryList.map((c) => <span key={c} className="inline-flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-700">{flagForCountry(c)} {c}</span>)}</div>
      <div className="mt-3 flex items-center justify-between">
        <button onClick={() => setExpanded((v) => !v)} className="text-xs font-medium text-blue-700 hover:underline">{expanded ? "Hide requests" : `Show ${batch.requests?.length || 0} requests`}</button>
        <Button size="sm" variant="ghost" onClick={() => { if (confirm("Disband this batch?")) disband.mutate(batch.id); }} className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50">Disband</Button>
      </div>
      {expanded && <ul className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-[11px] text-slate-700">{(batch.requests || []).map((r) => <li key={r.id} className="flex items-center justify-between"><span>{flagForCountry(r.country)} {r.clientName} · {r.courseName}</span><span className="font-medium">{r.qtyCandidates} seats</span></li>)}</ul>}
    </div>
  );
}
