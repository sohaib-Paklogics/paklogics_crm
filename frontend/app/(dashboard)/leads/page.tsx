"use client";

import { useState, useEffect } from "react";
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
import { useLeadStore } from "@/stores/lead-store";
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { MainLayout } from "@/components/layout/main-layout";

export default function LeadsPage() {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    leads,
    isLoading,
    error,
    pagination,
    fetchLeads,
    deleteLead,
    setError,
  } = useLeadStore();

  useEffect(() => {
    loadLeads();
  }, [currentPage, statusFilter, sourceFilter]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error, setError]);

  const loadLeads = async () => {
    const params = {
      page: currentPage,
      limit: 10,
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(sourceFilter !== "all" && { source: sourceFilter }),
    };
    await fetchLeads(params);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadLeads();
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      await deleteLead(id);
      toast.success("Lead deleted successfully");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (!searchTerm) return true;
    return (
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.jobDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Interview Scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "Test Assigned":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <CardContent className="flex gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="sm">
                Search
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Interview Scheduled">
                  Interview Scheduled
                </SelectItem>
                <SelectItem value="Test Assigned">Test Assigned</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Indeed">Indeed</SelectItem>
                <SelectItem value="Company Website">Company Website</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Leads ({pagination?.total})
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
                {filteredLeads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell className="font-medium">
                      {lead.clientName}
                    </TableCell>
                    <TableCell>{lead.jobDescription}</TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.assignedTo || "Unassigned"}</TableCell>
                    <TableCell>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/leads/${lead._id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLead(lead._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {/* {pagination?.totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(
                      Math.min(pagination.totalPages, currentPage + 1)
                    )
                  }
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )} */}
          </CardContent>
        </Card>

        <AddLeadModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSuccess={() => {
            setIsAddModalOpen(false);
            loadLeads();
            toast.success("Lead created successfully");
          }}
        />
      </div>
    </MainLayout>
  );
}
