"use client";

import React from "react";
import { Badge } from "../ui/badge";
import { Calendar, CalendarIcon, Clock, FileText } from "lucide-react";
import { fmtTime } from "@/utils/TimeUtils";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Lead, LeadEvent } from "@/types/lead";
import Link from "next/link";

const UpcomingList = ({
  upcomingByDate,
  leads,
  isLoading,
}: {
  upcomingByDate: Map<string, LeadEvent[]>;
  leads: Lead[];
  isLoading: boolean;
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 border-b bg-[#1E293B] text-validiz-mustard font-medium overflow-hidden">
        <Calendar />
        <CardTitle className="text-validiz-mustard font-medium">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : upcomingByDate.size === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No upcoming events</p>
            <p className="text-sm">Create an event to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(upcomingByDate.entries()).map(([prettyDate, list]) => (
              <div key={prettyDate}>
                <div className="text-sm font-semibold text-validiz-brown mb-2">{prettyDate}</div>
                <div className="flex flex-col space-y-3">
                  {list.map((e) => (
                    <Link href={`/leads/${e?.leadId}`} className="no-underline">
                      <div
                        key={e?.leadId}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <div>
                            <p className="font-medium text-validiz-brown capitalize">{e.title}</p>
                            {e.description && <p className="text-sm text-gray-600 line-clamp-1">{e.description}</p>}
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{fmtTime(e.startTime)}</span>
                              </div>
                              {e.leadId && (
                                <div className="flex items-center space-x-1">
                                  <FileText className="h-3 w-3" />
                                  <span>{leads.find((l) => l._id === String(e.leadId))?.clientName || "Lead"}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">Event</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingList;
