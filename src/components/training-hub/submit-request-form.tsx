"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CourseRow, CountryRow } from "@/lib/types/training-hub";

interface FormState {
  clientName: string; courseName: string; country: string;
  startDate: string; examDate: string; qtyCandidates: string;
  instructorName: string; instructorAssigned: string; contactPhone: string;
  courseType: string; examDayType: string; certificateType: string;
  issueCertDueDate: string; bookingConfirmed: string; notes: string;
  status: string; isVisible: boolean;
}
const initialState: FormState = {
  clientName: "", courseName: "", country: "", startDate: "", examDate: "",
  qtyCandidates: "1", instructorName: "", instructorAssigned: "", contactPhone: "",
  courseType: "Classroom", examDayType: "Live", certificateType: "Classroom",
  issueCertDueDate: "One week after exam", bookingConfirmed: "Pending",
  notes: "", status: "", isVisible: true,
};

export function SubmitRequestForm({ courses, countries }: { courses: CourseRow[]; countries: CountryRow[] }) {
  const [form, setForm] = useState<FormState>(initialState);
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: FormState) => {
      const res = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { toast.success("Request submitted"); setForm(initialState); qc.invalidateQueries({ queryKey: ["requests"] }); qc.invalidateQueries({ queryKey: ["stats"] }); },
    onError: (err) => toast.error(`Failed: ${(err as Error).message}`),
  });
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));
  const submit = () => {
    if (!form.clientName.trim() || !form.courseName.trim() || !form.country.trim()) { toast.error("Client name, course and country are required"); return; }
    if (!form.startDate) { toast.error("Start date is required"); return; }
    mutation.mutate(form);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4"><h3 className="text-base font-semibold text-slate-900">Submit a new training request</h3><p className="mt-0.5 text-xs text-slate-500">Add a request from any country branch.</p></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Client name *"><Input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="Enter client name" /></Field>
        <Field label="Course *"><Select value={form.courseName} onValueChange={(v) => set("courseName", v)}><SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger><SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Country *"><Select value={form.country} onValueChange={(v) => set("country", v)}><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger><SelectContent>{countries.map((c) => <SelectItem key={c.id} value={c.name}>{c.flag} {c.name}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Start date *"><Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
        <Field label="Exam date"><Input type="date" value={form.examDate} onChange={(e) => set("examDate", e.target.value)} /></Field>
        <Field label="Qty candidates"><Input type="number" min={1} value={form.qtyCandidates} onChange={(e) => set("qtyCandidates", e.target.value)} /></Field>
        <Field label="Instructor name"><Input value={form.instructorName} onChange={(e) => set("instructorName", e.target.value)} placeholder="Enter instructor name" /></Field>
        <Field label="Instructor assigned"><Input value={form.instructorAssigned} onChange={(e) => set("instructorAssigned", e.target.value)} placeholder="Enter assigned instructor" /></Field>
        <Field label="Client WhatsApp"><Input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="e.g., +62 812-xxxx" /></Field>
        <Field label="Course type"><Select value={form.courseType} onValueChange={(v) => set("courseType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Classroom">Classroom</SelectItem><SelectItem value="Live">Live</SelectItem></SelectContent></Select></Field>
        <Field label="Exam day type"><Select value={form.examDayType} onValueChange={(v) => set("examDayType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Live">Live</SelectItem><SelectItem value="Classroom">Classroom</SelectItem></SelectContent></Select></Field>
        <Field label="Certificate type"><Select value={form.certificateType} onValueChange={(v) => set("certificateType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Classroom">Classroom</SelectItem><SelectItem value="Live">Live</SelectItem></SelectContent></Select></Field>
        <Field label="Issue cert due date"><Input value={form.issueCertDueDate} onChange={(e) => set("issueCertDueDate", e.target.value)} placeholder="One week after exam" /></Field>
        <Field label="Booking status"><Select value={form.bookingConfirmed} onValueChange={(v) => set("bookingConfirmed", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Confirmed">Confirmed</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem></SelectContent></Select></Field>
        <Field label="Workflow status"><Input value={form.status} onChange={(e) => set("status", e.target.value)} placeholder="Sent Quotation / Done" /></Field>
        <div className="sm:col-span-2 lg:col-span-3"><Field label="Notes"><Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Anything worth noting" /></Field></div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2.5">
          <Switch id="visible" checked={form.isVisible} onCheckedChange={(v) => set("isVisible", v)} />
          <Label htmlFor="visible" className="flex items-center gap-1.5 text-sm text-slate-700">
            {form.isVisible ? <><Eye className="h-3.5 w-3.5 text-blue-700" />Visible in catalog</> : <><EyeOff className="h-3.5 w-3.5 text-slate-400" />Internal only</>}
          </Label>
        </div>
        <Button onClick={submit} disabled={mutation.isPending} className="bg-blue-700 hover:bg-blue-800">
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          {mutation.isPending ? "Submitting…" : "Submit request"}
        </Button>
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><Label className="text-xs font-medium text-slate-600">{label}</Label>{children}</div>;
}
