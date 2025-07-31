"use client"

import { useState } from "react"
import { useAuthStore, hasPermission } from "@/lib/stores/auth-store"
import { useLeadStore } from "@/lib/stores/lead-store"
import { useUserStore } from "@/lib/stores/user-store"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, FileText } from "lucide-react"
import type { CalendarEvent } from "@/lib/types"

// Mock events data
const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Interview with TechCorp",
    description: "Technical interview for React Developer position",
    startTime: "2024-02-01T14:00:00Z",
    endTime: "2024-02-01T15:00:00Z",
    leadId: "1",
    developerId: "3",
    createdById: "2",
    type: "interview",
  } as CalendarEvent,
  {
    id: "2",
    title: "Coding Test Review",
    description: "Review coding test submission",
    startTime: "2024-02-02T10:00:00Z",
    endTime: "2024-02-02T11:00:00Z",
    leadId: "3",
    developerId: "3",
    createdById: "1",
    type: "test",
  } as CalendarEvent,
]

export default function CalendarPage() {
  const { user } = useAuthStore()
  const { leads } = useLeadStore()
  const { users } = useUserStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [events] = useState<CalendarEvent[]>(mockEvents)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Add loading check
  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-validiz-brown"></div>
        </div>
      </MainLayout>
    )
  }

  const canCreateEvents = hasPermission(user.role, "create", "calendar")
  const developers = users.filter((u) => u.role === "developer")

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "interview":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "test":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "availability":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const days = getDaysInMonth(currentDate)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-validiz-brown">Calendar</h1>
            <p className="text-gray-600 mt-1">Schedule interviews, tests, and track availability</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                className={view === "month" ? "bg-validiz-brown hover:bg-validiz-brown/90" : ""}
              >
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                className={view === "week" ? "bg-validiz-brown hover:bg-validiz-brown/90" : ""}
              >
                Week
              </Button>
              <Button
                variant={view === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("day")}
                className={view === "day" ? "bg-validiz-brown hover:bg-validiz-brown/90" : ""}
              >
                Day
              </Button>
            </div>
            {canCreateEvents && (
              <Button onClick={() => setIsAddEventOpen(true)} className="bg-validiz-brown hover:bg-validiz-brown/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            )}
          </div>
        </div>

        {/* Calendar Navigation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold text-validiz-brown">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="border-validiz-brown text-validiz-brown hover:bg-validiz-brown hover:text-white"
            >
              Today
            </Button>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="h-24 p-1" />
                }

                const dayEvents = getEventsForDate(day)
                const isToday =
                  day.getDate() === new Date().getDate() &&
                  day.getMonth() === new Date().getMonth() &&
                  day.getFullYear() === new Date().getFullYear()

                return (
                  <div
                    key={index}
                    className={`h-24 p-1 border border-gray-200 ${
                      isToday ? "bg-validiz-mustard/10 border-validiz-mustard" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-validiz-brown" : "text-gray-700"}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm ${getEventTypeColor(event.type)}`}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs opacity-75">{formatTime(event.startTime)}</div>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-validiz-brown">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        event.type === "interview"
                          ? "bg-blue-500"
                          : event.type === "test"
                            ? "bg-orange-500"
                            : "bg-green-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-validiz-brown">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(event.startTime).toLocaleDateString()} at {formatTime(event.startTime)}
                          </span>
                        </div>
                        {event.leadId && (
                          <div className="flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>Lead #{event.leadId}</span>
                          </div>
                        )}
                        {event.developerId && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{users.find((u) => u.id === event.developerId)?.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No upcoming events</p>
                  <p className="text-sm">Schedule interviews and tests to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Event Modal */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-validiz-brown">Add New Event</DialogTitle>
            <DialogDescription>Schedule an interview, test, or mark availability</DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter event title"
                  className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Event Type *</Label>
                <Select>
                  <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="availability">Availability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Event description (optional)"
                className="focus:ring-validiz-mustard focus:border-validiz-mustard"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Date & Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Date & Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leadId">Related Lead</Label>
                <Select>
                  <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
                    <SelectValue placeholder="Select lead (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.clientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="developerId">Assign Developer</Label>
                <Select>
                  <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
                    <SelectValue placeholder="Select developer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {developers.map((developer) => (
                      <SelectItem key={developer.id} value={developer.id}>
                        {developer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddEventOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-validiz-brown hover:bg-validiz-brown/90">
                Create Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-validiz-brown">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-sm text-gray-800 mt-1">{selectedEvent.description || "No description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Start Time</Label>
                  <p className="text-sm text-gray-800 mt-1">{new Date(selectedEvent.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">End Time</Label>
                  <p className="text-sm text-gray-800 mt-1">{new Date(selectedEvent.endTime).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Type</Label>
                <Badge className={`mt-1 ${getEventTypeColor(selectedEvent.type)}`}>{selectedEvent.type}</Badge>
              </div>
              {selectedEvent.leadId && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Related Lead</Label>
                  <p className="text-sm text-gray-800 mt-1">
                    {leads.find((l) => l.id === selectedEvent.leadId)?.clientName || `Lead #${selectedEvent.leadId}`}
                  </p>
                </div>
              )}
              {selectedEvent.developerId && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Assigned Developer</Label>
                  <p className="text-sm text-gray-800 mt-1">
                    {users.find((u) => u.id === selectedEvent.developerId)?.name || "Unknown"}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
