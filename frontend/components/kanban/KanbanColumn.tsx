"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import { Droppable, type DroppableProps } from "react-beautiful-dnd";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Lead, Stage } from "@/types/lead";
import { StageActions } from "@/components/kanban/StageActions";
import LeadCard from "@/components/leadDetail/LeadCard";
import useAuthStore from "@/stores/auth.store";

// ---------------------------------------------
// Utilities
// ---------------------------------------------
const fallbackStageColorMap: Record<string, string> = {
  "new": "#2563EB",
  "follow up": "#F97316",
  "test task": "#FACC15",
  "interview scheduled": "#06C167",
  "technical interview": "#8B5CF6",
  "completed": "#22C55E",
};

const normalize = (s?: string) => (s ?? "").toLowerCase().trim().replace(/\s+/g, " ");

// simple hex -> [r,g,b]
function hexToRgb(hex?: string): [number, number, number] | null {
  if (!hex) return null;
  const m = hex.replace("#", "").match(/^([a-f\d]{3}|[a-f\d]{6})$/i);
  if (!m) return null;
  const v = m[1];
  const full =
    v.length === 3
      ? v
          .split("")
          .map((c) => c + c)
          .join("")
      : v;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// WCAG-like luminance
function relLum([r, g, b]: [number, number, number]) {
  const srgb = [r, g, b]
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

// choose white or black text against bg
function getContrastTextColor(hex?: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#FFFFFF";
  const L = relLum(rgb);
  // threshold ~0.5 balances most mid tones
  return L > 0.5 ? "#000000" : "#FFFFFF";
}

// React 18 StrictMode helper for RBD
function StrictModeDroppable(props: DroppableProps) {
  const enabledRef = useRef(false);
  const [, force] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      enabledRef.current = true;
      force();
    });
    return () => {
      cancelAnimationFrame(id);
      enabledRef.current = false;
    };
  }, []);

  if (!enabledRef.current) return null;
  return <Droppable {...props} />;
}

// ---------------------------------------------
// Types
// ---------------------------------------------
type StageActionsApi = {
  addBefore: (name: string, color?: string) => Promise<void>;
  addAfter: (name: string, color?: string) => Promise<void>;
  refresh?: () => Promise<void>;
};

interface KanbanColumnProps {
  stage: Stage; // expects stage.color?: string from API
  leads: Lead[];
  canDragDrop: boolean;
  isLoading?: boolean;
  allStages: Stage[];
  onChangeStatus: (lead: Lead, toStageId: string) => Promise<void>;
  stageActions: StageActionsApi;

  registerStageEl?: (stageId: string, el: HTMLDivElement | null) => void;
  registerListEl?: (stageId: string, el: HTMLDivElement | null) => void;
  registerFirstCardEl?: (stageId: string, leadId: string | null, el: HTMLElement | null) => void;
  highlightLeadId?: string | null;

  moveLoadingById?: Record<string, boolean>;
}

// ---------------------------------------------
// Component
// ---------------------------------------------
export default function KanbanColumn({
  stage,
  leads,
  canDragDrop,
  isLoading = false,
  allStages,
  onChangeStatus,
  stageActions,
  registerStageEl,
  registerListEl,
  registerFirstCardEl,
  highlightLeadId,
  moveLoadingById,
}: KanbanColumnProps) {
  const { user } = useAuthStore();

  // choose header color: API > fallback map > hard fallback
  const headerColor = stage.color || fallbackStageColorMap[normalize(stage.name)] || "#6E4318";

  const headerTextColor = getContrastTextColor(headerColor);

  // outer column ref (for horizontal positioning)
  const outerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    registerStageEl?.(String(stage._id), outerRef.current);
    return () => registerStageEl?.(String(stage._id), null);
  }, [registerStageEl, stage._id]);

  // inner scrollable list ref (for vertical scroll)
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    registerListEl?.(String(stage._id), listRef.current);
    return () => registerListEl?.(String(stage._id), null);
  }, [registerListEl, stage._id]);

  // register the FIRST card element (index 0)
  const firstLeadId = useMemo(() => (leads[0]?._id ? String(leads[0]._id) : null), [leads]);
  const firstCardRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    registerFirstCardEl?.(String(stage._id), firstLeadId, firstCardRef.current);
    return () => registerFirstCardEl?.(String(stage._id), null, null);
  }, [registerFirstCardEl, stage._id, firstLeadId]);

  return (
    <div className="space-y-4 flex-none w-[360px]" ref={outerRef} aria-label={`${stage.name} column`}>
      {/* Stage Header */}
      <div className="rounded-xl px-3 py-2 shadow-sm" style={{ backgroundColor: headerColor, color: headerTextColor }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex h-7 min-w-[28px] items-center justify-center rounded-full px-2 text-xs font-semibold",
              )}
              style={{
                backgroundColor: headerTextColor, // invert bubble bg for contrast
                color: headerColor, // bubble text matches the header color
              }}
              aria-live="polite"
              aria-busy={isLoading}
            >
              {isLoading ? <Skeleton className="h-3 w-6" /> : leads.length}
            </span>
            <h3 className="font-semibold" style={{ color: headerTextColor }}>
              {stage.name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {user?.role !== "developer" && <StageActions stage={stage} actions={stageActions} />}
          </div>
        </div>
      </div>

      {/* Droppable List */}
      <StrictModeDroppable droppableId={String(stage._id)}>
        {(provided, snapshot) => (
          <div
            ref={(el) => {
              provided.innerRef(el);
              listRef.current = el;
            }}
            {...provided.droppableProps}
            className={cn(
              "min-h-[500px] p-3 rounded-lg overflow-y-auto transition-colors border",
              snapshot.isDraggingOver ? "border-validiz-mustard bg-validiz-mustard/5" : "border-gray-200 bg-gray-50",
            )}
          >
            {leads.map((lead, index) => {
              const id = String(lead._id);
              const isHighlight = highlightLeadId === id;
              const isMoving = !!moveLoadingById?.[id];

              return (
                <div
                  key={id}
                  ref={(el) => {
                    if (index === 0) firstCardRef.current = el;
                  }}
                  className={cn(
                    "rounded-lg transition-all",
                    isHighlight && "ring-2 ring-validiz-mustard animate-[pulse_0.9s_ease-in-out_2]",
                    isMoving && "opacity-60 pointer-events-none",
                  )}
                >
                  <Link href={`/leads/${id}`} className="block">
                    <LeadCard
                      lead={lead}
                      index={index}
                      canDragDrop={canDragDrop}
                      allStages={allStages}
                      onChangeStatus={onChangeStatus}
                    />
                  </Link>
                </div>
              );
            })}

            {provided.placeholder}

            {!isLoading && leads.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <div className="text-center">
                  <p className="text-sm">No leads</p>
                  <p className="text-xs mt-1">{canDragDrop ? "Drag leads here" : "No leads in this stage"}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </StrictModeDroppable>
    </div>
  );
}
