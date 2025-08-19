// src/store/attachments.store.ts
import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { attachmentService } from "@/services/attachment.service";
import type { Attachment, PaginatedResponse } from "@/types/lead";

interface AttachmentsState {
  items: Attachment[];
  pagination: PaginatedResponse<Attachment>["pagination"] | null;
  isLoading: boolean;

  fetch: (leadId: string, page?: number, limit?: number) => Promise<void>;
  upload: (leadId: string, file: File) => Promise<Attachment | null>;
  remove: (attachmentId: string) => Promise<boolean>;
}

export const useAttachmentsStore = create<AttachmentsState>((set, get) => ({
  items: [],
  pagination: null,
  isLoading: false,

  fetch: async (leadId, page = 1, limit = 10) => {
    set({ isLoading: true });
    const res = await callApi(
      () => attachmentService.list(leadId, page, limit),
      { showSuccess: false }
    );
    if (res?.success) {
      set({
        items: res.data.data,
        pagination: res.data.pagination,
        isLoading: false,
      });
    } else set({ isLoading: false });
  },

  upload: async (leadId, file) => {
    const res = await callApi(() => attachmentService.upload(leadId, file), {
      successMessage: "File uploaded",
    });
    if (res?.success) {
      set({ items: [res.data, ...get().items] });
      return res.data;
    }
    return null;
  },

  remove: async (attachmentId) => {
    const res = await callApi(() => attachmentService.remove(attachmentId), {
      successMessage: "Attachment deleted",
    });
    if (res?.success) {
      set({ items: get().items.filter((a) => a._id !== attachmentId) });
      return true;
    }
    return false;
  },
}));
