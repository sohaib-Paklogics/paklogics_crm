"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { useAuthStore, hasPermission } from "@/lib/stores/auth-store"
import { useLeadStore } from "@/lib/stores/lead-store"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, User } from "lucide-react"
import type { Lead, LeadStatus } from "@/lib/types"

const columns = [
  { id: "new", title: "New", color: "bg-validiz-mustard" },
  { id: "interview_scheduled", title: "Interview Scheduled", color: "bg-blue-500" },
  { id: "test_assigned", title: "Test Assigned", color: "bg-orange-500" },
  { id: "completed", title: "Completed", color: "bg-green-500" },
]

export default function KanbanPage() {
  const { user } = useAuthStore()
  const { leads, updateLeadStatus } = useLeadStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Add loading check
  if (!user || !mounted) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-validiz-brown"></div>
        </div>
      </MainLayout>
    )
  }

  const canDragDrop = hasPermission(user.role, "update", "leads")

  // Filter leads based on user role
  const filteredLeads =
    user.role === "admin"
      ? leads
      : user.role === "bd"
        ? leads.filter((lead) => lead.createdById === user.id)
        : leads.filter((lead) => lead.assignedDeveloperId === user.id)

  const getLeadsByStatus = (status: LeadStatus) => {
    return filteredLeads.filter((lead) => lead.status === status)
  }

  const onDragEnd = (result: DropResult) => {
    if (!canDragDrop) return

    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId as LeadStatus
    updateLeadStatus(draggableId, newStatus)
  }

  const LeadCard = ({ lead, index }: { lead: Lead; index: number }) => (
    <Draggable draggableId={lead.id} index={index} isDragDisabled={!canDragDrop}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? "rotate-2" : ""}`}
        >
          <Card className={`cursor-pointer transition-all hover:shadow-md ${canDragDrop ? "hover:scale-105" : ""}`}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-validiz-brown text-sm">{lead.clientName}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">{lead.jobDescription}</p>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs capitalize">
                    {lead.source.replace("_", " ")}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {lead.assignedDeveloper ? (
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-validiz-brown text-white">
                            {lead.assignedDeveloper.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600">{lead.assignedDeveloper.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-gray-400">
                        <User className="h-4 w-4" />
                        <span className="text-xs">Unassigned</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500">Created {new Date(lead.createdAt).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-validiz-brown">Lead Pipeline</h1>
            <p className="text-gray-600 mt-1">
              Track leads through your sales pipeline
              {!canDragDrop && " (Read-only view)"}
            </p>
          </div>
          {hasPermission(user.role, "create", "leads") && (
            <Button className="bg-validiz-brown hover:bg-validiz-brown/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          )}
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => {
              const columnLeads = getLeadsByStatus(column.id as LeadStatus)
              return (
                <div key={column.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${column.color}`} />
                      <h3 className="font-semibold text-validiz-brown">{column.title}</h3>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      {columnLeads.length}
                    </Badge>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[500px] p-3 rounded-lg border-2 border-dashed transition-colors ${
                          snapshot.isDraggingOver
                            ? "border-validiz-mustard bg-validiz-mustard/5"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        {columnLeads.map((lead, index) => (
                          <LeadCard key={lead.id} lead={lead} index={index} />
                        ))}
                        {provided.placeholder}

                        {columnLeads.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                            <div className="text-center">
                              <p className="text-sm">No leads</p>
                              <p className="text-xs mt-1">
                                {canDragDrop ? "Drag leads here" : "No leads in this stage"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-validiz-brown">Pipeline Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {columns.map((column) => {
                const count = getLeadsByStatus(column.id as LeadStatus).length
                const percentage = filteredLeads.length > 0 ? Math.round((count / filteredLeads.length) * 100) : 0
                return (
                  <div key={column.id} className="text-center">
                    <div className={`w-4 h-4 rounded-full ${column.color} mx-auto mb-2`} />
                    <p className="text-2xl font-bold text-validiz-brown">{count}</p>
                    <p className="text-sm text-gray-600">{column.title}</p>
                    <p className="text-xs text-gray-500">{percentage}% of total</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
