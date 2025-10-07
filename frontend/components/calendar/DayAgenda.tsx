"use client";

import { LeadEvent } from "@/types/lead";
import { fmtTime, monthNames } from "@/utils/TimeUtils";
import React from "react";
import { Button } from "../ui/button";

const DayAgenda = ({
  day,
  eventsForDate,
  onSelectEvent,
}: {
  day: Date;
  eventsForDate: (d: Date) => LeadEvent[];
  onSelectEvent: (e: LeadEvent) => void;
}) => {
  const list = eventsForDate(day);
  return (
    <div className="border rounded-md p-3">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-validiz-brown">
          {monthNames[day.getMonth()]} {day.getDate()}, {day.getFullYear()}
        </h3>
      </div>
      <div className="space-y-2">
        {list.length === 0 && <div className="text-sm text-gray-500">No events for this day.</div>}
        {list.map((e) => (
          <div key={e._id} className="flex items-start justify-between p-2 border rounded hover:bg-gray-50">
            <div className="mr-3">
              <div className="font-medium text-validiz-brown">{e.title}</div>
              {e.description && <div className="text-xs text-gray-600 line-clamp-2">{e.description}</div>}
              <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500">
                <span>
                  {fmtTime(e.startTime)} – {fmtTime(e.endTime)}
                </span>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => onSelectEvent(e)}>
              Details
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayAgenda;
