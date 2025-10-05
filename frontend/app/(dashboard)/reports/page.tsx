"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import useAuthStore from "@/stores/auth.store";
import { useLeadsStore } from "@/stores/leads.store";
import { useUserStore } from "@/stores/user-store";
import { useStagesStore } from "@/stores/stages.store";

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

// Only source enum remains the same
type LeadSource = "website" | "referral" | "linkedin" | "job_board" | "other";

export default function ReportsPage() {
  const { user, hasPermission } = useAuthStore();
  const {
    items: leads,
    fetch: fetchLeads,
    isLoading,
    reset: resetFilters,
  } = useLeadsStore();
  const { users, fetchUsers } = useUserStore();
  const {
    items: stages,
    fetch: fetchStages,
    isLoading: stagesLoading,
  } = useStagesStore();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [stageFilter, setStageFilter] = useState<string | "all">("all");

  // initial loads
  useEffect(() => {
    fetchUsers?.().catch(() => {});
    fetchStages?.().catch(() => {});
  }, [fetchUsers, fetchStages]);

  // helpers
  const getLeadStageId = useCallback((l: any) => {
    return typeof l.stage === "string" ? l.stage : l.stage?._id;
  }, []);

  const stageMap = useMemo(() => {
    const m = new Map<string, { _id: string; name: string; color?: string }>();
    (stages || []).forEach((s: any) => m.set(String(s._id), s));
    return m;
  }, [stages]);

  const findStageIdByName = useCallback(
    (name: string) => {
      const target = name.trim().toLowerCase();
      const hit = (stages || []).find(
        (s: any) =>
          String(s.name || "")
            .trim()
            .toLowerCase() === target
      );
      return hit ? String(hit._id) : null;
    },
    [stages]
  );

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

    // date window (Joi.date -> send ISO date strings)
    if (dateFrom) {
      const start = new Date(dateFrom);
      start.setHours(0, 0, 0, 0);
      params.dateFrom = start.toISOString();
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      params.dateTo = end.toISOString();
    }

    // stage filter
    if (stageFilter !== "all") params.stage = stageFilter;

    fetchLeads(params).catch(() => {});
  }, [user, dateFrom, dateTo, stageFilter, fetchLeads]);

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

    if (stageFilter !== "all")
      list = list.filter((l: any) => String(getLeadStageId(l)) === stageFilter);

    return list;
  }, [leads, user, dateFrom, dateTo, stageFilter, getLeadStageId]);

  // Stage-aware chart data
  const stageData = useMemo(() => {
    // Prefer known stages list; fallback to what appears in leads
    const baseStages =
      (stages && stages.length
        ? stages.map((s: any) => ({
            id: String(s._id),
            name: String(s.name || ""),
            color: s.color || "#4A171E",
          }))
        : Array.from(
            new Set(filteredLeads.map((l: any) => String(getLeadStageId(l))))
          ).map((id) => ({
            id,
            name: stageMap.get(id)?.name || "Unknown",
            color: stageMap.get(id)?.color || "#4A171E",
          }))) || [];

    const counts: Record<string, number> = {};
    filteredLeads.forEach((l: any) => {
      const sid = String(getLeadStageId(l) || "");
      counts[sid] = (counts[sid] || 0) + 1;
    });

    return baseStages.map((s) => ({
      id: s.id,
      name: s.name,
      value: counts[s.id] || 0,
      color: s.color,
    }));
  }, [filteredLeads, stages, stageMap, getLeadStageId]);

  // Source pie data stays the same
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
      counts[(l.source as LeadSource) || "other"]++;
    });
    return (Object.keys(counts) as LeadSource[]).map((k) => ({
      name: k.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: counts[k],
      color: sourceColor(k),
    }));
  }, [filteredLeads]);

  // Stage semantics for stats
  const completedStageId = findStageIdByName("completed");
  const newStageId = findStageIdByName("new");

  const newCount = useMemo(
    () =>
      filteredLeads.filter(
        (l: any) => newStageId && String(getLeadStageId(l)) === newStageId
      ).length,
    [filteredLeads, newStageId, getLeadStageId]
  );

  const completedCount = useMemo(
    () =>
      filteredLeads.filter(
        (l: any) =>
          completedStageId && String(getLeadStageId(l)) === completedStageId
      ).length,
    [filteredLeads, completedStageId, getLeadStageId]
  );

  const inProgressCount = Math.max(
    0,
    filteredLeads.length - newCount - completedCount
  );

  // User performance (by createdBy), using stage semantics
  const userPerformance = useMemo(() => {
    if (!user) return [];
    const reps = (users || []).filter(
      (u: any) => u.role === "business_developer" || u.role === "admin"
    );

    const rows = reps.map((u: any) => {
      const mine = filteredLeads.filter((l: any) => l.createdBy?._id === u._id);
      const total = mine.length;
      const newLeads = mine.filter(
        (l: any) => newStageId && String(getLeadStageId(l)) === newStageId
      ).length;
      const completedLeads = mine.filter(
        (l: any) =>
          completedStageId && String(getLeadStageId(l)) === completedStageId
      ).length;
      const conversionRate = total
        ? Math.round((completedLeads / total) * 100)
        : 0;

      return {
        id: u._id,
        name: u.username,
        role: u.role,
        totalLeads: total,
        newLeads,
        completedLeads,
        conversionRate,
      };
    });

    return rows.sort((a, b) => b.totalLeads - a.totalLeads);
  }, [
    users,
    filteredLeads,
    user,
    newStageId,
    completedStageId,
    getLeadStageId,
  ]);

  const exportToCSV = () => {
    const csvData = [
      [
        "Client Name",
        "Job Description",
        "Source",
        "Stage",
        "Assigned To",
        "Created By",
        "Created Date",
      ],
      ...filteredLeads.map((l: any) => [
        l.clientName,
        l.jobDescription?.replace(/\n/g, " ") || "",
        l.source,
        stageMap.get(String(getLeadStageId(l)))?.name || "",
        l.assignedTo?.username || "Unassigned",
        l.createdBy?.username || "",
        new Date(l.createdAt).toLocaleDateString(),
      ]),
    ];
    const csvContent = csvData
      .map((row) =>
        row.map((f) => `"${String(f ?? "").replace(/"/g, '""')}"`).join(",")
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

  if (!hasPermission({ action: "read", resource: "reports" })) {
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

              {/* Stage filter (dynamic) */}
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select
                  value={stageFilter}
                  onValueChange={(v) => setStageFilter(v as string | "all")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {(stages || []).map((s: any) => (
                      <SelectItem key={String(s._id)} value={String(s._id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => resetFilters()}
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
            value={completedCount}
            icon={<Users className="h-4 w-4 text-green-600" />}
            subtitle={`${
              filteredLeads.length > 0
                ? Math.round((completedCount / filteredLeads.length) * 100)
                : 0
            }% conversion rate`}
            valueClass="text-green-600"
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            icon={<BarChart3 className="h-4 w-4 text-blue-600" />}
            subtitle="Active opportunities"
            valueClass="text-blue-600"
          />
          <StatCard
            title="New Leads"
            value={newCount}
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
                Leads by Stage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {stageData.map((s, i) => (
                      <Cell key={i} fill={s.color || "#4A171E"} />
                    ))}
                  </Bar>
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
                        {isLoading || stagesLoading
                          ? "Loading…"
                          : "No data for current filters"}
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
