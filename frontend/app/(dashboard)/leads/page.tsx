"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Filter, Eye, Trash2 } from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import api from "@/lib/api"; // <-- for fetching stages
import { useLeadsStore } from "@/stores/leads.store";
import type { LeadSource, Stage as StageType } from "@/types/lead";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import useAuthStore from "@/stores/auth-store";

export default function LeadsPage() {
  const router = useRouter();

  // UI state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<LeadSource>("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
  const [confirmTargetName, setConfirmTargetName] = useState<string>("");

  const [stages, setStages] = useState<StageType[]>([]);
  const { user, fetchUser } = useAuthStore();
  // Store
  const {
    items,
    isLoading,
    pagination,
    filters,
    fetch,
    changeStatus,
    setFilters,
    reset,
  } = useLeadsStore();

  // Load stages once
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const { data } = await api.get<{ success: boolean; data: StageType[] }>(
          "/stages"
        );
        if (data?.success) setStages(data.data || []);
      } catch {
        // silent; keep dropdown usable with just "All Stages"
      }
    };
    fetchStages();
  }, []);

  // Load leads on mount
  useEffect(() => {
    fetch({ page: filters.page ?? 1, limit: filters.limit ?? 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // total
  const totalCount = useMemo(() => pagination?.total ?? 0, [pagination]);

  // Actions
  const loadLeads = async (override?: Partial<typeof filters>) => {
    const merged = {
      ...filters,
      ...(searchTerm ? { search: searchTerm } : { search: "" }),
      // use stage instead of status
      stage: stageFilter, // "all" or stage _id
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

  // OPEN confirm dialog instead of window.confirm
  const requestDelete = (id: string, name: string) => {
    setConfirmTargetId(id);
    setConfirmTargetName(name);
    setConfirmOpen(true);
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (!confirmTargetId) return;
    const success = await changeStatus(confirmTargetId, "deleted");
    setConfirmOpen(false);
    setConfirmTargetId(null);
    if (success) {
      toast.success("Lead deleted");
      await loadLeads();
    } else {
      toast.error("Failed to delete lead");
    }
  };

  const onChangePage = async (nextPage: number) => {
    if (!pagination) return;
    if (nextPage < 1 || nextPage > (pagination.pages || 1)) return;
    await loadLeads({ page: nextPage });
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

  const stageName = (stage?: StageType | string) =>
    typeof stage === "object"
      ? stage?.name
      : stages.find((s) => s._id === stage)?.name ||
        (stage ? String(stage) : "—");

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
          {user?.role !== "developer" && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          )}
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
              <Button variant={"outline"} onClick={() => reset()} size="sm">
                Reset
              </Button>
            </div>

            {/* Stage filter (replaces Status) */}
            <Select
              value={stageFilter}
              onValueChange={(val) => {
                setStageFilter(val as string);
                // reset to page 1 on change
                loadLeads({ page: 1, stage: val });
              }}
            >
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map((s) => (
                  <SelectItem className="capitalize" key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
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
                  <TableHead>Stage</TableHead>
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

                    {/* Stage */}
                    <TableCell>
                      {<StatusBadge status={stageName(lead.stage)} />}
                    </TableCell>

                    <TableCell className="capitalize">
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
                          onClick={() =>
                            requestDelete(lead._id, lead.clientName)
                          }
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
                      colSpan={8}
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
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete Lead"
          description={
            confirmTargetName
              ? `Are you sure you want to delete "${confirmTargetName}"? This action cannot be undone.`
              : "Are you sure you want to delete this lead? This action cannot be undone."
          }
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={handleConfirmDelete}
        />
      </div>
    </MainLayout>
  );
}
