// src/services/test-task.service.ts
import api from "@/lib/api";
import type { ApiResponse } from "@/types/lead"; // or "@/types/api"
import type { TestTask, Paginated } from "@/types/test-task";

type ListQuery = Partial<{
  page: number;
  limit: number;
  search: string;
  status:
    | "all"
    | "pending"
    | "in_progress"
    | "submitted"
    | "reviewed"
    | "passed"
    | "failed"
    | "canceled";
  priority: "low" | "medium" | "high";
  assignedTo: string;
  dateFrom: string;
  dateTo: string;
  dueBefore: string;
  dueAfter: string;
  sort: "createdAt" | "updatedAt" | "dueDate" | "score";
  order: "asc" | "desc";
}>;

// ----- helpers -----
function toFormData(
  payload: Record<string, any>,
  files?: File[] | null,
  filesField = "attachments"
) {
  const fd = new FormData();
  Object.entries(payload || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    // stringify objects/arrays
    if (typeof v === "object" && !(v instanceof Blob)) {
      fd.append(k, JSON.stringify(v));
    } else {
      fd.append(k, v as any);
    }
  });
  if (files?.length) {
    files.forEach((f) => fd.append(filesField, f));
  }
  return fd;
}

export const testTaskService = {
  // Lead-scoped
  listByLead: async (
    leadId: string,
    params: ListQuery = {}
  ): Promise<ApiResponse<Paginated<TestTask>>> => {
    const { data } = await api.get(`/leads/${leadId}/test-tasks`, { params });
    return data;
  },

  // Create (JSON only – no files)
  create: async (
    leadId: string,
    payload: Partial<TestTask>
  ): Promise<ApiResponse<TestTask>> => {
    const { data } = await api.post(`/leads/${leadId}/test-tasks`, payload);
    return data;
  },

  // Create with attachments (multipart)
  createWithFiles: async (
    leadId: string,
    payload: Partial<TestTask>,
    files: File[]
  ): Promise<ApiResponse<TestTask>> => {
    const form = toFormData(payload, files, "attachments");
    const { data } = await api.post(`/leads/${leadId}/test-tasks`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Single
  getOne: async (id: string): Promise<ApiResponse<TestTask>> => {
    const { data } = await api.get(`/test-tasks/${id}`);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<TestTask>
  ): Promise<ApiResponse<TestTask>> => {
    const { data } = await api.patch(`/test-tasks/${id}`, payload);
    return data;
  },

  assign: async (
    id: string,
    assignedTo: string | null
  ): Promise<ApiResponse<TestTask>> => {
    const { data } = await api.patch(`/test-tasks/${id}/assign`, {
      assignedTo,
    });
    return data;
  },

  setStatus: async (
    id: string,
    status: TestTask["status"]
  ): Promise<ApiResponse<TestTask>> => {
    const { data } = await api.patch(`/test-tasks/${id}/status`, { status });
    return data;
  },

  review: async (
    id: string,
    payload: {
      score?: number;
      resultNotes?: string;
      status?: "reviewed" | "passed" | "failed";
    }
  ): Promise<ApiResponse<TestTask>> => {
    const { data } = await api.patch(`/test-tasks/${id}/review`, payload);
    return data;
  },

  remove: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/test-tasks/${id}`);
    return data;
  },

  // ----- Attachments -----

  addAttachments: async (
    id: string,
    files: File[]
  ): Promise<ApiResponse<TestTask>> => {
    const fd = toFormData({}, files, "attachments");
    const { data } = await api.post(`/test-tasks/${id}/attachments`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  removeAttachment: async (
    id: string,
    attachmentId: string
  ): Promise<ApiResponse<TestTask>> => {
    const { data } = await api.delete(
      `/test-tasks/${id}/attachments/${attachmentId}`
    );
    return data;
  },

  replaceAttachment: async (
    id: string,
    attachmentId: string,
    file: File
  ): Promise<ApiResponse<TestTask>> => {
    const fd = toFormData({}, [file], "attachment"); // single file field name
    const { data } = await api.put(
      `/test-tasks/${id}/attachments/${attachmentId}`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },
};
