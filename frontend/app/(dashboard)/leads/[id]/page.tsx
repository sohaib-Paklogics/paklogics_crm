"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useLeadStore } from "@/stores/lead-store";
import { useUserStore } from "@/stores/user-store";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Upload,
  Download,
  MessageCircle,
  FileText,
  Clock,
} from "lucide-react";
import Link from "next/link";
import type {
  Lead,
  ChatMessage,
  Note,
  HistoryEntry,
  Attachment,
} from "@/types/types";
import useAuthStore from "@/stores/auth-store";

export default function LeadDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leadId = params.id as string;
  const initialTab = searchParams.get("tab") || "details";
  const isEditMode = searchParams.get("edit") === "true";

  const { user, hasPermission } = useAuthStore();
  const { leads, selectedLead, setSelectedLead, updateLead } = useLeadStore();
  const { users } = useUserStore();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [newMessage, setNewMessage] = useState("");
  const [newNote, setNewNote] = useState("");

  // Mock data for demo
  const [chatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      leadId: leadId,
      message:
        "Initial contact made with the client. They seem very interested in our services.",
      userId: "2",
      user: users.find((u) => u.id === "2") || users[0],
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      leadId: leadId,
      message:
        "I've reviewed the job requirements. This looks like a perfect match for my experience.",
      userId: "3",
      user: users.find((u) => u.id === "3") || users[0],
      createdAt: "2024-01-15T11:15:00Z",
    },
  ]);

  const [notes] = useState<Note[]>([
    {
      id: "1",
      leadId: leadId,
      content:
        "Client is looking for someone with 5+ years of React experience. They have a tight deadline of 3 months for the project completion.",
      createdById: "2",
      createdBy: users.find((u) => u.id === "2") || users[0],
      createdAt: "2024-01-15T12:00:00Z",
      updatedAt: "2024-01-15T12:00:00Z",
    },
  ]);

  const [history] = useState<HistoryEntry[]>([
    {
      id: "1",
      leadId: leadId,
      action: "Status Updated",
      details: "Status changed from 'New' to 'Interview Scheduled'",
      userId: "2",
      user: users.find((u) => u.id === "2") || users[0],
      createdAt: "2024-01-16T09:15:00Z",
    },
    {
      id: "2",
      leadId: leadId,
      action: "Developer Assigned",
      details: "Jane Developer assigned to this lead",
      userId: "1",
      user: users.find((u) => u.id === "1") || users[0],
      createdAt: "2024-01-15T14:30:00Z",
    },
  ]);

  const [attachments] = useState<Attachment[]>([
    {
      id: "1",
      leadId: leadId,
      fileName: "job-requirements.pdf",
      fileUrl: "/placeholder-file.pdf",
      fileSize: 245760,
      uploadedById: "2",
      uploadedBy: users.find((u) => u.id === "2") || users[0],
      uploadedAt: "2024-01-15T13:00:00Z",
    },
  ]);

  const developers = users.filter((u) => u.role === "developer");

  useEffect(() => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setEditData(lead);
    }
  }, [leadId, leads, setSelectedLead]);

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-validiz-brown"></div>
        </div>
      </MainLayout>
    );
  }

  if (!selectedLead) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Lead not found</p>
          <Link href="/leads">
            <Button className="mt-4 bg-validiz-brown hover:bg-validiz-brown/90">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const canEdit =
    hasPermission({ action: "read", resource: "users" }) &&
    (user.role === "admin" || selectedLead.createdById === user.id);
  const canViewNotes = hasPermission({ action: "read", resource: "users" });
  const canAddNotes = hasPermission({ action: "read", resource: "users" });

  const handleSave = async () => {
    try {
      updateLead(leadId, editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send to the server
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In a real app, this would send to the server
      console.log("Adding note:", newNote);
      setNewNote("");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/leads">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leads
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-validiz-brown">
                {selectedLead.clientName}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  className={
                    selectedLead.status === "new"
                      ? "bg-validiz-mustard text-validiz-brown"
                      : ""
                  }
                >
                  {selectedLead.status.replace("_", " ")}
                </Badge>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600 capitalize">
                  {selectedLead.source.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
          {canEdit && (
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-validiz-brown hover:bg-validiz-brown/90"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-validiz-brown hover:bg-validiz-brown/90"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Lead
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-validiz-brown">
                  Lead Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={
                        isEditing
                          ? editData.clientName || ""
                          : selectedLead.clientName
                      }
                      onChange={(e) =>
                        setEditData({ ...editData, clientName: e.target.value })
                      }
                      disabled={!isEditing}
                      className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Lead Source</Label>
                    <Select
                      value={
                        isEditing
                          ? editData.source || selectedLead.source
                          : selectedLead.source
                      }
                      onValueChange={(value) =>
                        setEditData({ ...editData, source: value as any })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="job_board">Job Board</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    value={
                      isEditing
                        ? editData.jobDescription || ""
                        : selectedLead.jobDescription
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        jobDescription: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    rows={4}
                    className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={
                        isEditing
                          ? editData.status || selectedLead.status
                          : selectedLead.status
                      }
                      onValueChange={(value) =>
                        setEditData({ ...editData, status: value as any })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="interview_scheduled">
                          Interview Scheduled
                        </SelectItem>
                        <SelectItem value="test_assigned">
                          Test Assigned
                        </SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedDeveloper">
                      Assigned Developer
                    </Label>
                    <Select
                      value={
                        isEditing
                          ? editData.assignedDeveloperId || "unassigned"
                          : selectedLead.assignedDeveloperId || "unassigned"
                      }
                      onValueChange={(value) =>
                        setEditData({
                          ...editData,
                          assignedDeveloperId:
                            value === "unassigned" ? undefined : value,
                        })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
                        <SelectValue placeholder="Select developer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {developers.map((developer) => (
                          <SelectItem key={developer.id} value={developer.id}>
                            {developer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-validiz-brown">
                  Attachments
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-validiz-brown hover:bg-validiz-brown/90"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-validiz-brown" />
                        <div>
                          <p className="font-medium">{attachment.fileName}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(attachment.fileSize)} • Uploaded by{" "}
                            {attachment.uploadedBy.name} •{" "}
                            {new Date(
                              attachment.uploadedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                  {attachments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>No attachments yet</p>
                      <p className="text-sm">
                        Upload files to share with the team
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-validiz-brown">
                  Activity History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {history.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0">
                          <Clock className="h-5 w-5 text-validiz-brown mt-0.5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{entry.action}</p>
                          <p className="text-sm text-gray-600">
                            {entry.details}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {entry.user.name} •{" "}
                            {new Date(entry.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Chat Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-validiz-brown">
              <MessageCircle className="mr-2 h-5 w-5" />
              Team Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] mb-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-validiz-brown text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {message.user.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm">
                          {message.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {message.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="focus:ring-validiz-mustard focus:border-validiz-mustard"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-validiz-brown hover:bg-validiz-brown/90"
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes Section */}
        {canViewNotes && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-validiz-brown">Notes</CardTitle>
              {canAddNotes && (
                <Button
                  size="sm"
                  className="bg-validiz-brown hover:bg-validiz-brown/90"
                >
                  Add Note
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-700">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {note.createdBy.name} •{" "}
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
                {canAddNotes && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                    />
                    <Button
                      onClick={handleAddNote}
                      size="sm"
                      className="bg-validiz-brown hover:bg-validiz-brown/90"
                    >
                      Add Note
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
