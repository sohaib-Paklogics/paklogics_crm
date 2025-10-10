"use client";

import { LeadEvent } from "@/types/lead";
import { fmtTime, isToday } from "@/utils/TimeUtils";
import React, { useState } from "react";
import EventModal from "../modals/EventModal";

const MonthGrid = ({
  monthDays,
  eventsForDate,
  onSelectEvent,
}: {
  monthDays: (Date | null)[];
  eventsForDate: (day: Date) => LeadEvent[];
  onSelectEvent: (e: LeadEvent) => void;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalEvents, setModalEvents] = useState<LeadEvent[]>([]);

  const handleSeeMore = (day: Date, events: LeadEvent[]) => {
    setSelectedDate(day);
    setModalEvents(events);
    setModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-7 gap-1 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="p-2 text-center font-medium text-gray-600 text-sm">
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
                today ? "bg-validiz-mustard/10 border-validiz-mustard" : "hover:bg-gray-50"
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${today ? "text-validiz-brown" : "text-gray-700"}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {/* Show only 1 event */}
                {dayEvents.slice(0, 1).map((e) => (
                  <button
                    key={e._id}
                    onClick={() => onSelectEvent(e)}
                    className="w-full text-left text-xs p-1 rounded border cursor-pointer hover:shadow-sm bg-blue-50 text-blue-800 border-blue-200"
                    title={e.title}
                  >
                    <div className="font-medium truncate">{e.title}</div>
                    <div className="text-xs opacity-75">{fmtTime(e.startTime)}</div>
                  </button>
                ))}
                {/* Show "See more" button if more than 1 event */}
                {dayEvents.length > 1 && (
                  <button
                    onClick={() => handleSeeMore(day, dayEvents)}
                    className="w-full text-xs text-primary whitespace-nowrap truncate hover:text-blue-800 font-medium text-center py-1 hover:bg-blue-50 rounded"
                  >
                    See more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedDate && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          events={modalEvents}
          date={selectedDate}
          onSelectEvent={onSelectEvent}
        />
      )}
    </>
  );
};

export default MonthGrid;
