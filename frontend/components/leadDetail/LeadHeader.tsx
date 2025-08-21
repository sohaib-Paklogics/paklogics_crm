"use client";

import Link from "next/link";
import { ArrowLeft, Edit, Save, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { Lead, LeadSource } from "@/types/lead";
import { Button } from "../ui/button";

const LeadHeader = ({
  lead,
  isEditing,
  canEdit,
  onEdit,
  onCancel,
  onSave,
}: {
  lead: Lead;
  isEditing: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) => {
  const prettyStatus = (s: String) =>
    s === "interview_scheduled"
      ? "Interview Scheduled"
      : s === "test_assigned"
      ? "Test Assigned"
      : s[0].toUpperCase() + s.slice(1);
  const statusClass: any = {
    new: "bg-blue-100 text-blue-800",
    interview_scheduled: "bg-yellow-100 text-yellow-800",
    test_assigned: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
  };
  const prettySource = (src: LeadSource) =>
    src === "job_board" ? "Job Board" : src[0].toUpperCase() + src.slice(1);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/leads">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{lead.clientName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={statusClass[lead.status]}>
              {prettyStatus(lead.status)}
            </Badge>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{prettySource(lead.source)}</span>
            {lead.assignedTo && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">
                  Assigned to {lead.assignedTo.username}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      {canEdit && (
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={onSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
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
