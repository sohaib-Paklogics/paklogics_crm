"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import useAuthStore from "@/stores/auth.store";
import { useLeadsStore } from "@/stores/leads.store";
import { useEventsStore } from "@/stores/events.store";
import type { LeadEvent } from "@/types/lead";
import Loader from "@/components/common/Loader";
import HeaderBar from "@/components/calendar/HeaderBar";
import CalendarSkeleton from "@/components/calendar/CalendarSkeleton";
import {
  dateKey,
  endOfDay,
  endOfMonth,
  endOfWeek,
  getDaysInMonth,
  getDaysInWeek,
  monthNames,
  startOfDay,
  startOfMonth,
  startOfWeek,
  userTZ,
} from "@/utils/TimeUtils";
import MonthGrid from "@/components/calendar/MonthGrid";
import EventDetailsDialog from "@/components/calendar/EventDetailsDialog";
import InlineAddEventModal from "@/components/calendar/InlineAddEventModal";

import UpcomingList from "@/components/calendar/UpcomingList";
import WeekGrid from "@/components/calendar/WeekGrid";
import DayAgenda from "@/components/calendar/DayAgenda";

/* ---------------- root page ---------------- */
export default function CalendarPage() {
  const { user, hasPermission } = useAuthStore();
  const { items: leads, fetch: fetchLeads } = useLeadsStore();
  const { items: events, isLoading, fetch, create, remove, fetchByLead } = useEventsStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LeadEvent | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

  // search (debounced); if q is set, we fetch across ALL time (no from/to)
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  // load leads once
  useEffect(() => {
    fetchLeads({ page: 1, limit: 50 }).catch(() => {});
  }, [fetchLeads]);

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
    [view],
  );

  useEffect(() => {
    const run = async () => {
      // After create or delete:
      if (debouncedQ) {
        if (selectedLeadId) {
          await fetchByLead(selectedLeadId, { page: 1, limit: 100, search: debouncedQ });
        } else {
          await fetch({ page: 1, limit: 100, search: debouncedQ });
        }
      } else {
        const { from, to } = getRangeForView(currentDate);
        if (selectedLeadId) {
          await fetchByLead(selectedLeadId, { page: 1, limit: 100, from, to });
        } else {
          await fetch({ page: 1, limit: 100, from, to });
        }
      }
    };

    run().catch(() => {});
  }, [selectedLeadId, currentDate, view, debouncedQ, fetch, fetchByLead, getRangeForView]);

  // FETCH LOGIC:
  // - If debouncedQ exists → fetch across ALL data (no from/to).
  // - Else → fetch by current view window (month/week/day).
  useEffect(() => {
    if (debouncedQ) {
      fetch({ page: 1, limit: 100, search: debouncedQ }).catch(() => {});
    } else {
      const { from, to } = getRangeForView(currentDate);
      fetch({ page: 1, limit: 100, from, to }).catch(() => {});
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

  // derived days
  const monthDays = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  const weekDays = useMemo(() => getDaysInWeek(currentDate), [currentDate]);

  // PERF: build events index by date once
  const eventsByDate = useMemo(() => {
    const map = new Map<string, LeadEvent[]>();
    for (const e of events) {
      const d = new Date(e.startTime);
      const k = dateKey(d);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    // ensure each bucket is sorted by start time
    for (const [, list] of map) {
      list.sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
    }
    return map;
  }, [events]);

  const eventsForDate = useCallback((day: Date) => eventsByDate.get(dateKey(day)) ?? [], [eventsByDate]);

  const periodLabel =
    view === "month"
      ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
      : view === "week"
      ? (() => {
          const s = startOfWeek(currentDate);
          const e = endOfWeek(currentDate);
          const sameMon = s.getMonth() === e.getMonth();
          return sameMon
            ? `${monthNames[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`
            : `${monthNames[s.getMonth()]} ${s.getDate()} – ${
                monthNames[e.getMonth()]
              } ${e.getDate()}, ${e.getFullYear()}`;
        })()
      : `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;

  // Navigation per view
  const navigate = (dir: "prev" | "next") => {
    setCurrentDate((prev) => {
      const delta = dir === "prev" ? -1 : 1;
      if (view === "month") return new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
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

  // Upcoming: grouped by date for a tidy layout
  const upcomingByDate = useMemo(() => {
    const now = Date.now();
    const future = events
      .filter((e) => new Date(e.startTime).getTime() >= now)
      .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))
      .slice(0, 12); // show next 12 across dates

    const group = new Map<string, LeadEvent[]>();
    for (const e of future) {
      const d = new Date(e.startTime);
      const k = d.toLocaleDateString([], { year: "numeric", month: "long", day: "numeric", timeZone: userTZ });
      if (!group.has(k)) group.set(k, []);
      group.get(k)!.push(e);
    }
    return group;
  }, [events]);

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
        {/* Calendar + Upcoming side-by-side (responsive) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar (2/3 width on desktop) */}
          <Card className="lg:col-span-2 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => navigate("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold text-validiz-brown">{periodLabel}</h2>
                <Button variant="outline" size="sm" onClick={() => navigate("next")}>
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
              {isLoading ? (
                <CalendarSkeleton view={view} />
              ) : view === "month" ? (
                <MonthGrid monthDays={monthDays} eventsForDate={eventsForDate} onSelectEvent={setSelectedEvent} />
              ) : view === "week" ? (
                <WeekGrid weekDays={weekDays} eventsForDate={eventsForDate} onSelectEvent={setSelectedEvent} />
              ) : (
                <DayAgenda day={currentDate} eventsForDate={eventsForDate} onSelectEvent={setSelectedEvent} />
              )}
            </CardContent>
          </Card>

          {/* Upcoming (1/3 width on desktop) */}
          <div className="h-full">
            <UpcomingList upcomingByDate={upcomingByDate} leads={leads} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Inline Add Event Modal */}
      <InlineAddEventModal
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onCreate={async (payload) => {
          if (!selectedLeadId) return;
          const ok = await create(selectedLeadId, { ...payload, timezone: userTZ });
          if (ok) {
            // re-fetch using the same search rule
            if (debouncedQ) {
              await fetch({ page: 1, limit: 100, search: debouncedQ });
            } else {
              const { from, to } = getRangeForView(currentDate);
              await fetch({ page: 1, limit: 100, from, to });
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
          // show button loader inside dialog
          await remove(id);
          setSelectedEvent(null);
          if (debouncedQ) {
            await fetch({ page: 1, limit: 100, search: debouncedQ });
          } else {
            const { from, to } = getRangeForView(currentDate);
            await fetch({ page: 1, limit: 100, from, to });
          }
        }}
      />
    </MainLayout>
  );
}
