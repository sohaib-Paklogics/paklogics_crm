"use client";

import { Draggable } from "react-beautiful-dnd";
import { MoreVertical, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Lead, Stage } from "@/types/lead";
import useAuthStore from "@/stores/auth-store";

const LeadCard = ({
  lead,
  index,
  canDragDrop,
  allStages,
  onChangeStatus,
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
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-validiz-brown text-sm">
                      {lead.clientName}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {lead.jobDescription}
                    </p>
                  </div>

                  {user?.role !== "developer" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          aria-label="Lead actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>Move to…</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allStages.map((s) => (
                          <DropdownMenuItem
                            key={s._id}
                            disabled={String(s._id) === stageId}
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangeStatus(lead, String(s._id));
                            }}
                            className="flex items-center justify-between"
                          >
                            <span>{s.name}</span>
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ background: s.color }}
                            />
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs capitalize">
                    {lead.source === "job_board"
                      ? "Job Board"
                      : lead.source.replace("_", " ")}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {assigned ? (
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-validiz-brown text-white">
                            {assigned.username?.charAt(0)?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600 capitalize">
                          {assigned.username}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-gray-400">
                        <User className="h-4 w-4" />
                        <span className="text-xs">Unassigned</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Created {new Date(lead.createdAt).toLocaleDateString()}
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
