"use client";

import React from "react";
import { Badge } from "../ui/badge";
import {CalendarIcon, } from "lucide-react";
import { fmtTime } from "@/utils/TimeUtils";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Lead, LeadEvent } from "@/types/lead";
import Link from "next/link";
import { Clock, FileText, Users, Calendar, Phone, Mail, Video, Coffee } from "lucide-react";

const UpcomingList = ({
  upcomingByDate,
  leads,
  isLoading,
}: {
  upcomingByDate: Map<string, LeadEvent[]>;
  leads: Lead[];
  isLoading: boolean;
}) => {
  // Icon mapping based on event type/category
  const getEventIcon = (title: string, description: string) => {
    const text = `${title} ${description}`.toLowerCase();

    if (
      text.includes("meeting") ||
      text.includes("session") ||
      text.includes("strategy") ||
      text.includes("planning")
    ) {
      return <Users className="h-5 w-5 text-blue-500" />;
    }
    if (text.includes("call") || text.includes("phone")) {
      return <Phone className="h-5 w-5 text-green-500" />;
    }
    if (text.includes("email") || text.includes("mail")) {
      return <Mail className="h-5 w-5 text-purple-500" />;
    }
    if (text.includes("video") || text.includes("zoom")) {
      return <Video className="h-5 w-5 text-red-500" />;
    }
    if (text.includes("coffee") || text.includes("lunch") || text.includes("breakfast")) {
      return <Coffee className="h-5 w-5 text-amber-500" />;
    }

    // Default icon
    return <Calendar className="h-5 w-5 text-blue-500" />;
  };

  // Get icon background color
  const getIconBgColor = (title: string, description: string) => {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes("meeting") || text.includes("session") || text.includes("strategy") || text.includes("planning"))
      return "bg-blue-100";
    if (text.includes("call") || text.includes("phone")) return "bg-green-100";
    if (text.includes("email") || text.includes("mail")) return "bg-purple-100";
    if (text.includes("video") || text.includes("zoom")) return "bg-red-100";
    if (text.includes("coffee") || text.includes("lunch") || text.includes("breakfast")) return "bg-amber-100";

    return "bg-blue-100";
  };
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
          // Updated JSX code
          <div className="space-y-6">
            {Array.from(upcomingByDate.entries()).map(([prettyDate, list]) => (
              <div key={prettyDate}>
                <div className="text-sm font-semibold text-validiz-brown mb-3">{prettyDate}</div>
                <div className="flex flex-col space-y-3">
                  {list.map((e) => (
                    <Link key={e?.leadId} href={`/leads/${e?.leadId}`} className="no-underline">
                      <div className="flex items-start space-x-4 p-4 border border-neutral-200 rounded-xl hover:shadow-md hover:border-neutral-300 transition-all duration-200 bg-white">
                        {/* Dynamic Icon based on event type */}
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-lg ${getIconBgColor(
                            e.title,
                            e.description || "",
                          )} flex items-center justify-center`}
                        >
                          {getEventIcon(e.title, e.description || "")}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 capitalize text-base mb-1">{e.title}</p>

                          <p className="text-sm text-neutral-500">Today at {fmtTime(e.startTime)}</p>
                        </div>
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
