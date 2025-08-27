"use client";

import { useEffect, useMemo } from "react";
import useAuthStore from "@/stores/auth-store";
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
        <div>
          <h1 className="text-3xl font-bold text-validiz-brown">
            {getGreeting()}, {user.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back to your Validiz CRM dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <FileText className="h-4 w-4 text-validiz-brown" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-validiz-brown">
                {isLoading ? "…" : stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.role === "admin" || user.role === "superadmin"
                  ? "All leads"
                  : user.role === "business_developer"
                  ? "Your leads"
                  : "Assigned to you"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-validiz-mustard" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-validiz-mustard">
                {isLoading ? "…" : stats.newLeads}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? "…" : stats.interviewScheduled}
              </div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? "…" : stats.completed}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully closed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-validiz-brown">Recent Leads</CardTitle>
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
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-validiz-brown">
                          {lead.clientName}
                        </h4>
                        <p className="text-sm text-gray-600 truncate max-w-md">
                          {lead.jobDescription}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created by {createdByName} •{" "}
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
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
