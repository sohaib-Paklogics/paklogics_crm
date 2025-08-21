import { AdminUser } from "./types";

// src/types/test-task.ts
export type TestTaskPriority = "low" | "medium" | "high";
export type TestTaskStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "reviewed"
  | "passed"
  | "failed"
  | "canceled";

export type TestTaskAttachment = {
  _id: string;
  publicId: string;
  url: string;
  originalFilename?: string;
  bytes?: number;
  resourceType?: string;
  format?: string;
  folder?: string;
  uploadedAt: string;
  uploadedBy?: AdminUser | string;
};

export interface TestTask {
  _id: string;
  leadId: string | { _id: string; clientName: string };
  title: string;
  description?: string | null;
  priority: TestTaskPriority;
  status: TestTaskStatus;
  dueDate?: string | null; // ISO string
  submittedAt?: string | null; // ISO
  reviewedAt?: string | null; // ISO
  score?: number | null;
  resultNotes?: string | null;
  assignedTo?:
    | { _id: string; username: string; email?: string; role?: string }
    | string
    | null;
  attachments?: TestTaskAttachment[];
  createdBy: string | { _id: string; username: string };
  updatedBy?: string | { _id: string; username: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: PaginationMeta;
}
