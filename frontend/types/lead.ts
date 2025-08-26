// src/types/lead.ts
export type LeadStage =
  | "new"
  | "interview_scheduled"
  | "test_assigned"
  | "completed";

export type LeadLifecycleStatus = "active" | "delayed" | "deleted";

export type LeadSource =
  | "all"
  | "website"
  | "referral"
  | "linkedin"
  | "job_board"
  | "other";

export interface Stage {
  _id: string;
  name: string;
  key: string;
  color: string;
  order: number;
  isDefault: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  _id: string;
  clientName: string;
  jobDescription: string;
  source: LeadSource;
  assignedTo?: {
    _id: string;
    username: string;
    email: string;
    role: string;
    status: string;
  } | null;

  // 👇 separated
  stage?: Stage | string; // pipeline stage
  status: {
    value: LeadLifecycleStatus;
    changedBy?: { _id: string; username: string } | string;
    changedAt?: string;
  };

  notes?: string | null;
  createdBy: { _id: string; username: string; email: string };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  statusCode?: number;
}

export type LeadFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | LeadStage;
  stage?: string;

  source?: LeadSource;
  assignedTo?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: "createdAt" | "updatedAt";
  order?: "asc" | "desc";
};

export interface Attachment {
  _id: string;
  leadId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: { _id: string; username: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface LeadNote {
  _id: string;
  leadId: string;
  userId: { _id: string; username: string; email: string };
  text: string;
  createdAt: string;
}

export interface LeadEvent {
  _id: string;
  leadId: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  title: string;
  startTime: string;
  endTime: string;
  timezone: string;
  description?: string;
  status:
    | "scheduled"
    | "in-progress"
    | "completed"
    | "canceled"
    | "rescheduled";
  createdAt: string;
  updatedAt: string;
}

export type KanbanBoard = {
  new: PaginatedResponse<Lead>;
  interview_scheduled: PaginatedResponse<Lead>;
  test_assigned: PaginatedResponse<Lead>;
  completed: PaginatedResponse<Lead>;
};
