"use client";

import { useEffect, useMemo } from "react";
import useAuthStore from "@/stores/auth.store";
import { useLeadsStore } from "@/stores/leads.store";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Calendar, TrendingUp } from "lucide-react";
import StatsOverview from "@/components/landing/StatsOverview";
import Image from "next/image";
import { timeAgo } from "@/utils/TimeUtils";
import StatusBadge from "@/components/common/StatusBadge";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { items: leads, fetch, isLoading } = useLeadsStore();

  // fetch a reasonable amount for dashboard stats
  useEffect(() => {
    if (!user) return;
    const params: Record<string, any> = { page: 1, limit: 100 };
    if (user.role === "business_developer") params.createdBy = user.id;
    if (user.role === "developer") params.assignedTo = user.id;
    fetch(params).catch(() => {});
  }, [user, fetch]);

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-validiz-brown" />
        </div>
      </MainLayout>
    );
  }

  // role guard on client (in case API returned more)
  const scopedLeads = useMemo(() => {
    if (user.role === "admin" || user.role === "superadmin") return leads;
    if (user.role === "business_developer") {
      return leads.filter(
        (l: any) =>
          String(
            typeof l.createdBy === "string" ? l.createdBy : l.createdBy?._id
          ) === String(user.id)
      );
    }
    // developer
    return leads.filter(
      (l: any) =>
        String(
          typeof l.assignedTo === "string" ? l.assignedTo : l.assignedTo?._id
        ) === String(user.id)
    );
  }, [leads, user]);

  const stats = useMemo(() => {
    const total = scopedLeads.length;
    const newLeads = scopedLeads.filter((l: any) => l.status === "new").length;
    const interviewScheduled = scopedLeads.filter(
      (l: any) => l.status === "interview_scheduled"
    ).length;
    const completed = scopedLeads.filter(
      (l: any) => l.status === "completed"
    ).length;
    return { total, newLeads, interviewScheduled, completed };
  }, [scopedLeads]);

  const recent = useMemo(
    () =>
      [...scopedLeads]
        .sort(
          (a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt)
        )
        .slice(0, 5),
    [scopedLeads]
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b pb-4 border-neutral-200">
          <h1 className="text-3xl font-bold text-primary">
            {getGreeting()}, <span className="capitalize">{user.username}</span>
            !
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back to your Validiz CRM dashboard
          </p>
        </div>

        <StatsOverview stats={stats} isLoading={isLoading} user={user} />

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Recent Leads</CardTitle>
            <CardDescription>Your most recent lead activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading && (
                <p className="text-sm text-muted-foreground">Loading…</p>
              )}

              {!isLoading &&
                recent.map((lead: any) => {
                  const createdByName =
                    (typeof lead.createdBy === "object" &&
                      lead.createdBy?.username) ||
                    (typeof lead.createdBy === "string" && "") ||
                    "—";
                  return (
                    <div
                      key={lead._id}
                      className="flex items-center justify-between p-4 border rounded-lg  gap-4"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-primary ">
                        <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-500 text-sm font-semibold">
                          {lead.clientName?.[0]?.toUpperCase() ?? "U"}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium ">{lead.clientName}</h4>
                        <p className="text-sm text-gray-600 truncate max-w-md">
                          {lead.jobDescription}
                        </p>
                      </div>
                      <p className="mt-1 flex items-center text-xs text-gray-500">
                        {timeAgo(lead.createdAt)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={lead.stage?.name} />
                      </div>
                    </div>
                  );
                })}

              {!isLoading && scopedLeads.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No leads found.{" "}
                  {user.role === "business_developer" ||
                  user.role === "admin" ||
                  user.role === "superadmin"
                    ? "Create your first lead to get started!"
                    : "No leads have been assigned to you yet."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
