"use client";

import { LeadEvent } from "@/types/lead";
import { fmtTime, isToday, monthNames } from "@/utils/TimeUtils";
import React from "react";

const WeekGrid = ({
  weekDays,
  eventsForDate,
  onSelectEvent,
}: {
  weekDays: Date[];
  eventsForDate: (day: Date) => LeadEvent[];
  onSelectEvent: (e: LeadEvent) => void;
}) => {
  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDays.map((day, idx) => {
        const dayEvents = eventsForDate(day);
        const today = isToday(day);
        return (
          <div
            key={idx}
            className={`min-h-[220px] p-2 border border-gray-200 ${
              today ? "bg-validiz-mustard/10 border-validiz-mustard" : "hover:bg-gray-50"
            }`}
          >
            <div className={`text-sm font-medium mb-2 ${today ? "text-validiz-brown" : "text-gray-700"}`}>
              {monthNames[day.getMonth()]} {day.getDate()}
            </div>
            <div className="space-y-2">
              {dayEvents.length === 0 && <div className="text-xs text-gray-400 italic">No events</div>}
              {dayEvents.map((e) => (
                <button
                  key={e._id}
                  onClick={() => onSelectEvent(e)}
                  className="w-full text-left text-xs p-2 rounded border cursor-pointer hover:shadow-sm bg-blue-50 text-blue-800 border-blue-200"
                  title={e.title}
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
};

export default WeekGrid;
