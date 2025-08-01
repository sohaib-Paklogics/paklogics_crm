"use client";

import { useState, useMemo } from "react";
import { useLeadStore } from "@/stores/lead-store";
import { useUserStore } from "@/stores/user-store";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  BarChart3,
  PieChartIcon,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LeadStatus, LeadSource } from "@/types/types";
import useAuthStore from "@/stores/auth-store";

export default function ReportsPage() {
  const { user, hasPermission } = useAuthStore();
  const { leads } = useLeadStore();
  const { users } = useUserStore();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const filteredLeads = useMemo(() => {
    if (!user) return [];

    let filtered =
      user.role === "admin"
        ? leads
        : leads.filter((lead) => lead.createdById === user.id);

    // Date filtering
    if (dateFrom) {
      filtered = filtered.filter(
        (lead) => new Date(lead.createdAt) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filtered = filtered.filter(
        (lead) => new Date(lead.createdAt) <= new Date(dateTo)
      );
    }

    // Status filtering
    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    return filtered;
  }, [leads, user, dateFrom, dateTo, statusFilter]);

  const statusData = useMemo(() => {
    const statusCounts = {
      new: 0,
      interview_scheduled: 0,
      test_assigned: 0,
      completed: 0,
    };

    filteredLeads.forEach((lead) => {
      statusCounts[lead.status]++;
    });

    return [
      { name: "New", value: statusCounts.new, color: "#E2B144" },
      {
        name: "Interview Scheduled",
        value: statusCounts.interview_scheduled,
        color: "#3B82F6",
      },
      {
        name: "Test Assigned",
        value: statusCounts.test_assigned,
        color: "#F59E0B",
      },
      { name: "Completed", value: statusCounts.completed, color: "#10B981" },
    ];
  }, [filteredLeads]);

  const sourceData = useMemo(() => {
    const sourceCounts: Record<LeadSource, number> = {
      website: 0,
      referral: 0,
      linkedin: 0,
      job_board: 0,
      other: 0,
    };

    filteredLeads.forEach((lead) => {
      sourceCounts[lead.source]++;
    });

    return Object.entries(sourceCounts).map(([source, count]) => ({
      name: source.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
      color: getSourceColor(source as LeadSource),
    }));
  }, [filteredLeads]);

  const userPerformance = useMemo(() => {
    if (!user) return [];

    const performance = users
      .filter((u) => u.role === "bd" || u.role === "admin")
      .map((u) => {
        const userLeads = filteredLeads.filter(
          (lead) => lead.createdById === u.id
        );
        return {
          id: u.id,
          name: u.name,
          role: u.role,
          totalLeads: userLeads.length,
          newLeads: userLeads.filter((l) => l.status === "new").length,
          completedLeads: userLeads.filter((l) => l.status === "completed")
            .length,
          conversionRate:
            userLeads.length > 0
              ? Math.round(
                  (userLeads.filter((l) => l.status === "completed").length /
                    userLeads.length) *
                    100
                )
              : 0,
        };
      });

    return performance.sort((a, b) => b.totalLeads - a.totalLeads);
  }, [users, filteredLeads, user]);

  function getSourceColor(source: LeadSource): string {
    const colors = {
      website: "#4A171E",
      referral: "#E2B144",
      linkedin: "#0077B5",
      job_board: "#10B981",
      other: "#6B7280",
    };
    return colors[source];
  }

  const exportToCSV = () => {
    const csvData = [
      [
        "Client Name",
        "Job Description",
        "Source",
        "Status",
        "Assigned Developer",
        "Created By",
        "Created Date",
      ],
      ...filteredLeads.map((lead) => [
        lead.clientName,
        lead.jobDescription,
        lead.source,
        lead.status,
        lead.assignedDeveloper?.name || "Unassigned",
        lead.createdBy.name,
        new Date(lead.createdAt).toLocaleDateString(),
      ]),
    ];

    const csvContent = csvData
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `leads-report-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add this loading check first
  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-validiz-brown"></div>
        </div>
      </MainLayout>
    );
  }

  // Move the permission check after the null check
  if (!hasPermission({ action: "read", resource: "report" })) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">
            Access denied. Reports are only available to Admin and BD roles.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-validiz-brown">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Track performance and analyze lead data
            </p>
          </div>
          <Button
            onClick={exportToCSV}
            className="bg-validiz-brown hover:bg-validiz-brown/90"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-validiz-brown">
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as LeadStatus | "all")
                  }
                >
                  <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="interview_scheduled">
                      Interview Scheduled
                    </SelectItem>
                    <SelectItem value="test_assigned">Test Assigned</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setStatusFilter("all");
                  }}
                  className="w-full border-validiz-brown text-validiz-brown hover:bg-validiz-brown hover:text-white"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-validiz-brown" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-validiz-brown">
                {filteredLeads.length}
              </div>
              <p className="text-xs text-muted-foreground">
                In selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {filteredLeads.filter((l) => l.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredLeads.length > 0
                  ? Math.round(
                      (filteredLeads.filter((l) => l.status === "completed")
                        .length /
                        filteredLeads.length) *
                        100
                    )
                  : 0}
                % conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {
                  filteredLeads.filter(
                    (l) =>
                      l.status === "interview_scheduled" ||
                      l.status === "test_assigned"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Active opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <PieChartIcon className="h-4 w-4 text-validiz-mustard" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-validiz-mustard">
                {filteredLeads.filter((l) => l.status === "new").length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-validiz-brown">
                Leads by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4A171E" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-validiz-brown">Lead Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* User Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-validiz-brown">
              User Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-validiz-brown font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="text-validiz-brown font-semibold">
                      Role
                    </TableHead>
                    <TableHead className="text-validiz-brown font-semibold">
                      Total Leads
                    </TableHead>
                    <TableHead className="text-validiz-brown font-semibold">
                      New
                    </TableHead>
                    <TableHead className="text-validiz-brown font-semibold">
                      Completed
                    </TableHead>
                    <TableHead className="text-validiz-brown font-semibold">
                      Conversion Rate
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userPerformance.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {user.role.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {user.totalLeads}
                      </TableCell>
                      <TableCell>{user.newLeads}</TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {user.completedLeads}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-validiz-mustard h-2 rounded-full"
                              style={{ width: `${user.conversionRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {user.conversionRate}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
