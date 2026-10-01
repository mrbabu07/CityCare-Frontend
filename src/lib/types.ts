export type Role = "CITIZEN" | "STAFF" | "ADMIN";
export type Status =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "CLOSED";
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}
export interface Department {
  id: string;
  name: string;
  description?: string;
  categories?: Category[];
}
export interface Category {
  id: string;
  name: string;
  departmentId: string;
  department?: Department;
  slaHours: number;
}
export interface Attachment {
  id: string;
  url: string;
  type: string;
  uploadedById?: string;
}
export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  address: string;
  createdAt: string;
  updatedAt: string;
  slaDueAt?: string;
  citizenId: string;
  assignedToId?: string;
  category: Category;
  department: Department;
  citizen?: User;
  assignedTo?: User;
  attachments?: Attachment[];
  statusHistory?: {
    id: string;
    toStatus: Status;
    note?: string;
    createdAt: string;
  }[];
  feedback?: { rating: number; comment?: string };
}
export interface PageInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface ComplaintList {
  complaints: Complaint[];
  pagination: PageInfo;
}
export interface Payment {
  id: string;
  complaintId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
}
export interface Audit {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor: User;
}
export interface Stats {
  totals: {
    complaints: number;
    citizens: number;
    staff: number;
    users: number;
    overdueComplaints: number | unknown[];
  };
  resolutionRate: string;
  complaintsByStatus: { status: Status; _count: number }[];
}
export interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: { path: string; message: string }[];
}
export const roleHome: Record<Role, string> = {
  CITIZEN: "/dashboard",
  STAFF: "/staff",
  ADMIN: "/admin",
};
export const statuses: Status[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
  "CLOSED",
];
export function label(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (c) => c.toUpperCase());
}
export function date(value?: string) {
  return value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Dhaka",
      }).format(new Date(value))
    : "Not set";
}
