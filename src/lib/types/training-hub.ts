export interface RequestRow {
  id: string; clientName: string; courseName: string; country: string;
  startDate: string; examDate: string | null; qtyCandidates: number;
  instructorName: string | null; instructorAssigned: string | null;
  courseType: string; examDayType: string | null; certificateType: string | null;
  issueCertDueDate: string | null; bookingConfirmed: string;
  notes: string | null; superNotes: string | null; status: string | null;
  isVisible: boolean; batchId: string | null; contactPhone: string | null;
  createdAt: string; updatedAt: string; batch?: BatchRow | null;
}
export interface BatchRow {
  id: string; name: string; courseName: string; startDate: string;
  examDate: string | null; status: string; totalCandidates: number;
  notes: string | null; requests?: RequestRow[];
}
export interface CourseRow { id: string; name: string; category: string | null; description: string | null; duration: string | null; }
export interface CountryRow { id: string; name: string; code: string; flag: string | null; }
export interface Settings { brandName?: string; tagline?: string; whatsappNumber?: string; contactEmail?: string; homeIntro?: string; adminPassword?: string; }
export interface Stats {
  total: number; pending: number; confirmed: number; batched: number;
  batches: number; courses: number; countries: number; totalCandidates: number;
  byCountry: { country: string; count: number; candidates: number }[];
  byCourse: { course: string; count: number; candidates: number }[];
}
export interface BatchProposal {
  key: string; courseName: string; courseType: string;
  requests: RequestRow[]; countries: string[]; totalCandidates: number;
  earliestStart: string; latestStart: string;
}
