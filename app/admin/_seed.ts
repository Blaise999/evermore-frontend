import type { AdminUser, PortalData } from "./_types";
import type { Appointment, HospitalRecord, Invoice, PatientProfile, RecordType } from "../dashboard/_model";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function makeId(prefix: string = "EM") {
  const rand = Math.floor(Math.random() * 1_000_000_000);
  return `${prefix}-${rand.toString(36).toUpperCase()}`;
}

function isoDaysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

const FIRST = [
  "Amelia",
  "Noah",
  "Ivy",
  "Oliver",
  "Maya",
  "Ethan",
  "Lina",
  "Leo",
  "Ariana",
  "Mason",
  "Zara",
  "Lucas",
  "Nia",
  "Theo",
  "Ruby",
  "Elijah",
];

const LAST = [
  "Cole",
  "Bennett",
  "Hughes",
  "Foster",
  "Gray",
  "Brooks",
  "Reed",
  "Hayes",
  "Campbell",
  "Ward",
  "Mitchell",
  "Turner",
  "Morgan",
  "Bailey",
  "Fisher",
  "Watson",
];

const DEPTS = ["Cardiology", "Dermatology", "General Medicine", "Radiology", "Orthopaedics", "ENT", "Women’s Health", "Neurology"];
const FACILITIES = ["Evermore London — Canary Wharf", "Evermore London — Harley St", "Evermore London — Stratford", "Evermore London — Paddington"];
const CLINICIANS = ["Dr. M. Khan", "Dr. E. Wallace", "Dr. L. Patel", "Dr. H. Meyer", "Dr. A. Bennett", "Dr. T. O’Neill"];

const RECORD_TITLES: Record<RecordType, string[]> = {
  lab: ["Complete Blood Count", "HbA1c", "Lipid Panel", "Thyroid Function", "Renal Profile"],
  imaging: ["Chest X‑ray", "Abdominal Ultrasound", "MRI Brain", "CT Chest", "Knee X‑ray"],
  visit: ["Consultation Summary", "Follow‑up Note", "Discharge Summary", "Specialist Review"],
  prescription: ["Prescription — Antibiotics", "Prescription — Pain relief", "Prescription — Antihistamine", "Prescription — BP meds"],
  document: ["Referral Letter", "Medical Certificate", "Insurance Claim Form", "Consent Form"],
};

export function makeProfile(opts?: Partial<PatientProfile>): PatientProfile {
  const fullName = opts?.fullName ?? `${pick(FIRST)} ${pick(LAST)}`;
  const patientId = opts?.patientId ?? makeId("EM");
  const email = opts?.email ?? `${fullName.toLowerCase().replace(/\s+/g, ".")}@mail.example`;
  const phone = opts?.phone ?? `+44 7${Math.floor(100000000 + Math.random() * 899999999)}`;

  return {
    fullName,
    patientId,
    email,
    phone,
    eligibilityScore: opts?.eligibilityScore ?? Math.floor(520 + Math.random() * 420),
    careflexLimit: opts?.careflexLimit ?? Math.floor(400 + Math.random() * 2600),
    careflexTermsDays: opts?.careflexTermsDays ?? pick([7, 14, 21, 30]),
  };
}

export function seedPortalData(profile?: PatientProfile, sizes?: { records?: number; appts?: number; invoices?: number }): PortalData {
  const p = profile ?? makeProfile();
  const recN = sizes?.records ?? pick([0, 6, 10, 14]);
  const apptN = sizes?.appts ?? pick([0, 1, 2, 3]);
  const invN = sizes?.invoices ?? pick([0, 1, 2, 4]);

  const records: HospitalRecord[] = Array.from({ length: recN }).map((_, i) => {
    const type = pick(["lab", "imaging", "visit", "prescription", "document"] as const);
    const title = pick(RECORD_TITLES[type]);
    const facility = pick(FACILITIES);
    const clinician = pick(CLINICIANS);
    const status = pick(["Ready", "Processing", "Flagged", "Synced"] as const);
    const dateISO = isoDaysFromNow(-pick([1, 2, 3, 5, 8, 13, 21, 34]));
    const tags = uniq(
      [pick(["Routine", "Urgent", "Follow‑up", "Private", "GP Ref"]).toString(), pick(["Cardio", "Ortho", "Neuro", "ENT", "Derm"])].filter(Boolean)
    );
    return {
      id: `rec_${p.patientId}_${i}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      title,
      subtitle: type === "lab" ? "Sample processed" : undefined,
      facility,
      clinician,
      dateISO,
      status,
      summary:
        type === "prescription"
          ? "Prescription has been issued. Please follow the dosage instructions and book a review if symptoms persist."
          : "Results have been uploaded to your portal. If you have questions, message your care team for clarification.",
      notes:
        status === "Flagged"
          ? ["Clinician review required before release.", "If symptoms worsen, seek urgent care."]
          : ["Keep this for your records."],
      tags,
    };
  });

  const appts: Appointment[] = Array.from({ length: apptN }).map((_, i) => {
    const inFuture = Math.random() > 0.45;
    const startISO = isoDaysFromNow(inFuture ? pick([2, 5, 7, 10, 14, 21]) : -pick([1, 2, 4, 7, 12]));
    const dept = pick(DEPTS);
    const clinician = pick(CLINICIANS);
    const facility = pick(FACILITIES);
    const status = inFuture ? "Confirmed" : pick(["Completed", "Cancelled"] as const);
    return {
      id: `appt_${p.patientId}_${i}_${Math.random().toString(36).slice(2, 7)}`,
      dept,
      clinician,
      facility,
      startISO,
      status,
      prepChecklist: ["Bring a photo ID", "Arrive 10 minutes early", "Carry previous reports if any"],
    };
  });

  const invoices: Invoice[] = Array.from({ length: invN }).map((_, i) => {
    const createdISO = isoDaysFromNow(-pick([1, 4, 6, 12, 20, 34]));
    const dueISO = isoDaysFromNow(pick([3, 7, 10, 14, 21]));
    const status = pick(["Unpaid", "Pending approval", "Paid", "Overdue", "Waived"] as const);
    const amount = Math.floor(50 + Math.random() * 950);
    return {
      id: `inv_${p.patientId}_${pad(i + 1)}`,
      title: pick([
        "Consultation fee",
        "Imaging charges",
        "Lab tests",
        "Pharmacy",
        "CareFlex settlement",
        "Specialist review",
      ]),
      amount,
      status,
      createdISO,
      dueISO,
    };
  });

  return { profile: p, records, appts, invoices };
}

export function seedUsers(
  count: number,
  sizes?: { records?: number; appts?: number; invoices?: number }
): AdminUser[] {
  const n = Math.max(0, Math.min(500, Math.floor(count)));
  const users: AdminUser[] = [];
  for (let i = 0; i < n; i++) {
    const profile = makeProfile();
    const portal = seedPortalData(profile, sizes);
    users.push({
      id: profile.patientId,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      status: pick(["Active", "Active", "Active", "Pending", "Suspended"] as const),
      createdISO: isoDaysFromNow(-pick([1, 4, 8, 14, 30, 90])),
      lastActiveISO: isoDaysFromNow(-pick([0, 1, 2, 3, 7, 14, 28])),
      portal,
    });
  }
  return users;
}
