// components/EventModal.tsx
"use client";

import { LeadEvent } from "@/types/lead";
import { fmtTime } from "@/utils/TimeUtils";
import React from "react";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: LeadEvent[];
  date: Date;
  onSelectEvent: (e: LeadEvent) => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, events, date, onSelectEvent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Events for {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
              &times;
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2">
          {events.map((e) => (
            <button
              key={e._id}
              onClick={() => {
                onSelectEvent(e);
                onClose();
              }}
              className="w-full text-left p-3 rounded border cursor-pointer hover:shadow-md bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 transition"
            >
              <div className="font-medium">{e.title}</div>
              <div className="text-sm opacity-75 mt-1">{fmtTime(e.startTime)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
