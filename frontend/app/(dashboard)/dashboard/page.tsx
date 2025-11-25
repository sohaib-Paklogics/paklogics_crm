"use client";

import { useEffect, useMemo } from "react";
import useAuthStore from "@/stores/auth.store";
import { useLeadsStore } from "@/stores/leads.store";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import StatsOverview from "@/components/landing/StatsOverview";
import { timeAgo } from "@/utils/TimeUtils";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { items: leads, fetch, isLoading } = useLeadsStore();
  // Fetch a reasonable amount for dashboard stats
  // Let the backend handle role-based scoping
  useEffect(() => {
    if (!user) return;
    fetch({ page: 1, limit: 100 }).catch(() => {});
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

  // Role guard on client (in case API returned more)
  const scopedLeads = useMemo(() => {
    if (!user) return [];

    // const userIdStr = String(user.id);

    // // Admin / superadmin: see everything the API returned
    // if (user.role === "admin" || user.role === "superadmin") return leads;

    // if (user.role === "business_developer") {
    //   // BD sees:
    //   // - leads they created
    //   // - OR leads where they're assigned as Business Developer
    //   return (leads || []).filter((l: any) => {
    //     const createdById = typeof l.createdBy === "string" ? l.createdBy : l.createdBy?._id;

    //     const bdId =
    //       typeof l.assignedBusinessDeveloper === "string"
    //         ? l.assignedBusinessDeveloper
    //         : l.assignedBusinessDeveloper?._id;

    //     return String(createdById) === userIdStr || String(bdId) === userIdStr;
    //   });
    // }

    // // Developer: leads assigned to them (and optionally those they created)
    // if (user.role === "developer") {
    //   return (leads || []).filter((l: any) => {
    //     const assignedToId = typeof l.assignedTo === "string" ? l.assignedTo : l.assignedTo?._id;

    //     const createdById = typeof l.createdBy === "string" ? l.createdBy : l.createdBy?._id;

    //     // If you only want "assigned to me", drop the createdBy part
    //     return String(assignedToId) === userIdStr || String(createdById) === userIdStr;
    //   });
    // }

    // Fallback: for any other role, just return what API gave
    return leads;
  }, [leads, user]);

  const stats = useMemo(() => {
    const total = scopedLeads.length;

    // NOTE: if your Lead status is an object { value }, adapt as needed:
    // const newLeads = scopedLeads.filter((l: any) => l.status?.value === "new").length;
    const newLeads = scopedLeads.filter((l: any) => l.status === "new").length;
    const interviewScheduled = scopedLeads.filter((l: any) => l.status === "interview_scheduled").length;
    const completed = scopedLeads.filter((l: any) => l.status === "completed").length;

    return { total, newLeads, interviewScheduled, completed };
  }, [scopedLeads]);

  const recent = useMemo(
    () => [...scopedLeads].sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5),
    [scopedLeads],
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
        <div className="flex items-center justify-between border-b pb-4 border-neutral-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              {getGreeting()}, <span className="capitalize">{user.username}</span>!
            </h1>
            <p className="mt-0.5 sm:mt-1 text-sm text-gray-600">Welcome back to your Validiz CRM dashboard</p>
          </div>
        </div>

        <StatsOverview stats={stats} isLoading={isLoading} user={user} />

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="text-black truncate">Recent Leads</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Your most recent lead activities
                </CardDescription>
              </div>

              {/* View All Leads Button */}
              <Link href="/kanban" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-primary hover:text-primary/80 w-full sm:w-auto justify-center"
                >
                  View All Leads
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {isLoading && <p className="text-sm text-gray-500">Loading…</p>}

              {!isLoading &&
                recent.map((lead: any) => {
                  return (
                    <div
                      key={lead._id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      {/* Avatar */}
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-orange-500">
                        <div className="flex h-full w-full items-center justify-center bg-orange-50 text-orange-700 text-sm font-semibold">
                          {lead.clientName?.[0]?.toUpperCase() ?? "U"}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{lead.clientName}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">{lead.jobDescription}</p>
                      </div>

                      {/* Time and Status */}
                      <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-auto">
                        <p className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(lead.createdAt)}</p>
                        <StatusBadge status={lead.stage?.name} />
                      </div>
                    </div>
                  );
                })}

              {!isLoading && recent.length === 0 && (
                <p className="text-center text-gray-500 py-8 text-sm">
                  No leads found. Create your first lead to get started!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
