"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  FileText,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useAuthStore from "@/stores/auth-store";
import { useLeadsStore } from "@/stores/leads.store";
import { useEventsStore } from "@/stores/events.store";
import type { Lead, LeadEvent } from "@/types/lead";
import Loader from "@/components/common/Loader";
import Link from "next/link";

// ----- helpers -----
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const getDaysInMonth = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days: (Date | null)[] = [];

  // leading empty cells
  for (let i = 0; i < start.getDay(); i++) days.push(null);
  // month days
  for (let day = 1; day <= end.getDate(); day++)
    days.push(new Date(date.getFullYear(), date.getMonth(), day));

  return days;
};

const toISO = (local: string) => new Date(local).toISOString();
const userTZ =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";

// ----- page -----
export default function CalendarPage() {
  const { user, hasPermission } = useAuthStore();
  const { items: leads, fetch: fetchLeads } = useLeadsStore();
  const { items: events, isLoading, fetch, create, remove } = useEventsStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LeadEvent | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

  // Add loading check
  useEffect(() => {
    // ensure we have some leads to pick from
    fetchLeads({ page: 1, limit: 50, status: "all" }).catch(() => {});
  }, [fetchLeads]);

  // default lead selection once leads load
  useEffect(() => {
    if (!selectedLeadId && leads.length) {
      setSelectedLeadId(leads[0]._id);
    }
  }, [leads, selectedLeadId]);

  // fetch events for selected lead + month range
  useEffect(() => {
    if (!selectedLeadId) return;
    const from = startOfMonth(currentDate).toISOString();
    const to = new Date(
      endOfMonth(currentDate).getTime() + 24 * 60 * 60 * 1000 - 1
    ).toISOString(); // inclusive end
    fetch(selectedLeadId, { page: 1, limit: 100, from, to }).catch(() => {});
  }, [selectedLeadId, currentDate, fetch]);

  if (!user) {
    return (
      <MainLayout>
        <Loader />
      </MainLayout>
    );
  }

  const canCreateEvents = hasPermission({
    action: "create",
    resource: "leads",
  });

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const eventsForDate = (day: Date) =>
    events.filter((e) => {
      const d = new Date(e.startTime);
      return (
        d.getDate() === day.getDate() &&
        d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear()
      );
    });

  const navigateMonth = (dir: "prev" | "next") => {
    setCurrentDate(
      (prev) =>
        new Date(
          prev.getFullYear(),
          prev.getMonth() + (dir === "prev" ? -1 : 1),
          1
        )
    );
  };

  const isToday = (d: Date) => {
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: userTZ,
    });

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...events]
      .filter((e) => new Date(e.startTime).getTime() >= now)
      .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))
      .slice(0, 5);
  }, [events]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-validiz-brown">Calendar</h1>
            <p className="text-gray-600 mt-1">
              Schedule interviews, tests, and follow-ups for a lead
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Lead selector */}
            <Select
              value={selectedLeadId}
              onValueChange={(v) => setSelectedLeadId(v)}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select lead" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((l: Lead) => (
                  <SelectItem key={l._id} value={l._id}>
                    {l.clientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden sm:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                className={
                  view === "month"
                    ? "bg-validiz-brown hover:bg-validiz-brown/90"
                    : ""
                }
              >
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                className={
                  view === "week"
                    ? "bg-validiz-brown hover:bg-validiz-brown/90"
                    : ""
                }
                disabled
                title="Week view coming soon"
              >
                Week
              </Button>
              <Button
                variant={view === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("day")}
                className={
                  view === "day"
                    ? "bg-validiz-brown hover:bg-validiz-brown/90"
                    : ""
                }
                disabled
                title="Day view coming soon"
              >
                Day
              </Button>
            </div>

            {canCreateEvents && (
              <Button
                onClick={() => setIsAddEventOpen(true)}
                className="bg-validiz-brown hover:bg-validiz-brown/90"
                disabled={!selectedLeadId}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            )}
          </div>
        </div>

        {/* Calendar Navigation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold text-validiz-brown">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="border-validiz-brown text-validiz-brown hover:bg-validiz-brown hover:text-white"
            >
              Today
            </Button>
          </CardHeader>

          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="p-2 text-center font-medium text-gray-600 text-sm"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (!day) return <div key={idx} className="h-24 p-1" />;
                const dayEvents = eventsForDate(day);
                const today = isToday(day);

                return (
                  <div
                    key={idx}
                    className={`h-24 p-1 border border-gray-200 ${
                      today
                        ? "bg-validiz-mustard/10 border-validiz-mustard"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        today ? "text-validiz-brown" : "text-gray-700"
                      }`}
                    >
                      {day.getDate()}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((e) => (
                        <button
                          key={e._id}
                          onClick={() => setSelectedEvent(e)}
                          className="w-full text-left text-xs p-1 rounded border cursor-pointer hover:shadow-sm bg-blue-50 text-blue-800 border-blue-200"
                        >
                          <div className="font-medium truncate">{e.title}</div>
                          <div className="text-xs opacity-75">
                            {fmtTime(e.startTime)}
                          </div>
                        </button>
                      ))}

                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-validiz-brown">
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcoming.map((e) => (
                <div
                  key={e._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-medium text-validiz-brown">
                        {e.title}
                      </p>
                      {e.description && (
                        <p className="text-sm text-gray-600">{e.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(e.startTime).toLocaleDateString()} at{" "}
                            {fmtTime(e.startTime)}
                          </span>
                        </div>
                        {e.leadId && (
                          <div className="flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>
                              {leads.find((l) => l._id === String(e.leadId))
                                ?.clientName || `Lead`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Event
                  </Badge>
                </div>
              ))}
              {!isLoading && upcoming.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No upcoming events</p>
                  <p className="text-sm">Create an event to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onCreate={async (payload) => {
          if (!selectedLeadId) return;
          const ok = await create(selectedLeadId, payload);
          if (ok) {
            // refresh this month
            const from = startOfMonth(currentDate).toISOString();
            const to = new Date(
              endOfMonth(currentDate).getTime() + 24 * 60 * 60 * 1000 - 1
            ).toISOString();
            await fetch(selectedLeadId, { page: 1, limit: 100, from, to });
            setIsAddEventOpen(false);
          }
        }}
      />

      {/* Event Details Modal */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-validiz-brown">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Description
                </Label>
                <p className="text-sm text-gray-800 mt-1">
                  {selectedEvent.description || "No description"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Start Time
                  </Label>
                  <p className="text-sm text-gray-800 mt-1">
                    {new Date(selectedEvent.startTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    End Time
                  </Label>
                  <p className="text-sm text-gray-800 mt-1">
                    {new Date(selectedEvent.endTime).toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedEvent.leadId && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Related Lead
                  </Label>
                  <p className="text-sm text-gray-800 mt-1">
                    {leads.find((l) => l._id === String(selectedEvent.leadId))
                      ?.clientName || "Lead"}
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <Link href={`/leads/${selectedEvent.leadId}`}>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => setSelectedEvent(null)}
                  >
                    View Lead
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await remove(selectedEvent._id);
                    setSelectedEvent(null);
                    if (selectedLeadId) {
                      const from = startOfMonth(currentDate).toISOString();
                      const to = new Date(
                        endOfMonth(currentDate).getTime() +
                          24 * 60 * 60 * 1000 -
                          1
                      ).toISOString();
                      await fetch(selectedLeadId, {
                        page: 1,
                        limit: 100,
                        from,
                        to,
                      });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

/* ===========================
   Add Event Modal (sub-component)
   =========================== */

function AddEventModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (
    payload: Pick<
      LeadEvent,
      "title" | "startTime" | "endTime" | "timezone" | "description"
    >
  ) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title && start && end;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onCreate({
        title,
        description: description || undefined,
        startTime: toISO(start),
        endTime: toISO(end),
        timezone: userTZ,
      });
      // reset local form after successful create
      setTitle("");
      setDescription("");
      setStart("");
      setEnd("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-validiz-brown">
            Add New Event
          </DialogTitle>
          <DialogDescription>
            Schedule an interview, test, or follow-up
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tz">Timezone</Label>
              <Input id="tz" value={userTZ} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Event description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Date & Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Date & Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                min={start || undefined}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-validiz-brown hover:bg-validiz-brown/90"
              disabled={!canSubmit || submitting}
            >
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
