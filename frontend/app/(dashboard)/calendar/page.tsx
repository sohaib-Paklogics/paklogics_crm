"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  FileText,
  Search as SearchIcon,
} from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import useAuthStore from "@/stores/auth-store";
import { useLeadsStore } from "@/stores/leads.store";
import { useEventsStore } from "@/stores/events.store";
import type { Lead, LeadEvent } from "@/types/lead";
import Loader from "@/components/common/Loader";
import Link from "next/link";

/* ---------------- helpers ---------------- */
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

const userTZ =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const startOfWeek = (d: Date) => {
  const day = d.getDay(); // 0=Sun
  const diff = d.getDate() - day;
  return new Date(d.getFullYear(), d.getMonth(), diff);
};
const endOfWeek = (d: Date) => {
  const s = startOfWeek(d);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
};
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const getDaysInMonth = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days: (Date | null)[] = [];
  for (let i = 0; i < start.getDay(); i++) days.push(null); // leading blanks
  for (let day = 1; day <= end.getDate(); day++)
    days.push(new Date(date.getFullYear(), date.getMonth(), day));
  return days;
};

const getDaysInWeek = (date: Date) => {
  const s = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    return d;
  });
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: userTZ,
  });

const sameYMD = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isToday = (d: Date) => sameYMD(d, new Date());

/* ---------------- root page ---------------- */
export default function CalendarPage() {
  const { user, hasPermission } = useAuthStore();
  const { items: leads, fetch: fetchLeads } = useLeadsStore();
  const { items: events, isLoading, fetch, create, remove } = useEventsStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LeadEvent | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

  // search (debounced); if q is set, we fetch across ALL time (no from/to)
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  // load leads
  useEffect(() => {
    fetchLeads({ page: 1, limit: 50, status: "all" }).catch(() => {});
  }, [fetchLeads]);

  // pick default lead
  useEffect(() => {
    if (!selectedLeadId && leads.length) setSelectedLeadId(leads[0]._id);
  }, [leads, selectedLeadId]);

  // fetch window for view (only used when NO search text)
  const getRangeForView = useCallback(
    (base: Date) => {
      if (view === "month") {
        const from = startOfMonth(base);
        const to = endOfMonth(base);
        const inclusiveTo = new Date(to.getTime());
        inclusiveTo.setHours(23, 59, 59, 999);
        return { from: from.toISOString(), to: inclusiveTo.toISOString() };
      }
      if (view === "week") {
        const from = startOfWeek(base);
        const to = endOfWeek(base);
        const inclusiveTo = new Date(to.getTime());
        inclusiveTo.setHours(23, 59, 59, 999);
        return { from: from.toISOString(), to: inclusiveTo.toISOString() };
      }
      const from = startOfDay(base);
      const to = endOfDay(base);
      return { from: from.toISOString(), to: to.toISOString() };
    },
    [view]
  );

  // FETCH LOGIC:
  // - If debouncedQ exists → fetch across ALL data for this lead (no from/to).
  // - Else → fetch by current view window (month/week/day).
  useEffect(() => {
    if (!selectedLeadId) return;
    if (debouncedQ) {
      fetch(selectedLeadId, { page: 1, limit: 100, search: debouncedQ }).catch(
        () => {}
      );
    } else {
      const { from, to } = getRangeForView(currentDate);
      fetch(selectedLeadId, { page: 1, limit: 100, from, to }).catch(() => {});
    }
  }, [selectedLeadId, currentDate, view, debouncedQ, fetch, getRangeForView]);

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

  // derived
  const monthDays = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  const weekDays = useMemo(() => getDaysInWeek(currentDate), [currentDate]);

  const eventsForDate = useCallback(
    (day: Date) =>
      events
        .filter((e) => sameYMD(new Date(e.startTime), day))
        .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime)),
    [events]
  );

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...events]
      .filter((e) => new Date(e.startTime).getTime() >= now)
      .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))
      .slice(0, 5);
  }, [events]);

  // navigation per view
  const navigate = (dir: "prev" | "next") => {
    setCurrentDate((prev) => {
      const delta = dir === "prev" ? -1 : 1;
      if (view === "month")
        return new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
      if (view === "week") {
        const d = new Date(prev);
        d.setDate(prev.getDate() + delta * 7);
        return d;
      }
      const d = new Date(prev);
      d.setDate(prev.getDate() + delta);
      return d;
    });
  };

  const periodLabel =
    view === "month"
      ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
      : view === "week"
      ? (() => {
          const s = startOfWeek(currentDate);
          const e = endOfWeek(currentDate);
          const sameMon = s.getMonth() === e.getMonth();
          return sameMon
            ? `${
                monthNames[s.getMonth()]
              } ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`
            : `${monthNames[s.getMonth()]} ${s.getDate()} – ${
                monthNames[e.getMonth()]
              } ${e.getDate()}, ${e.getFullYear()}`;
        })()
      : `${
          monthNames[currentDate.getMonth()]
        } ${currentDate.getDate()}, ${currentDate.getFullYear()}`;

  return (
    <MainLayout>
      <div className="space-y-6">
        <HeaderBar
          leads={leads}
          selectedLeadId={selectedLeadId}
          setSelectedLeadId={setSelectedLeadId}
          q={q}
          setQ={setQ}
          view={view}
          setView={setView}
          canCreateEvents={canCreateEvents}
          openAddEvent={() => setIsAddEventOpen(true)}
        />

        {/* Navigation + Period label */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold text-validiz-brown">
                {periodLabel}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("next")}
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
            {view === "month" && (
              <MonthGrid
                monthDays={monthDays}
                eventsForDate={eventsForDate}
                onSelectEvent={setSelectedEvent}
              />
            )}
            {view === "week" && (
              <WeekGrid
                weekDays={weekDays}
                eventsForDate={eventsForDate}
                onSelectEvent={setSelectedEvent}
              />
            )}
            {view === "day" && (
              <DayAgenda
                day={currentDate}
                eventsForDate={eventsForDate}
                onSelectEvent={setSelectedEvent}
              />
            )}
          </CardContent>
        </Card>

        <UpcomingList upcoming={upcoming} leads={leads} isLoading={isLoading} />
      </div>

      {/* Inline Add Event Modal (sub-component) */}
      <InlineAddEventModal
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onCreate={async (payload) => {
          if (!selectedLeadId) return;
          const ok = await create(selectedLeadId, {
            ...payload,
            timezone: userTZ,
          });
          if (ok) {
            // re-fetch using the same search-rule logic (q → all, else range)
            if (debouncedQ) {
              await fetch(selectedLeadId, {
                page: 1,
                limit: 100,
                search: debouncedQ,
              });
            } else {
              const { from, to } = getRangeForView(currentDate);
              await fetch(selectedLeadId, { page: 1, limit: 100, from, to });
            }
            setIsAddEventOpen(false);
          }
        }}
      />

      <EventDetailsDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        leads={leads}
        onDelete={async (id) => {
          await remove(id);
          setSelectedEvent(null);
          if (!selectedLeadId) return;
          if (debouncedQ) {
            await fetch(selectedLeadId, {
              page: 1,
              limit: 100,
              search: debouncedQ,
            });
          } else {
            const { from, to } = getRangeForView(currentDate);
            await fetch(selectedLeadId, { page: 1, limit: 100, from, to });
          }
        }}
      />
    </MainLayout>
  );
}

/* ---------------- sub-components ---------------- */

function HeaderBar({
  leads,
  selectedLeadId,
  setSelectedLeadId,
  q,
  setQ,
  view,
  setView,
  canCreateEvents,
  openAddEvent,
}: {
  leads: Lead[];
  selectedLeadId: string;
  setSelectedLeadId: (v: string) => void;
  q: string;
  setQ: (v: string) => void;
  view: "month" | "week" | "day";
  setView: (v: "month" | "week" | "day") => void;
  canCreateEvents: boolean;
  openAddEvent: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-validiz-brown">Calendar</h1>
        <p className="text-gray-600 mt-1">
          Schedule interviews, tests, and follow-ups for a lead
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <LeadSelector
          leads={leads}
          value={selectedLeadId}
          onChange={setSelectedLeadId}
        />

        <SearchBox value={q} onChange={setQ} disabled={!selectedLeadId} />

        <ViewSwitcher view={view} setView={setView} />

        {canCreateEvents && (
          <Button
            onClick={openAddEvent}
            className="bg-validiz-brown hover:bg-validiz-brown/90"
            disabled={!selectedLeadId}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        )}
      </div>
    </div>
  );
}

function LeadSelector({
  leads,
  value,
  onChange,
}: {
  leads: Lead[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="min-w-[220px]">
      <select
        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          Select lead…
        </option>
        {leads.map((l) => (
          <option key={l._id} value={l._id}>
            {l.clientName}
          </option>
        ))}
      </select>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search events…"
        className="pl-8 w-[220px] sm:w-[260px]"
        disabled={disabled}
      />
    </div>
  );
}

function ViewSwitcher({
  view,
  setView,
}: {
  view: "month" | "week" | "day";
  setView: (v: "month" | "week" | "day") => void;
}) {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant={view === "month" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("month")}
        className={
          view === "month" ? "bg-validiz-brown hover:bg-validiz-brown/90" : ""
        }
      >
        Month
      </Button>
      <Button
        variant={view === "week" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("week")}
        className={
          view === "week" ? "bg-validiz-brown hover:bg-validiz-brown/90" : ""
        }
      >
        Week
      </Button>
      <Button
        variant={view === "day" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("day")}
        className={
          view === "day" ? "bg-validiz-brown hover:bg-validiz-brown/90" : ""
        }
      >
        Day
      </Button>
    </div>
  );
}

function MonthGrid({
  monthDays,
  eventsForDate,
  onSelectEvent,
}: {
  monthDays: (Date | null)[];
  eventsForDate: (day: Date) => LeadEvent[];
  onSelectEvent: (e: LeadEvent) => void;
}) {
  return (
    <>
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
        {monthDays.map((day, idx) => {
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
                    onClick={() => onSelectEvent(e)}
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
    </>
  );
}

function WeekGrid({
  weekDays,
  eventsForDate,
  onSelectEvent,
}: {
  weekDays: Date[];
  eventsForDate: (day: Date) => LeadEvent[];
  onSelectEvent: (e: LeadEvent) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDays.map((day, idx) => {
        const dayEvents = eventsForDate(day);
        const today = isToday(day);
        return (
          <div
            key={idx}
            className={`min-h-[220px] p-2 border border-gray-200 ${
              today
                ? "bg-validiz-mustard/10 border-validiz-mustard"
                : "hover:bg-gray-50"
            }`}
          >
            <div
              className={`text-sm font-medium mb-2 ${
                today ? "text-validiz-brown" : "text-gray-700"
              }`}
            >
              {monthNames[day.getMonth()]} {day.getDate()}
            </div>
            <div className="space-y-2">
              {dayEvents.length === 0 && (
                <div className="text-xs text-gray-400 italic">No events</div>
              )}
              {dayEvents.map((e) => (
                <button
                  key={e._id}
                  onClick={() => onSelectEvent(e)}
                  className="w-full text-left text-xs p-2 rounded border cursor-pointer hover:shadow-sm bg-blue-50 text-blue-800 border-blue-200"
                >
                  <div className="font-medium truncate">{e.title}</div>
                  <div className="text-[11px] opacity-75">
                    {fmtTime(e.startTime)} – {fmtTime(e.endTime)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayAgenda({
  day,
  eventsForDate,
  onSelectEvent,
}: {
  day: Date;
  eventsForDate: (d: Date) => LeadEvent[];
  onSelectEvent: (e: LeadEvent) => void;
}) {
  const list = eventsForDate(day);
  return (
    <div className="border rounded-md p-3">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-validiz-brown">
          {monthNames[day.getMonth()]} {day.getDate()}, {day.getFullYear()}
        </h3>
      </div>
      <div className="space-y-2">
        {list.length === 0 && (
          <div className="text-sm text-gray-500">No events for this day.</div>
        )}
        {list.map((e) => (
          <div
            key={e._id}
            className="flex items-start justify-between p-2 border rounded hover:bg-gray-50"
          >
            <div className="mr-3">
              <div className="font-medium text-validiz-brown">{e.title}</div>
              {e.description && (
                <div className="text-xs text-gray-600 line-clamp-2">
                  {e.description}
                </div>
              )}
              <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500">
                <span>
                  {fmtTime(e.startTime)} – {fmtTime(e.endTime)}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectEvent(e)}
            >
              Details
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingList({
  upcoming,
  leads,
  isLoading,
}: {
  upcoming: LeadEvent[];
  leads: Lead[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-validiz-brown">Upcoming Events</CardTitle>
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
                  <p className="font-medium text-validiz-brown">{e.title}</p>
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
  );
}

function EventDetailsDialog({
  event,
  onClose,
  leads,
  onDelete,
}: {
  event: LeadEvent | null;
  onClose: () => void;
  leads: Lead[];
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-validiz-brown">
            {event?.title}
          </DialogTitle>
        </DialogHeader>
        {event && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Description
              </Label>
              <p className="text-sm text-gray-800 mt-1">
                {event.description || "No description"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Start Time
                </Label>
                <p className="text-sm text-gray-800 mt-1">
                  {new Date(event.startTime).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  End Time
                </Label>
                <p className="text-sm text-gray-800 mt-1">
                  {new Date(event.endTime).toLocaleString()}
                </p>
              </div>
            </div>
            {event.leadId && (
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Related Lead
                </Label>
                <p className="text-sm text-gray-800 mt-1">
                  {leads.find((l) => l._id === String(event.leadId))
                    ?.clientName || "Lead"}
                </p>
              </div>
            )}
            <div className="flex justify-end">
              <Link href={`/leads/${event.leadId}`}>
                <Button variant="outline" className="mr-2" onClick={onClose}>
                  View Lead
                </Button>
              </Link>
              <Button variant="destructive" onClick={() => onDelete(event._id)}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Minimal inline Add Event modal.
 *  If you already have a rich AddEventModal elsewhere, you can swap this out.
 */
function InlineAddEventModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (payload: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState<string>(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [end, setEnd] = useState<string>(() =>
    new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length >= 2 && !!start && !!end;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-validiz-brown">Add Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Interview with John"
            />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start</Label>
              <Input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>End</Label>
              <Input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Zoom / Office"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={!canSave || saving}
              onClick={async () => {
                setSaving(true);
                await onCreate({
                  title: title.trim(),
                  description: description.trim() || undefined,
                  startTime: new Date(start).toISOString(),
                  endTime: new Date(end).toISOString(),
                  location: location.trim() || undefined,
                });
                setSaving(false);
              }}
            >
              {saving ? "Saving…" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
