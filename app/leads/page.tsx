"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, hasPermission } from "@/lib/stores/auth-store"
import { useLeadStore } from "@/lib/stores/lead-store"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AddLeadModal } from "@/components/modals/add-lead-modal"
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import type { LeadStatus, LeadSource } from "@/lib/types"

export default function LeadsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { leads, deleteLead } = useLeadStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all")
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filteredLeads = useMemo(() => {
    if (!user) return []

    let filtered = leads

    // Role-based filtering
    if (user.role === "bd") {
      filtered = filtered.filter((lead) => lead.createdById === user.id)
    } else if (user.role === "developer") {
      filtered = filtered.filter((lead) => lead.assignedDeveloperId === user.id)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (lead) =>
          lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.jobDescription.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter)
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((lead) => lead.source === sourceFilter)
    }

    return filtered
  }, [leads, user, searchTerm, statusFilter, sourceFilter])

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case "new":
        return "bg-validiz-mustard text-validiz-brown"
      case "interview_scheduled":
        return "bg-blue-100 text-blue-800"
      case "test_assigned":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleView = (leadId: string) => {
    router.push(`/leads/${leadId}`)
  }

  const handleEdit = (leadId: string) => {
    router.push(`/leads/${leadId}?tab=details&edit=true`)
  }

  const handleDelete = (leadId: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      deleteLead(leadId)
    }
  }

  const canCreateLead = user ? hasPermission(user.role, "create", "leads") : false
  const canEditLead = user ? hasPermission(user.role, "update", "leads") : false
  const canDeleteLead = user ? hasPermission(user.role, "delete", "leads") : false

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-validiz-brown">Leads</h1>
            <p className="text-gray-600 mt-1">Manage your leads and opportunities</p>
          </div>
          {canCreateLead && (
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-validiz-brown hover:bg-validiz-brown/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-validiz-brown">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus:ring-validiz-mustard focus:border-validiz-mustard"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | "all")}>
                <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="test_assigned">Test Assigned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as LeadSource | "all")}>
                <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
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
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setSourceFilter("all")
                }}
                className="border-validiz-brown text-validiz-brown hover:bg-validiz-brown hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-validiz-brown font-semibold">Client Name</TableHead>
                    <TableHead className="text-validiz-brown font-semibold">Job Description</TableHead>
                    <TableHead className="text-validiz-brown font-semibold">Source</TableHead>
                    <TableHead className="text-validiz-brown font-semibold">Status</TableHead>
                    <TableHead className="text-validiz-brown font-semibold">Assigned Developer</TableHead>
                    <TableHead className="text-validiz-brown font-semibold">Created</TableHead>
                    <TableHead className="text-validiz-brown font-semibold w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{lead.clientName}</TableCell>
                      <TableCell className="max-w-xs truncate" title={lead.jobDescription}>
                        {lead.jobDescription}
                      </TableCell>
                      <TableCell className="capitalize">{lead.source.replace("_", " ")}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeVariant(lead.status)}>{lead.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>{lead.assignedDeveloper?.name || "Unassigned"}</TableCell>
                      <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(lead.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            {canEditLead && (
                              <DropdownMenuItem onClick={() => handleEdit(lead.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDeleteLead && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(lead.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredLeads.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No leads found matching your criteria.</p>
                {canCreateLead && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 bg-validiz-brown hover:bg-validiz-brown/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Lead
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isAddModalOpen && <AddLeadModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />}
    </MainLayout>
  )
}
