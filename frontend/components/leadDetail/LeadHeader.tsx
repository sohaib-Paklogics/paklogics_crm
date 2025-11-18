// components/leadDetail/LeadHeader.tsx
"use client";

import { ArrowLeft, Edit, Save, X } from "lucide-react";
import Link from "next/link";

import { Lead, LeadSource } from "@/types/lead";
import StatusBadge from "../common/StatusBadge";
import { Button } from "../ui/button";

const LeadHeader = ({
  lead,
  isEditing,
  canEdit,
  onEdit,
  onCancel,
  onSave,
  isSaving,
}: {
  lead: Lead;
  isEditing: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
}) => {
  const prettySource = (src: LeadSource) =>
    src === "job_board" ? "Job Board" : src.charAt(0).toUpperCase() + src.slice(1);

  const assignedName = lead.assignedTo && typeof lead.assignedTo === "object" ? lead.assignedTo.username : null;

  const creator = lead.createdBy && typeof lead.createdBy === "object" ? lead.createdBy : null;

  const createdAtLabel = lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "";

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <Link href="/leads">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Button>
          </Link>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">{lead.clientName}</h1>

          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
            <StatusBadge status={typeof lead.stage === "object" ? lead.stage.name : lead.stage} />
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{prettySource(lead.source)}</span>

            {creator && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  Created by <span className="font-medium capitalize">{creator.username}</span>
                </span>
              </>
            )}

            {createdAtLabel && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  Created at <span className="font-medium">{createdAtLabel}</span>
                </span>
              </>
            )}
          </div>

          {assignedName && (
            <p className="mt-1 text-sm text-gray-600">
              Assigned to <span className="font-semibold capitalize">{assignedName}</span>{" "}
              <span className="text-xs text-gray-400">(developer)</span>
            </p>
          )}
        </div>
      </div>

      {canEdit && (
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={onSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Lead
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadHeader;
