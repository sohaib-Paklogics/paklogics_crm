// src/stores/testTasks.store.ts
import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { testTaskService } from "@/services/test-task.service";
import type { TestTask, Paginated, PaginationMeta } from "@/types/test-task";

type State = {
  itemsByLead: Record<string, TestTask[]>;
  paginationByLead: Record<string, PaginationMeta>;
  isLoading: boolean;
  error: string | null;

  list: (leadId: string) => TestTask[];

  fetch: (
    leadId: string,
    page?: number,
    limit?: number,
    params?: any
  ) => Promise<void>;

  // create can accept optional files without breaking existing callers
  create: (
    leadId: string,
    payload: Partial<TestTask>,
    files?: File[]
  ) => Promise<TestTask | null>;

  update: (id: string, patch: Partial<TestTask>) => Promise<TestTask | null>;
  assign: (id: string, assignedTo: string | null) => Promise<TestTask | null>;
  setStatus: (
    id: string,
    status: TestTask["status"]
  ) => Promise<TestTask | null>;
  review: (
    id: string,
    payload: {
      score?: number;
      resultNotes?: string;
      status?: "reviewed" | "passed" | "failed";
    }
  ) => Promise<TestTask | null>;
  remove: (leadId: string, id: string) => Promise<boolean>;

  // attachments
  addAttachments: (id: string, files: File[]) => Promise<TestTask | null>;
  removeAttachment: (
    id: string,
    attachmentId: string
  ) => Promise<TestTask | null>;
  replaceAttachment: (
    id: string,
    attachmentId: string,
    file: File
  ) => Promise<TestTask | null>;
};

function upsertIntoLeadList(s: State, updated: TestTask) {
  const leadId =
    typeof updated.leadId === "string"
      ? updated.leadId
      : (updated.leadId as any)?._id;
  if (!leadId) return {};
  const arr = s.itemsByLead[leadId] ?? [];
  const idx = arr.findIndex((t) => t._id === updated._id);
  const next =
    idx >= 0
      ? [...arr.slice(0, idx), updated, ...arr.slice(idx + 1)]
      : [updated, ...arr];
  return { itemsByLead: { ...s.itemsByLead, [leadId]: next } };
}

export const useTestTasksStore = create<State>((set, get) => ({
  itemsByLead: {},
  paginationByLead: {},
  isLoading: false,
  error: null,

  list: (leadId) => get().itemsByLead[leadId] ?? [],

  fetch: async (leadId, page = 1, limit = 20, params = {}) => {
    set({ isLoading: true, error: null });
    const res = await callApi(
      () => testTaskService.listByLead(leadId, { page, limit, ...params }),
      { showError: true, showSuccess: false }
    );
    set({ isLoading: false });

    if (res?.success) {
      const payload = res.data as Paginated<TestTask>;
      set((s) => ({
        itemsByLead: { ...s.itemsByLead, [leadId]: payload.data },
        paginationByLead: {
          ...s.paginationByLead,
          [leadId]: {
            page: payload.pagination.page,
            limit: payload.pagination.limit,
            total: payload.pagination.total,
            pages: payload.pagination.pages,
            hasNext: payload.pagination.hasNext,
            hasPrev: payload.pagination.hasPrev,
          },
        },
      }));
    }
  },

  create: async (leadId, payload, files) => {
    console.log("Creating test task with files:", files);
    console.log("Creating test task with payload:", payload);
    const res = await callApi(
      () =>
        files?.length
          ? testTaskService.createWithFiles(leadId, payload, files)
          : testTaskService.create(leadId, payload),
      {}
    );
    if (res?.success) {
      // refresh to respect pagination/sort
      await get().fetch(leadId, 1, get().paginationByLead[leadId]?.limit ?? 20);
      return res.data as TestTask;
    }
    return null;
  },

  update: async (id, patch) => {
    const res = await callApi(() => testTaskService.update(id, patch), {});
    if (!res?.success) return null;
    const updated = res.data as TestTask;
    set((s) => upsertIntoLeadList(s as State, updated) as any);
    return updated;
  },

  assign: async (id, assignedTo) => {
    const res = await callApi(() => testTaskService.assign(id, assignedTo), {});
    if (!res?.success) return null;
    const updated = res.data as TestTask;
    set((s) => upsertIntoLeadList(s as State, updated) as any);
    return updated;
  },

  setStatus: async (id, status) => {
    const res = await callApi(() => testTaskService.setStatus(id, status), {});
    if (!res?.success) return null;
    const updated = res.data as TestTask;
    set((s) => upsertIntoLeadList(s as State, updated) as any);
    return updated;
  },

  review: async (id, payload) => {
    const res = await callApi(() => testTaskService.review(id, payload), {});
    if (!res?.success) return null;
    const updated = res.data as TestTask;
    set((s) => upsertIntoLeadList(s as State, updated) as any);
    return updated;
  },

  remove: async (leadId, id) => {
    const res = await callApi(() => testTaskService.remove(id), {});
    if (!res?.success) return false;
    set((s) => {
      const arr = s.itemsByLead[leadId] ?? [];
      return {
        itemsByLead: {
          ...s.itemsByLead,
          [leadId]: arr.filter((t) => t._id !== id),
        },
      };
    });
    return true;
  },

  // ----- attachments -----
  addAttachments: async (id, files) => {
    const res = await callApi(
      () => testTaskService.addAttachments(id, files),
      {}
    );
    if (!res?.success) return null;
    const updated = res.data as TestTask;
    set((s) => upsertIntoLeadList(s as State, updated) as any);
    return updated;
  },
  removeAttachment: async (id, attachmentId) => {
    const res = await callApi(
      () => testTaskService.removeAttachment(id, attachmentId),
      {}
    );
    if (!res?.success) return null;
    const updated = res.data as TestTask;
    set((s) => upsertIntoLeadList(s as State, updated) as any);
    return updated;
  },
  replaceAttachment: async (id, attachmentId, file) => {
    const res = await callApi(
      () => testTaskService.replaceAttachment(id, attachmentId, file),
      {}
    );
    if (!res?.success) return null;
    const updated = res.data as TestTask;
    set((s) => upsertIntoLeadList(s as State, updated) as any);
    return updated;
  },
}));
