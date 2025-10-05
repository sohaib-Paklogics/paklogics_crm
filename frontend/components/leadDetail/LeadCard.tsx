"use client";

import { Draggable } from "react-beautiful-dnd";
import { MessageCircleMore, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Lead, Stage } from "@/types/lead";
import useAuthStore from "@/stores/auth.store";
import { cn } from "@/lib/utils";

const LeadCard = ({
  lead,
  index,
  canDragDrop,
}: {
  lead: Lead;
  index: number;
  canDragDrop: boolean;
  allStages: Stage[];
  onChangeStatus: (lead: Lead, toStageId: string) => Promise<void>;
}) => {
  const { user } = useAuthStore();

  const whileDragging = (isDragging: boolean) =>
    `mb-3 ${isDragging ? "rotate-2" : ""}`;
  const hoverScale = (isDragging: boolean) =>
    `cursor-pointer transition-all hover:shadow-md ${
      !isDragging && canDragDrop ? "hover:scale-105" : ""
    }`;
  const assigned =
    lead.assignedTo && typeof lead.assignedTo === "object"
      ? lead.assignedTo
      : null;

  const stageId = String(
    typeof lead.stage === "string" ? lead.stage : lead.stage?._id
  );
  const AVATAR_BG = [
    "bg-[#2563EB]",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-fuchsia-500",
    "bg-sky-500",
    "bg-rose-500",
    "bg-lime-500",
  ];

  function initial(name?: string) {
    return name?.trim()?.[0]?.toUpperCase() ?? "U";
  }

  function bgFromName(name?: string) {
    if (!name) return "bg-neutral-400";
    let hash = 0;
    for (let i = 0; i < name.length; i++)
      hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return AVATAR_BG[hash % AVATAR_BG.length];
  }
  return (
    <Draggable
      draggableId={String(lead._id)}
      index={index}
      isDragDisabled={!canDragDrop}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={whileDragging(snapshot.isDragging)}
        >
          <Card className={hoverScale(snapshot.isDragging)}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Badge
                  variant="outline"
                  className="text-xs text-primary capitalize bg-gray-50"
                >
                  {lead.source === "job_board"
                    ? "Job Board"
                    : lead.source.replace("_", " ")}
                </Badge>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold  text-md">
                      {lead.clientName}
                    </h4>
                    <p className="text-md text-gray-600 line-clamp-2 mt-1">
                      {lead.jobDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {assigned ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 ring-1 ring-black/5">
                          {/* No AvatarImage — always initial */}
                          <AvatarFallback
                            className={cn(
                              "h-full w-full rounded-full text-[11px] font-semibold text-white flex items-center justify-center",
                              bgFromName(assigned.username)
                            )}
                          >
                            {initial(assigned.username)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="h-7 w-7 rounded-full bg-neutral-300 text-white text-[11px] font-semibold flex items-center justify-center">
                          U
                        </div>
                        <span className="text-xs">Unassigned</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircleMore className="h-5 w-5 text-neutral-400" />
                    <span className="text-sm font-semibold text-neutral-900">
                      11
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default LeadCard;
