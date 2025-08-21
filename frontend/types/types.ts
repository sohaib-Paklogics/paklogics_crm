import { z } from "zod";

export type UserRole =
  | "superadmin"
  | "admin"
  | "business_developer"
  | "developer";

export type LeadStatus =
  | "new"
  | "interview_scheduled"
  | "test_assigned"
  | "completed";

export type LeadSource =
  | "website"
  | "referral"
  | "linkedin"
  | "job_board"
  | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  clientName: string;
  jobDescription: string;
  source: LeadSource;
  status: LeadStatus;
  assignedDeveloperId?: string;
  assignedDeveloper?: User;
  createdById: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  notes: Note[];
  history: HistoryEntry[];
}

export interface Attachment {
  id: string;
  leadId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedById: string;
  uploadedBy: User;
  uploadedAt: string;
}

export interface Note {
  id: string;
  leadId: string;
  content: string;
  createdById: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  leadId: string;
  action: string;
  details: string;
  userId: string;
  user: User;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  leadId: string;
  message: string;
  userId: string;
  user: User;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  leadId?: string;
  lead?: Lead;
  developerId?: string;
  developer?: User;
  createdById: string;
  createdBy: User;
  type: "interview" | "test" | "availability";
}

export interface AdminUser {
  id: string;
  _id?: string;
  username: string;
  email: string;
  password?: string; // optional because we won't send it to client
  role: "superadmin" | "admin" | "business_developer" | "developer";
  status: "active" | "inactive" | "suspended";
  permissions: string[];
  lastLogin?: string; // ISO date string
  loginHistory: string[]; // array of ISO date strings
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  meta?: Record<string, any>;
  twoFactorEnabled: boolean;
  twoFactorCode?: string;
  twoFactorCodeExpiresAt?: string;
  twoFactorCodeUsed?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Zod Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

export const leadSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  jobDescription: z
    .string()
    .min(10, "Job description must be at least 10 characters"),
  source: z.enum(["website", "referral", "linkedin", "job_board", "other"]),
  status: z.enum(["new", "interview_scheduled", "test_assigned", "completed"]),
  assignedDeveloperId: z.string().optional(),
});

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["superadmin", "admin", "business_developer", "developer"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const noteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
});

export const eventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  leadId: z.string().optional(),
  developerId: z.string().optional(),
  type: z.enum(["interview", "test", "availability"]),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type LeadFormData = z.infer<typeof leadSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type NoteFormData = z.infer<typeof noteSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
