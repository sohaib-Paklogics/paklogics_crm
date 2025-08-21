// src/stores/stages.store.ts
import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { stageService } from "@/services/stage.service";
import type { Stage } from "@/types/lead";

type InsertAdjacentOpts = {
  where: "before" | "after";
  pivotId: string; // stage id to insert next to
  name: string; // new stage name
  color?: string; // optional color
  isDefault?: boolean; // optional
  active?: boolean; // optional
};

type StageState = {
  items: Stage[];
  isLoading: boolean;
  error: string | null;

  fetch: () => Promise<void>;

  // CRUD
  create: (p: Partial<Stage>) => Promise<Stage | null>;
  update: (id: string, p: Partial<Stage>) => Promise<Stage | null>;
  remove: (id: string, targetStageId?: string) => Promise<boolean>;
  reorder: (orderIds: string[]) => Promise<void>;

  // Adjacent insert (server calculates order)
  insertAdjacent: (opts: InsertAdjacentOpts) => Promise<Stage | null>;
  addBefore: (
    pivotId: string,
    name: string,
    color?: string
  ) => Promise<Stage | null>;
  addAfter: (
    pivotId: string,
    name: string,
    color?: string
  ) => Promise<Stage | null>;
};

const sortByOrder = (arr: Stage[]) =>
  arr.slice().sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

export const useStagesStore = create<StageState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null });

    const res = await callApi(() => stageService.list(), {
      showError: true,
      showSuccess: false,
    });

    // Support both {stages:[]} and [] responses
    const payload = (res?.data as any) ?? res;
    const stages = Array.isArray(payload) ? payload : payload?.stages ?? [];

    set({
      items: sortByOrder(stages),
      isLoading: false,
    });
  },

  create: async (p) => {
    const res = await callApi(() => stageService.create(p), {});
    if (res?.success) {
      await get().fetch();
      return res.data as Stage;
    }
    return null;
  },

  update: async (id, p) => {
    const res = await callApi(() => stageService.update(id, p), {});
    if (res?.success) {
      await get().fetch();
      return res.data as Stage;
    }
    return null;
  },

  remove: async (id, targetStageId) => {
    const res = await callApi(() => stageService.delete(id, targetStageId), {});
    if (res?.success) {
      await get().fetch();
      return true;
    }
    return false;
  },

  reorder: async (orderIds) => {
    await callApi(() => stageService.reorder(orderIds), {});
    await get().fetch();
  },

  // ----- Adjacent insert (server decides order) -----
  insertAdjacent: async ({
    where,
    pivotId,
    name,
    color,
    isDefault,
    active,
  }) => {
    // If we have no stages at all, just create a root stage instead
    if (!get().items.length) {
      const res = await callApi(
        () =>
          stageService.create({
            name,
            key: name
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "_")
              .replace(/^_+|_+$/g, ""),
            color: color || "#999999",
            isDefault: !!isDefault,
            active: active ?? true,
          }),
        {}
      );
      if (res?.success) {
        await get().fetch();
        return res.data as Stage;
      }
      return null;
    }

    const res = await callApi(
      () =>
        stageService.insertAdjacent({
          where,
          pivotId,
          name,
          color,
          isDefault,
          active,
        }),
      {}
    );

    if (res?.success) {
      await get().fetch(); // ensure UI reflects server-computed order
      return res.data as Stage;
    }
    return null;
  },

  addBefore: async (pivotId, name, color) =>
    get().insertAdjacent({ where: "before", pivotId, name, color }),

  addAfter: async (pivotId, name, color) =>
    get().insertAdjacent({ where: "after", pivotId, name, color }),
}));
