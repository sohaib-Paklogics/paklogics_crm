"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Droppable, DroppableProps } from "react-beautiful-dnd";

import { Badge } from "@/components/ui/badge";

import type { Lead, Stage } from "@/types/lead";
import { StageActions } from "@/components/StageActions";
import ButtonLoader from "@/components/common/ButtonLoader";
import Link from "next/link";
import LeadCard from "./LeadCard";
import useAuthStore from "@/stores/auth-store";

/** React 18 StrictMode helper for react-beautiful-dnd */
function StrictModeDroppable(props: DroppableProps) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(raf);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props} />;
}

const KanbanColumn = ({
  stage,
  leads,
  canDragDrop,
  isLoading,
  allStages,
  onChangeStatus,
  stageActions,
  // NEW props for search focusing
  registerStageEl,
  registerListEl,
  registerFirstCardEl,
  highlightLeadId,
}: {
  stage: Stage;
  leads: Lead[];
  canDragDrop: boolean;
  isLoading: boolean;
  allStages: Stage[];
  onChangeStatus: (lead: Lead, toStageId: string) => Promise<void>;
  stageActions: {
    addBefore: (name: string, color?: string) => Promise<void>;
    addAfter: (name: string, color?: string) => Promise<void>;
    refresh?: () => Promise<void>;
  };
  registerStageEl?: (stageId: string, el: HTMLDivElement | null) => void;
  registerListEl?: (stageId: string, el: HTMLDivElement | null) => void;
  registerFirstCardEl?: (
    stageId: string,
    leadId: string | null,
    el: HTMLElement | null
  ) => void;
  highlightLeadId?: string | null;
}) => {
  const { user } = useAuthStore();

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

  // we only register the FIRST card element (index 0)
  const firstLeadId = useMemo(
    () => (leads[0]?._id ? String(leads[0]._id) : null),
    [leads]
  );
  const firstCardRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    registerFirstCardEl?.(String(stage._id), firstLeadId, firstCardRef.current);
    return () => registerFirstCardEl?.(String(stage._id), null, null);
  }, [registerFirstCardEl, stage._id, firstLeadId]);

  return (
    // ⬇️ fixed width + don’t shrink/grow in the row
    <div className="space-y-4 flex-none w-[360px]" ref={outerRef}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: stage.color }}
          />
          <h3 className="font-semibold text-validiz-brown">{stage.name}</h3>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
            {isLoading ? <ButtonLoader color="border-black" /> : leads.length}
          </Badge>
          {user?.role !== "developer" && (
            <StageActions stage={stage} actions={stageActions} />
          )}
        </div>
      </div>

      <StrictModeDroppable droppableId={String(stage._id)}>
        {(provided, snapshot) => (
          <div
            ref={(el) => {
              provided.innerRef(el);
              listRef.current = el;
            }}
            {...provided.droppableProps}
            className={`min-h-[500px] p-3 rounded-lg border-2 border-dashed transition-colors
              ${
                snapshot.isDraggingOver
                  ? "border-validiz-mustard bg-validiz-mustard/5"
                  : "border-gray-200 bg-gray-50"
              }
              overflow-y-auto`}
          >
            {leads.map((lead, index) => {
              const id = String(lead._id);
              const isHighlight = highlightLeadId === id;

              return (
                <div
                  key={id}
                  ref={(el) => {
                    // only capture first card element in this column
                    if (index === 0) {
                      firstCardRef.current = el;
                    }
                  }}
                  className={`rounded-lg ${
                    isHighlight
                      ? "ring-2 ring-validiz-mustard animate-[pulse_0.9s_ease-in-out_2]"
                      : ""
                  }`}
                >
                  <Link href={`/leads/${id}`}>
                    <LeadCard
                      key={id}
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
                  <p className="text-xs mt-1">
                    {canDragDrop ? "Drag leads here" : "No leads in this stage"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </StrictModeDroppable>
    </div>
  );
};

export default KanbanColumn;
