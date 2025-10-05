import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { stageService } from "@/services/stage.service";
import type { Stage } from "@/types/lead";

type InsertAdjacentOpts = {
  where: "before" | "after";
  pivotId: string;
  name: string;
  color?: string;
  isDefault?: boolean;
  active?: boolean;
};

type StageState = {
  items: Stage[];

  // granular loading
  fetchLoading: boolean;
  insertAdjacentLoadingFor: string | null; // pivotId
  crudLoading: boolean;

  error: string | null;

  fetch: () => Promise<void>;

  create: (p: Partial<Stage>) => Promise<Stage | null>;
  update: (id: string, p: Partial<Stage>) => Promise<Stage | null>;
  remove: (id: string, targetStageId?: string) => Promise<boolean>;
  reorder: (orderIds: string[]) => Promise<void>;

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
  fetchLoading: false,
  insertAdjacentLoadingFor: null,
  crudLoading: false,
  error: null,

  fetch: async () => {
    set({ fetchLoading: true, error: null });

    const res = await callApi(() => stageService.list(), {
      showError: true,
      showSuccess: false,
    });

    const payload = (res?.data as any) ?? res;
    const stages = Array.isArray(payload) ? payload : payload?.stages ?? [];

    set({
      items: sortByOrder(stages),
      fetchLoading: false,
    });
  },

  create: async (p) => {
    set({ crudLoading: true });
    const res = await callApi(() => stageService.create(p), {});
    if (res?.success) {
      await get().fetch();
      set({ crudLoading: false });
      return res.data as Stage;
    }
    set({ crudLoading: false });
    return null;
  },

  update: async (id, p) => {
    set({ crudLoading: true });
    const res = await callApi(() => stageService.update(id, p), {});
    if (res?.success) {
      await get().fetch();
      set({ crudLoading: false });
      return res.data as Stage;
    }
    set({ crudLoading: false });
    return null;
  },

  remove: async (id, targetStageId) => {
    set({ crudLoading: true });
    const res = await callApi(() => stageService.delete(id, targetStageId), {});
    if (res?.success) {
      await get().fetch();
      set({ crudLoading: false });
      return true;
    }
    set({ crudLoading: false });
    return false;
  },

  reorder: async (orderIds) => {
    set({ crudLoading: true });
    await callApi(() => stageService.reorder(orderIds), {});
    await get().fetch();
    set({ crudLoading: false });
  },

  insertAdjacent: async ({
    where,
    pivotId,
    name,
    color,
    isDefault,
    active,
  }) => {
    // show loader only for the pivot being acted on
    set({ insertAdjacentLoadingFor: pivotId });

    // if no stages at all, create root
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
        set({ insertAdjacentLoadingFor: null });
        return res.data as Stage;
      }
      set({ insertAdjacentLoadingFor: null });
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
      await get().fetch();
      set({ insertAdjacentLoadingFor: null });
      return res.data as Stage;
    }
    set({ insertAdjacentLoadingFor: null });
    return null;
  },

  addBefore: async (pivotId, name, color) =>
    get().insertAdjacent({ where: "before", pivotId, name, color }),
  addAfter: async (pivotId, name, color) =>
    get().insertAdjacent({ where: "after", pivotId, name, color }),
}));
