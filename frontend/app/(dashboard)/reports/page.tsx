"use client";

import { useEffect, useMemo, useState } from "react";
import useAuthStore from "@/stores/auth-store";
import { useLeadsStore } from "@/stores/leads.store";
import { useUserStore } from "@/stores/user-store"; // assuming this returns Admin users
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

// enums aligned with backend
type LeadStatus = "new" | "interview_scheduled" | "test_assigned" | "completed";
type LeadSource = "website" | "referral" | "linkedin" | "job_board" | "other";

export default function ReportsPage() {
  const { user, hasPermission } = useAuthStore();
  const { items: leads, fetch: fetchLeads, isLoading } = useLeadsStore();
  const { users, fetchUsers } = useUserStore();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  // initial loads
  useEffect(() => {
    fetchUsers?.().catch(() => {});
  }, [fetchUsers]);

  // server-side fetch whenever filters or role change
  useEffect(() => {
    if (!user) return;

    const params: Record<string, any> = {
      page: 1,
      limit: 100, // pull enough for charts; tune as needed
    };

    // role scoping
    if (user.role === "business_developer") params.createdBy = user.id;
    if (user.role === "developer") params.assignedTo = user.id;

    // date window (send ISO so backend can filter by createdAt)
    if (dateFrom) params.from = new Date(dateFrom).toISOString();
    if (dateTo) {
      // end of day inclusive
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      params.to = end.toISOString();
    }

    if (statusFilter !== "all") params.status = statusFilter;

    fetchLeads(params).catch(() => {});
  }, [user, dateFrom, dateTo, statusFilter, fetchLeads]);

  // client-side guard (in case backend doesn’t support some filters yet)
  const filteredLeads = useMemo(() => {
    if (!user) return [];
    // role guard (double-check)
    let list =
      user.role === "admin" || user.role === "superadmin"
        ? leads
        : user.role === "business_developer"
        ? leads.filter((l: any) => l.createdBy?._id === user.id)
        : leads.filter((l: any) => l.assignedTo?._id === user.id);

    if (dateFrom)
      list = list.filter(
        (l: any) => new Date(l.createdAt) >= new Date(dateFrom)
      );
    if (dateTo)
      list = list.filter(
        (l: any) => new Date(l.createdAt) <= new Date(dateTo + "T23:59:59.999")
      );

    if (statusFilter !== "all")
      list = list.filter((l: any) => l.status === statusFilter);

    return list;
  }, [leads, user, dateFrom, dateTo, statusFilter]);

  const statusData = useMemo(() => {
    const counts: Record<LeadStatus, number> = {
      new: 0,
      interview_scheduled: 0,
      test_assigned: 0,
      completed: 0,
    };
    filteredLeads.forEach((l: any) => {
      counts[l.status as LeadStatus] =
        (counts[l.status as LeadStatus] || 0) + 1;
    });

    return [
      { name: "New", value: counts.new, color: "#E2B144" },
      {
        name: "Interview Scheduled",
        value: counts.interview_scheduled,
        color: "#3B82F6",
      },
      { name: "Test Assigned", value: counts.test_assigned, color: "#F59E0B" },
      { name: "Completed", value: counts.completed, color: "#10B981" },
    ];
  }, [filteredLeads]);

  function sourceColor(src: LeadSource) {
    return (
      {
        website: "#4A171E",
        referral: "#E2B144",
        linkedin: "#0077B5",
        job_board: "#10B981",
        other: "#6B7280",
      } as Record<LeadSource, string>
    )[src];
  }

  const sourceData = useMemo(() => {
    const counts: Record<LeadSource, number> = {
      website: 0,
      referral: 0,
      linkedin: 0,
      job_board: 0,
      other: 0,
    };
    filteredLeads.forEach((l: any) => {
      counts[l.source as LeadSource]++;
    });
    return (Object.keys(counts) as LeadSource[]).map((k) => ({
      name: k.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: counts[k],
      color: sourceColor(k),
    }));
  }, [filteredLeads]);

  const userPerformance = useMemo(() => {
    if (!user) return [];
    console.log("Calculating user performance...");
    console.log("Users:", users);
    const reps = (users || []).filter(
      (u: any) => u.role === "business_developer" || u.role === "admin"
    );

    const rows = reps.map((u: any) => {
      const mine = filteredLeads.filter((l: any) => l.createdBy?._id === u._id);
      const total = mine.length;
      const newCount = mine.filter((l: any) => l.status === "new").length;
      const completed = mine.filter(
        (l: any) => l.status === "completed"
      ).length;
      const rate = total ? Math.round((completed / total) * 100) : 0;
      return {
        id: u._id,
        name: u.username,
        role: u.role,
        totalLeads: total,
        newLeads: newCount,
        completedLeads: completed,
        conversionRate: rate,
      };
    });

    return rows.sort((a, b) => b.totalLeads - a.totalLeads);
  }, [users, filteredLeads, user]);

  const exportToCSV = () => {
    const csvData = [
      [
        "Client Name",
        "Job Description",
        "Source",
        "Status",
        "Assigned To",
        "Created By",
        "Created Date",
      ],
      ...filteredLeads.map((l: any) => [
        l.clientName,
        l.jobDescription?.replace(/\n/g, " ") || "",
        l.source,
        l.status,
        l.assignedTo?.username || "Unassigned",
        l.createdBy?.username || "",
        new Date(l.createdAt).toLocaleDateString(),
      ]),
    ];
    const csvContent = csvData
      .map((row) =>
        row.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // loading / auth gates
  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-validiz-brown" />
        </div>
      </MainLayout>
    );
  }

  // if (!hasPermission({ action: "read", resource: "report" })) {
  //   return (
  //     <MainLayout>
  //       <div className="text-center py-12">
  //         <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
  //         <p className="text-gray-500">
  //           Access denied. Reports are only available to Admin and BD roles.
  //         </p>
  //       </div>
  //     </MainLayout>
  //   );
  // }

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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(v as LeadStatus | "all")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
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
          <StatCard
            title="Total Leads"
            value={filteredLeads.length}
            icon={<TrendingUp className="h-4 w-4 text-validiz-brown" />}
            subtitle="In selected period"
            valueClass="text-validiz-brown"
          />
          <StatCard
            title="Completed"
            value={
              filteredLeads.filter((l: any) => l.status === "completed").length
            }
            icon={<Users className="h-4 w-4 text-green-600" />}
            subtitle={`${
              filteredLeads.length > 0
                ? Math.round(
                    (filteredLeads.filter((l: any) => l.status === "completed")
                      .length /
                      filteredLeads.length) *
                      100
                  )
                : 0
            }% conversion rate`}
            valueClass="text-green-600"
          />
          <StatCard
            title="In Progress"
            value={
              filteredLeads.filter((l: any) =>
                ["interview_scheduled", "test_assigned"].includes(l.status)
              ).length
            }
            icon={<BarChart3 className="h-4 w-4 text-blue-600" />}
            subtitle="Active opportunities"
            valueClass="text-blue-600"
          />
          <StatCard
            title="New Leads"
            value={filteredLeads.filter((l: any) => l.status === "new").length}
            icon={<PieChartIcon className="h-4 w-4 text-validiz-mustard" />}
            subtitle="Awaiting action"
            valueClass="text-validiz-mustard"
          />
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
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    dataKey="value"
                  >
                    {sourceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* User Performance */}
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
                  {userPerformance.map((u) => (
                    <TableRow key={u.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            u.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {u.role.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {u.totalLeads}
                      </TableCell>
                      <TableCell>{u.newLeads}</TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {u.completedLeads}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-validiz-mustard h-2 rounded-full"
                              style={{ width: `${u.conversionRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {u.conversionRate}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {userPerformance.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        {isLoading ? "Loading…" : "No data for current filters"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

/* ---------- Small stat card ---------- */
function StatCard({
  title,
  value,
  icon,
  subtitle,
  valueClass,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass || ""}`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
