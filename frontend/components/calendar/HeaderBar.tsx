"use client";

import React from "react";
import { Button } from "../ui/button";
import { SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Lead } from "@/types/lead";

const HeaderBar = ({
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
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Calendar</h1>
        <p className="mt-0.5 sm:mt-1 text-sm text-gray-600">Schedule interviews, tests, and follow-ups</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        {/* <LeadSelector leads={leads} value={selectedLeadId} onChange={setSelectedLeadId} /> */}
        {/* <SearchBox value={q} onChange={setQ} disabled={false} /> */}
        <ViewSwitcher view={view} setView={setView} />
        {/* {canCreateEvents && (
          <Button className="bg-validiz-brown hover:bg-validiz-brown/90" onClick={openAddEvent}>
            New Event
          </Button>
        )} */}
      </div>
    </div>
  );
};

export default HeaderBar;

function LeadSelector({
  leads,
  value,
  onChange,
}: {
  leads: Lead[];
  value: string; // "" means All leads
  onChange: (v: string) => void;
}) {
  return (
    <div className="min-w-[220px]">
      <select
        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All leads</option>
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
        className={view === "month" ? "bg-validiz-brown hover:bg-validiz-brown/90" : ""}
      >
        Month
      </Button>
      <Button
        variant={view === "week" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("week")}
        className={view === "week" ? "bg-validiz-brown hover:bg-validiz-brown/90" : ""}
      >
        Week
      </Button>
      <Button
        variant={view === "day" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("day")}
        className={view === "day" ? "bg-validiz-brown hover:bg-validiz-brown/90" : ""}
      >
        Day
      </Button>
    </div>
  );
}
