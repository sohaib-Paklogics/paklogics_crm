"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Filter, Eye, Trash2 } from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddLeadModal } from "@/components/modals/add-lead-modal";

// ✅ Uses the store API we implemented earlier
import { useLeadsStore } from "@/stores/leads.store";

type LeadStatus =
  | "all"
  | "new"
  | "interview_scheduled"
  | "test_assigned"
  | "completed";
type LeadSource =
  | "all"
  | "website"
  | "referral"
  | "linkedin"
  | "job_board"
  | "other";

export default function LeadsPage() {
  const router = useRouter();

  // UI state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus>("all");
  const [sourceFilter, setSourceFilter] = useState<LeadSource>("all");

  // Store
  const { items, isLoading, pagination, filters, fetch, remove, setFilters } =
    useLeadsStore();

  // Load on mount & whenever filters change
  useEffect(() => {
    fetch({ page: filters.page ?? 1, limit: filters.limit ?? 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handy memo for total
  const totalCount = useMemo(() => pagination?.total ?? 0, [pagination]);

  // Actions
  const loadLeads = async (override?: Partial<typeof filters>) => {
    const merged = {
      ...filters,
      ...(searchTerm ? { search: searchTerm } : { search: "" }),
      status: statusFilter,
      ...(sourceFilter !== "all"
        ? { source: sourceFilter }
        : { source: undefined }),
      ...override,
    };
    setFilters(merged);
    await fetch(merged);
  };

  const handleSearch = async () => {
    await loadLeads({ page: 1 });
  };

  const handleDeleteLead = async (id: string) => {
    const ok = confirm("Are you sure you want to delete this lead?");
    if (!ok) return;
    const success = await remove(id);
    if (success) {
      await loadLeads();
    }
  };

  const onChangePage = async (nextPage: number) => {
    if (!pagination) return;
    if (nextPage < 1 || nextPage > (pagination.pages || 1)) return;
    await loadLeads({ page: nextPage });
  };

  // UI helpers
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      interview_scheduled: "bg-yellow-100 text-yellow-800",
      test_assigned: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  const prettyStatus = (status: string) => {
    switch (status) {
      case "new":
        return "New";
      case "interview_scheduled":
        return "Interview Scheduled";
      case "test_assigned":
        return "Test Assigned";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const prettySource = (source: string) => {
    switch (source) {
      case "website":
        return "Website";
      case "referral":
        return "Referral";
      case "linkedin":
        return "LinkedIn";
      case "job_board":
        return "Job Board";
      case "other":
        return "Other";
      default:
        return source;
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-muted-foreground">
              Manage your leads and opportunities
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-col md:flex-row">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="sm">
                Search
              </Button>
            </div>

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val as LeadStatus);
                // reset to page 1 when filter changes
                loadLeads({ page: 1, status: val as LeadStatus });
              }}
            >
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Filter by status" />
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

            <Select
              value={sourceFilter}
              onValueChange={(val) => {
                setSourceFilter(val as LeadSource);
                loadLeads({
                  page: 1,
                  source: val === "all" ? undefined : (val as LeadSource),
                });
              }}
            >
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="job_board">Job Board</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Leads ({totalCount})
              {isLoading && (
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading...
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Job Description</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell className="font-medium">
                      {lead.clientName}
                    </TableCell>
                    <TableCell
                      className="max-w-[420px] truncate"
                      title={lead.jobDescription}
                    >
                      {lead.jobDescription}
                    </TableCell>
                    <TableCell>{prettySource(lead.source)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(lead.status)}>
                        {prettyStatus(lead.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.assignedTo?.username ?? "Unassigned"}
                    </TableCell>
                    <TableCell>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/leads/${lead._id}`)}
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLead(lead._id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {!isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      No leads found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination?.page ?? 1} of {pagination?.pages ?? 1}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChangePage((pagination?.page ?? 1) - 1)}
                  disabled={!pagination?.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChangePage((pagination?.page ?? 1) + 1)}
                  disabled={!pagination?.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <AddLeadModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSuccess={async () => {
            setIsAddModalOpen(false);
            await loadLeads({ page: 1 }); // refresh list
            toast.success("Lead created successfully");
          }}
        />
      </div>
    </MainLayout>
  );
}
