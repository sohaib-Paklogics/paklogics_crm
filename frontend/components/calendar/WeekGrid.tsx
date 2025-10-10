// "use client";

// import { LeadEvent } from "@/types/lead";
// import { fmtTime, isToday, monthNames } from "@/utils/TimeUtils";
// import React from "react";

// const WeekGrid = ({
//   weekDays,
//   eventsForDate,
//   onSelectEvent,
// }: {
//   weekDays: Date[];
//   eventsForDate: (day: Date) => LeadEvent[];
//   onSelectEvent: (e: LeadEvent) => void;
// }) => {

//   return (
//     <div className="grid grid-cols-7 gap-1">
//       {weekDays.map((day, idx) => {
//         const dayEvents = eventsForDate(day);
//         const today = isToday(day);
//         const monthFull = monthNames[day.getMonth()];
//         const monthShort = monthFull.slice(0, 3);
//         return (
//           <div
//             key={idx}
//             className={`min-h-[220px] p-2 border border-gray-200 ${
//               today ? "bg-validiz-mustard/10 border-validiz-mustard" : "hover:bg-gray-50"
//             }`}
//           >
//             <div
//               className={`mb-2 font-medium text-xs sm:text-sm ${today ? "text-validiz-brown" : "text-gray-700"} 
//               whitespace-nowrap overflow-hidden text-ellipsis min-w-0`}
//               title={`${monthFull} ${day.getDate()}`} // full label on hover
//             >
//               <span className="inline sm:hidden">{monthShort}</span>
//               <span className="hidden sm:inline">{monthFull}</span> {day.getDate()}
//             </div>
//             <div className="space-y-2">
//               {dayEvents.length === 0 && <div className="text-xs text-gray-400 italic">No events</div>}
//               {dayEvents.map((e) => (
//                 <button
//                   key={e._id}
//                   onClick={() => onSelectEvent(e)}
//                   className="w-full text-left text-xs p-2 rounded border cursor-pointer hover:shadow-sm bg-blue-50 text-blue-800 border-blue-200"
//                   title={e.title}
//                 >
//                   <div className="font-medium truncate">{e.title}</div>
//                   <div className="text-[11px] opacity-75">
//                     {fmtTime(e.startTime)} – {fmtTime(e.endTime)}
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default WeekGrid;
"use client";

import { LeadEvent } from "@/types/lead";
import { fmtTime, isToday } from "@/utils/TimeUtils";
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
  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  };

  const getHourFromTime = (time: string) => {
    const date = new Date(time);
    return date.getHours();
  };

  const getMinuteFromTime = (time: string) => {
    const date = new Date(time);
    return date.getMinutes();
  };

  // Get all events for the week to determine AM or PM
  const allWeekEvents = weekDays.flatMap((day) => eventsForDate(day));
  const getHourRange = () => {
    if (allWeekEvents.length === 0) {
      return { hours: Array.from({ length: 12 }, (_, i) => i + 12), period: "PM" }; // Default PM
    }

    const eventHours = allWeekEvents.flatMap((event) => [
      getHourFromTime(event.startTime),
      getHourFromTime(event.endTime),
    ]);

    const hasAM = eventHours.some((h) => h < 12);
    const hasPM = eventHours.some((h) => h >= 12);

    // If events span both AM and PM, show all 24 hours
    if (hasAM && hasPM) {
      return { hours: Array.from({ length: 24 }, (_, i) => i), period: "BOTH" };
    }

    // Show only AM or PM based on where events are
    if (hasAM) {
      return { hours: Array.from({ length: 12 }, (_, i) => i), period: "AM" };
    } else {
      return { hours: Array.from({ length: 12 }, (_, i) => i + 12), period: "PM" };
    }
  };

  const { hours, period } = getHourRange();
  const minHour = hours[0];

  // Detect overlapping events and calculate their layout
  const getEventLayout = (events: LeadEvent[]) => {
    const sorted = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const columns: LeadEvent[][] = [];
    sorted.forEach((event) => {
      const eventStart = new Date(event.startTime).getTime();
      const eventEnd = new Date(event.endTime).getTime();

      // Find a column where this event doesn't overlap
      let placed = false;
      for (const column of columns) {
        const hasOverlap = column.some((e) => {
          const eStart = new Date(e.startTime).getTime();
          const eEnd = new Date(e.endTime).getTime();
          return eventStart < eEnd && eventEnd > eStart;
        });

        if (!hasOverlap) {
          column.push(event);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([event]);
      }
    });

    const layout: Map<string, { col: number; totalCols: number }> = new Map();
    columns.forEach((column, colIndex) => {
      column.forEach((event) => {
        layout.set(event._id, { col: colIndex, totalCols: columns.length });
      });
    });

    return layout;
  };

  const getEventPosition = (event: LeadEvent, layout: Map<string, { col: number; totalCols: number }>) => {
    const startHour = getHourFromTime(event.startTime);
    const startMinute = getMinuteFromTime(event.startTime);
    const endHour = getHourFromTime(event.endTime);
    const endMinute = getMinuteFromTime(event.endTime);

    const topOffset = (startHour - minHour) * 60 + startMinute;
    const duration = (endHour - startHour) * 60 + (endMinute - startMinute);

    const layoutInfo = layout.get(event._id) || { col: 0, totalCols: 1 };
    const widthPercent = 100 / layoutInfo.totalCols;
    const leftPercent = widthPercent * layoutInfo.col;

    return {
      top: `${topOffset}px`,
      height: `${Math.max(duration, 40)}px`,
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  return (
    <div className="flex h-[600px] overflow-y-auto">
      {/* Time column */}
      <div className="flex-shrink-0 w-20 border-r border-gray-200 sticky left-0 bg-white z-10">
        <div className="h-16 border-b border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
          {period === "BOTH" ? "24H" : period}
        </div>
        {hours.map((hour) => (
          <div
            key={hour}
            className="h-[60px] border-b border-gray-200 flex items-start justify-end pr-2 pt-1 text-xs text-gray-600"
          >
            {formatHour(hour)}
          </div>
        ))}
      </div>

      {/* Days columns */}
      <div className="flex-1 grid grid-cols-7">
        {weekDays.map((day, idx) => {
          const dayEvents = eventsForDate(day);
          const today = isToday(day);
          const eventLayout = getEventLayout(dayEvents);

          return (
            <div
              key={idx}
              className={`border-r border-gray-200 last:border-r-0 ${today ? "bg-validiz-mustard/10" : ""}`}
            >
              {/* Day header */}
              <div
                className={`h-16 border-b border-gray-200 flex flex-col items-center justify-center ${
                  today ? "bg-validiz-mustard text-validiz-brown" : "bg-white"
                }`}
              >
                <div className="text-xs font-medium">{getDayName(day)}</div>
                <div className={`text-2xl font-semibold ${today ? "text-validiz-brown" : "text-gray-900"}`}>
                  {day.getDate()}
                </div>
              </div>

              {/* Time slots with events */}
              <div className="relative">
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div key={hour} className="h-[60px] border-b border-gray-100" />
                ))}

                {/* Events positioned absolutely */}
                <div className="absolute inset-0 px-1">
                  {dayEvents.map((event) => {
                    const position = getEventPosition(event, eventLayout);
                    return (
                      <button
                        key={event._id}
                        onClick={() => onSelectEvent(event)}
                        className="absolute w-full text-left text-xs p-1 rounded border cursor-pointer hover:shadow-sm bg-blue-50 text-blue-800 border-blue-200"
                        style={position}
                        title={`${event.title}\n${fmtTime(event.startTime)} - ${fmtTime(event.endTime)}`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                    
                        <div className="flex items-center text-xs opacity-75 mt-0.5 gap-1 whitespace-nowrap">
                          <span>{fmtTime(event.startTime)}</span>
                          <span>–</span>
                          <span>{fmtTime(event.endTime)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekGrid