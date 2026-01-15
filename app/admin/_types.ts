import type { Appointment, HospitalRecord, Invoice, PatientProfile } from "../dashboard/_model";

export type PortalData = {
  profile: PatientProfile | null;
  records: HospitalRecord[];
  appts: Appointment[];
  invoices: Invoice[];
};

export type AdminUser = {
  id: string; // patientId
  fullName: string;
  email: string;
  phone?: string;
  status: "Active" | "Suspended" | "Pending";
  createdISO: string;
  lastActiveISO?: string;
  portal: PortalData;
};
