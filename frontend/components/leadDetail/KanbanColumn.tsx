"use client";

import { useEffect, useState } from "react";
import { Droppable, DroppableProps } from "react-beautiful-dnd";

import { Badge } from "@/components/ui/badge";

import type { Lead, Stage } from "@/types/lead";
import { StageActions } from "@/components/StageActions";
import ButtonLoader from "@/components/common/ButtonLoader";
import Link from "next/link";
import LeadCard from "./LeadCard";

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
}) => {
  return (
    // ⬇️ fixed width + don’t shrink/grow in the row
    <div className="space-y-4 flex-none w-[360px]">
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
          <StageActions stage={stage} actions={stageActions} />
        </div>
      </div>

      <StrictModeDroppable droppableId={String(stage._id)}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[500px] p-3 rounded-lg border-2 border-dashed transition-colors
              ${
                snapshot.isDraggingOver
                  ? "border-validiz-mustard bg-validiz-mustard/5"
                  : "border-gray-200 bg-gray-50"
              }
              overflow-y-auto`} // optional: vertical scroll within the column
          >
            {leads.map((lead, index) => (
              <Link href={`/leads/${lead._id}`} key={String(lead._id)}>
                <LeadCard
                  key={String(lead._id)}
                  lead={lead}
                  index={index}
                  canDragDrop={canDragDrop}
                  allStages={allStages}
                  onChangeStatus={onChangeStatus}
                />
              </Link>
            ))}
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
