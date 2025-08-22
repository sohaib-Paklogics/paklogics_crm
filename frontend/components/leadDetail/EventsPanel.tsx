"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarPlus, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { useEventsStore } from "@/stores/events.store";
import type { LeadEvent } from "@/types/lead";
import Loader from "../common/Loader";
import { set } from "zod";
import ButtonLoader from "../common/ButtonLoader";

// Small helper to format date/time in a given tz
function formatInTz(dateIso: string | Date, timeZone: string) {
  try {
    const d = typeof dateIso === "string" ? new Date(dateIso) : dateIso;
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return new Date(dateIso).toLocaleString();
  }
}

const statusColor: Record<NonNullable<LeadEvent["status"]>, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  "in-progress": "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
  canceled: "bg-red-100 text-red-800",
  rescheduled: "bg-purple-100 text-purple-800",
};

export default function EventsPanel({ leadId }: { leadId: string }) {
  const { items, pagination, isLoading, fetch, create, remove } =
    useEventsStore();
  const [isSubmiting, setIsSubmiting] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const browserTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    []
  );
  const [timezone, setTimezone] = useState(browserTz);
  const [description, setDescription] = useState("");

  // paging
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 20;
  const totalPages = pagination?.pages ?? 1;

  useEffect(() => {
    fetch(leadId, { page: 1, limit: 20 });
  }, [leadId, fetch]);

  const reset = () => {
    setTitle("");
    setStartTime("");
    setEndTime("");
    setTimezone(browserTz);
    setDescription("");
    setIsSubmiting(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmiting(true);

    try {
      if (!title.trim()) {
        toast.error("Title is required");
        return;
      }
      if (!startTime || !endTime) {
        toast.error("Start and end time are required");
        return;
      }

      const start = new Date(startTime);
      const end = new Date(endTime);
      if (end <= start) {
        toast.error("End time must be after start time");
        return;
      }

      const ok = await create(leadId, {
        title: title.trim(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        timezone,
        description: description.trim() || "",
      });

      if (ok) {
        reset();
        // store already unshifts; but refetch to refresh paging counts
        await fetch(leadId, { page: 1, limit });
      }
    } finally {
      setIsSubmiting(false);
    }
  };

  const goTo = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    await fetch(leadId, { page: nextPage, limit });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5" />
            Add Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={submit}
            className="grid grid-cols-1 md:grid-cols-6 gap-4"
          >
            <div className="md:col-span-3">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <Label>Timezone</Label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g., Asia/Karachi"
                disabled
              />
            </div>

            <div className="md:col-span-3">
              <Label>Start</Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="md:col-span-3">
              <Label>End</Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <div className="md:col-span-6">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="md:col-span-6 flex justify-end">
              <Button type="submit" disabled={isLoading || !title.trim()}>
                {isSubmiting ? <ButtonLoader /> : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Events ({pagination?.total ?? items.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetch(leadId, { page, limit })}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader />
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No events yet.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((ev) => (
                <EventRow key={ev._id} ev={ev} onDelete={remove} />
              ))}

              {/* Pager */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goTo(page - 1)}
                      disabled={page <= 1}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goTo(page + 1)}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EventRow({
  ev,
  onDelete,
}: {
  ev: LeadEvent;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const tz = ev.timezone || "UTC";
  const color =
    statusColor[ev.status ?? "scheduled"] ?? "bg-gray-100 text-gray-800";

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{ev.title}</p>
          <Badge className={color}>
            {(ev.status ?? "scheduled").replace("-", " ")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatInTz(ev.startTime, tz)} → {formatInTz(ev.endTime, tz)} ({tz})
        </p>
        {ev.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {ev.description}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Created {new Date(ev.createdAt!).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={async () => {
            const ok = await onDelete(ev._id);
            if (ok) toast.success("Event deleted");
          }}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}
