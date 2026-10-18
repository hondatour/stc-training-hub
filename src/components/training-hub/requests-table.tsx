"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Trash2, Eye, EyeOff, Pencil, X, Loader2, Inbox, Layers3 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { fmtDate, courseTypeColor, bookingColor, flagForCountry } from "@/lib/training-hub-utils";
import type { RequestRow, CourseRow, CountryRow } from "@/lib/types/training-hub";

export function RequestsTable({ requests, courses, countries }: { requests: RequestRow[]; courses: CourseRow[]; countries: CountryRow[] }) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<RequestRow | null>(null);
  const filtered = useMemo(() => requests.filter((r) => {
    if (country !== "all" && r.country !== country) return false;
    if (status !== "all" && r.bookingConfirmed !== status) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = `${r.clientName} ${r.courseName} ${r.country} ${r.instructorName || ""} ${r.notes || ""} ${r.status || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [requests, query, country, status]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search requests…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          </div>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All countries</SelectItem>{countries.map((c) => <SelectItem key={c.id} value={c.name}>{c.flag} {c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="Confirmed">Confirmed</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="mt-2 text-xs text-slate-500">Showing <strong className="text-slate-700">{filtered.length}</strong> of {requests.length} requests</div>
      </div>
      <div className="max-h-[640px] overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center"><Inbox className="h-8 w-8 text-slate-300" /><p className="mt-2 text-sm text-slate-500">No requests found</p></div>
        ) : (
          <Table>
            <TableHeader><TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="w-[40px]">#</TableHead><TableHead>Client</TableHead><TableHead>Course</TableHead><TableHead>Country</TableHead>
              <TableHead>Start</TableHead><TableHead>Exam</TableHead><TableHead className="text-center">Seats</TableHead>
              <TableHead>Type</TableHead><TableHead>Booking</TableHead><TableHead>Batched</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((r, i) => (
                <TableRow key={r.id} className="text-sm">
                  <TableCell className="text-xs text-slate-400">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2"><div className="font-medium text-slate-900">{r.clientName}</div>{!r.isVisible && <EyeOff className="h-3 w-3 text-slate-400" />}</div>
                    {r.instructorName && <div className="text-xs text-slate-500">{r.instructorName}</div>}
                  </TableCell>
                  <TableCell className="font-medium">{r.courseName}</TableCell>
                  <TableCell><span className="inline-flex items-center gap-1">{flagForCountry(r.country)} {r.country}</span></TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{fmtDate(r.startDate)}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-slate-500">{fmtDate(r.examDate)}</TableCell>
                  <TableCell className="text-center font-semibold">{r.qtyCandidates}</TableCell>
                  <TableCell><span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${courseTypeColor(r.courseType)}`}>{r.courseType}</span></TableCell>
                  <TableCell><span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${bookingColor(r.bookingConfirmed)}`}>{r.bookingConfirmed}</span></TableCell>
                  <TableCell>{r.batchId ? <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700"><Layers3 className="h-3 w-3" />Batched</span> : <span className="text-xs text-slate-300">—</span>}</TableCell>
                  <TableCell className="text-right"><div className="inline-flex gap-1"><Button size="sm" variant="ghost" onClick={() => setEditing(r)} className="h-7 px-2 text-xs hover:bg-slate-100"><Pencil className="h-3 w-3" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {editing && <EditRequestDialog request={editing} courses={courses} countries={countries} onClose={() => setEditing(null)} />}
    </div>
  );
}

function EditRequestDialog({ request, courses, countries, onClose }: { request: RequestRow; courses: CourseRow[]; countries: CountryRow[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<RequestRow>({ ...request });
  const set = <K extends keyof RequestRow>(k: K, v: RequestRow[K]) => setForm((p) => ({ ...p, [k]: v }));
  const updateMutation = useMutation({
    mutationFn: async (data: RequestRow) => { const res = await fetch(`/api/requests/${data.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["requests"] }); qc.invalidateQueries({ queryKey: ["stats"] }); onClose(); },
    onError: (e) => toast.error(`Failed: ${(e as Error).message}`),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const res = await fetch(`/api/requests/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["requests"] }); qc.invalidateQueries({ queryKey: ["stats"] }); onClose(); },
    onError: (e) => toast.error(`Failed: ${(e as Error).message}`),
  });

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="h-4 w-4 text-blue-700" />Edit training request</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Client name"><Input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} /></Field>
          <Field label="Course"><Select value={form.courseName} onValueChange={(v) => set("courseName", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Country"><Select value={form.country} onValueChange={(v) => set("country", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{countries.map((c) => <SelectItem key={c.id} value={c.name}>{c.flag} {c.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Start date"><Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
          <Field label="Exam date"><Input type="date" value={form.examDate || ""} onChange={(e) => set("examDate", e.target.value)} /></Field>
          <Field label="Qty candidates"><Input type="number" min={1} value={form.qtyCandidates} onChange={(e) => set("qtyCandidates", Number(e.target.value))} /></Field>
          <Field label="Instructor name"><Input value={form.instructorName || ""} onChange={(e) => set("instructorName", e.target.value)} /></Field>
          <Field label="Instructor assigned"><Input value={form.instructorAssigned || ""} onChange={(e) => set("instructorAssigned", e.target.value)} /></Field>
          <Field label="Client WhatsApp"><Input value={form.contactPhone || ""} onChange={(e) => set("contactPhone", e.target.value)} /></Field>
          <Field label="Course type"><Select value={form.courseType} onValueChange={(v) => set("courseType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Classroom">Classroom</SelectItem><SelectItem value="Live">Live</SelectItem></SelectContent></Select></Field>
          <Field label="Exam day type"><Select value={form.examDayType || ""} onValueChange={(v) => set("examDayType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Live">Live</SelectItem><SelectItem value="Classroom">Classroom</SelectItem></SelectContent></Select></Field>
          <Field label="Certificate type"><Select value={form.certificateType || ""} onValueChange={(v) => set("certificateType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Classroom">Classroom</SelectItem><SelectItem value="Live">Live</SelectItem></SelectContent></Select></Field>
          <Field label="Issue cert due date"><Input value={form.issueCertDueDate || ""} onChange={(e) => set("issueCertDueDate", e.target.value)} /></Field>
          <Field label="Booking status"><Select value={form.bookingConfirmed} onValueChange={(v) => set("bookingConfirmed", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Confirmed">Confirmed</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem></SelectContent></Select></Field>
          <Field label="Workflow status"><Input value={form.status || ""} onChange={(e) => set("status", e.target.value)} placeholder="Sent Quotation / Done" /></Field>
          <div className="sm:col-span-2 lg:col-span-3"><Field label="Notes"><Textarea rows={2} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} /></Field></div>
          <div className="sm:col-span-2 lg:col-span-3"><Field label="Super notes (internal)"><Textarea rows={2} value={form.superNotes || ""} onChange={(e) => set("superNotes", e.target.value)} /></Field></div>
        </div>
        <div className="mt-2 flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <Switch id="visible-edit" checked={form.isVisible} onCheckedChange={(v) => set("isVisible", v)} />
          <Label htmlFor="visible-edit" className="flex items-center gap-1.5 text-sm">{form.isVisible ? <><Eye className="h-3.5 w-3.5 text-blue-700" />Visible in catalog</> : <><EyeOff className="h-3.5 w-3.5 text-slate-400" />Hidden from catalog</>}</Label>
        </div>
        <DialogFooter className="mt-4 flex !justify-between">
          <Button variant="ghost" onClick={() => { if (confirm("Delete this request?")) deleteMutation.mutate(request.id); }} disabled={deleteMutation.isPending || updateMutation.isPending} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">{deleteMutation.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}Delete</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}><X className="mr-1 h-4 w-4" />Cancel</Button>
            <Button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} className="bg-blue-700 hover:bg-blue-800">{updateMutation.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Save changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><Label className="text-xs font-medium text-slate-600">{label}</Label>{children}</div>;
}
