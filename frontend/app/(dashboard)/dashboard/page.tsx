"use client";

import useAuthStore from "@/stores/auth-store";
import { useLeadStore } from "@/stores/lead-store";
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

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { leads } = useLeadStore();

  if (!user) return null;

  const userLeads =
    user.role === "admin"
      ? leads
      : user.role === "business_developer"
      ? leads.filter((lead) => lead.createdById === user.id)
      : leads.filter((lead) => lead.assignedDeveloperId === user.id);

  const stats = {
    totalLeads: userLeads.length,
    newLeads: userLeads.filter((lead) => lead.status === "new").length,
    interviewScheduled: userLeads.filter(
      (lead) => lead.status === "interview_scheduled"
    ).length,
    completed: userLeads.filter((lead) => lead.status === "completed").length,
  };

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
                {stats.totalLeads}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.role === "admin"
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
                {stats.newLeads}
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
                {stats.interviewScheduled}
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
                {stats.completed}
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
              {userLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
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
                      Created by {lead?.createdBy?.name} •{" "}
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        lead.status === "new"
                          ? "secondary"
                          : lead.status === "interview_scheduled"
                          ? "default"
                          : lead.status === "test_assigned"
                          ? "outline"
                          : "default"
                      }
                      className={
                        lead.status === "new"
                          ? "bg-validiz-mustard text-validiz-brown"
                          : lead.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                    >
                      {lead.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
              {userLeads.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No leads found.{" "}
                  {user.role === "business_developer" || user.role === "admin"
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
