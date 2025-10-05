"use client";

import { Lead, LeadEvent } from "@/types/lead";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import Link from "next/link";
import { Button } from "../ui/button";
import ButtonLoader from "../common/ButtonLoader";

const EventDetailsDialog = ({
  event,
  onClose,
  leads,
  onDelete,
}: {
  event: LeadEvent | null;
  onClose: () => void;
  leads: Lead[];
  onDelete: (id: string) => Promise<void>;
}) => {
  const [deleting, setDeleting] = useState(false);

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-validiz-brown">{event?.title ?? "Event"}</DialogTitle>
        </DialogHeader>
        {event && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Description</Label>
              <p className="text-sm text-gray-800 mt-1">{event.description || "No description"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Start Time</Label>
                <p className="text-sm text-gray-800 mt-1">{new Date(event.startTime).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">End Time</Label>
                <p className="text-sm text-gray-800 mt-1">{new Date(event.endTime).toLocaleString()}</p>
              </div>
            </div>
            {event.leadId && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Related Lead</Label>
                <p className="text-sm text-gray-800 mt-1">
                  {leads.find((l) => l._id === String(event.leadId))?.clientName || "Lead"}
                </p>
              </div>
            )}
            <div className="flex justify-end">
              <Link href={`/leads/${event.leadId}`}>
                <Button variant="outline" className="mr-2" onClick={onClose}>
                  View Lead
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={async () => {
                  setDeleting(true);
                  await onDelete(event._id);
                  setDeleting(false);
                }}
                disabled={deleting}
              >
                {deleting ? <ButtonLoader /> : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
