"use client";

import React from "react";
import { Skeleton } from "../ui/skeleton";

const CalendarSkeleton = ({ view }: { view: "month" | "week" | "day" }) => {
  if (view === "day") {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  const cols = 7;
  const rows = view === "month" ? 6 : 1;
  return (
    <div className={`grid grid-cols-${cols} gap-1`}>
      {Array.from({ length: cols * rows * (view === "week" ? 3 : 1) }).map((_, i) => (
        <Skeleton key={i} className={view === "month" ? "h-24" : "h-[220px]"} />
      ))}
    </div>
  );
};

export default CalendarSkeleton;
