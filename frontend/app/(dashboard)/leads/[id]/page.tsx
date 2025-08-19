"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Upload,
  Download,
  MessageCircle,
  FileText,
} from "lucide-react";

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

// Stores
import useAuthStore from "@/stores/auth-store";
import { useLeadsStore } from "@/stores/leads.store";
import { useNotesStore } from "@/stores/notes.store";
import { useAttachmentsStore } from "@/stores/attachments.store";
import { useMessagesStore } from "@/stores/messages.store";

// Types (align with your backend enums)
type LeadStatus = "new" | "interview_scheduled" | "test_assigned" | "completed";
type LeadSource = "website" | "referral" | "linkedin" | "job_board" | "other";

type Lead = {
  _id: string;
  clientName: string;
  jobDescription: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo?: { _id: string; username: string; email: string } | null;
  createdBy?: { _id: string; username: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
};

export default function LeadDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leadId = params.id as string;

  const initialTab = (searchParams.get("tab") || "details") as
    | "details"
    | "attachments"
    | "chat"
    | "notes";

  const { user, hasPermission } = useAuthStore();
  const { getOne, update, assign } = useLeadsStore();
  const {
    items: noteItems,
    fetch: fetchNotes,
    create: createNote,
    remove: removeNote,
  } = useNotesStore();
  const {
    items: attachmentItems,
    fetch: fetchAttachments,
    upload: uploadAttachment,
    remove: removeAttachment,
  } = useAttachmentsStore();
  const {
    items: chatItems,
    fetch: fetchMessages,
    send: sendMessage,
    isLoading: isChatLoading,
  } = useMessagesStore();

  const [lead, setLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(
    searchParams.get("edit") === "true"
  );
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editData, setEditData] = useState<Partial<Lead>>({});

  useEffect(() => {
    (async () => {
      const found = await getOne(leadId);
      if (!found) return;
      setLead(found as unknown as Lead);
      setEditData(found as unknown as Lead);
      // prefetch related
      fetchNotes(leadId, 1, 20);
      fetchAttachments(leadId, 1, 20);
      fetchMessages(leadId, 1, 50);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const canEdit = useMemo(() => {
    if (!user || !lead) return false;
    // Adjust your permission check as needed
    return hasPermission({ action: "update", resource: "leads" });
  }, [user, lead, hasPermission]);

  const onSave = async () => {
    if (!lead) return;

    const payload: Partial<Lead> = {
      clientName: editData.clientName,
      jobDescription: editData.jobDescription,
      source: editData.source,
      status: editData.status,
      notes: editData.notes,
    };

    // Update core fields
    const updated = await update(lead._id, payload);
    // Assign if changed
    const prevAssignee = lead.assignedTo?._id || null;
    const nextAssignee =
      (editData as any).assignedTo?._id ??
      (typeof (editData as any).assignedTo === "string"
        ? (editData as any).assignedTo
        : null) ??
      null;

    if (updated && prevAssignee !== nextAssignee) {
      await assign(lead._id, nextAssignee);
    }

    if (updated) {
      setLead(updated as unknown as Lead);
      setIsEditing(false);
      toast.success("Lead updated");
    }
  };

  if (!lead) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-6">
        <LeadHeader
          lead={lead}
          isEditing={isEditing}
          canEdit={canEdit}
          onCancel={() => {
            setIsEditing(false);
            setEditData(lead);
          }}
          onEdit={() => setIsEditing(true)}
          onSave={onSave}
        />

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <LeadDetailsForm
              isEditing={isEditing && canEdit}
              lead={lead}
              editData={editData}
              onChange={setEditData}
            />
          </TabsContent>

          <TabsContent value="attachments" className="space-y-6">
            <AttachmentsPanel
              leadId={lead._id}
              items={attachmentItems}
              onRefresh={() => fetchAttachments(lead._id, 1, 20)}
              onUpload={async (file) => {
                await uploadAttachment(lead._id, file);
                await fetchAttachments(lead._id, 1, 20);
              }}
              onRemove={async (id) => {
                await removeAttachment(id);
                await fetchAttachments(lead._id, 1, 20);
              }}
            />
          </TabsContent>

          <TabsContent value="chat">
            <ChatPanel
              leadId={lead._id}
              messages={chatItems}
              sending={isChatLoading}
              onSend={async (text) => {
                const ok = await sendMessage(lead._id, text);
                if (ok) await fetchMessages(lead._id, 1, 50);
              }}
            />
          </TabsContent>

          <TabsContent value="notes">
            <NotesPanel
              leadId={lead._id}
              notes={noteItems}
              canAdd={hasPermission({ action: "create", resource: "leads" })}
              onAdd={async (text) => {
                const created = await createNote(lead._id, text);
                if (created) await fetchNotes(lead._id, 1, 20);
              }}
              onDelete={async (noteId) => {
                await removeNote(lead._id, noteId);
                await fetchNotes(lead._id, 1, 20);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

/** =========================
 * Sub-components
 * ========================*/

function LeadHeader({
  lead,
  isEditing,
  canEdit,
  onEdit,
  onCancel,
  onSave,
}: {
  lead: Lead;
  isEditing: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const prettyStatus = (s: LeadStatus) =>
    s === "interview_scheduled"
      ? "Interview Scheduled"
      : s === "test_assigned"
      ? "Test Assigned"
      : s[0].toUpperCase() + s.slice(1);
  const statusClass: Record<LeadStatus, string> = {
    new: "bg-blue-100 text-blue-800",
    interview_scheduled: "bg-yellow-100 text-yellow-800",
    test_assigned: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
  };
  const prettySource = (src: LeadSource) =>
    src === "job_board" ? "Job Board" : src[0].toUpperCase() + src.slice(1);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/leads">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{lead.clientName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={statusClass[lead.status]}>
              {prettyStatus(lead.status)}
            </Badge>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{prettySource(lead.source)}</span>
            {lead.assignedTo && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">
                  Assigned to {lead.assignedTo.username}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      {canEdit && (
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={onSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Lead
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function LeadDetailsForm({
  isEditing,
  lead,
  editData,
  onChange,
}: {
  isEditing: boolean;
  lead: Lead;
  editData: Partial<Lead>;
  onChange: (data: Partial<Lead>) => void;
}) {
  const set = (k: keyof Lead, v: any) => onChange({ ...editData, [k]: v });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={isEditing ? editData.clientName ?? "" : lead.clientName}
              onChange={(e) => set("clientName", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Lead Source</Label>
            <Select
              value={isEditing ? editData.source ?? lead.source : lead.source}
              onValueChange={(v) => set("source", v as LeadSource)}
              disabled={!isEditing}
            >
              <SelectTrigger>
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
            rows={4}
            value={
              isEditing ? editData.jobDescription ?? "" : lead.jobDescription
            }
            onChange={(e) => set("jobDescription", e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={isEditing ? editData.status ?? lead.status : lead.status}
              onValueChange={(v) => set("status", v as LeadStatus)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="interview_scheduled">
                  Interview Scheduled
                </SelectItem>
                <SelectItem value="test_assigned">Test Assigned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To (User ID)</Label>
            <Input
              id="assignedTo"
              placeholder="Optional: AdminUser ObjectId"
              value={
                // allow free typing when editing
                isEditing
                  ? (typeof (editData as any).assignedTo === "string"
                      ? (editData as any).assignedTo
                      : (editData as any).assignedTo?._id) ??
                    lead.assignedTo?._id ??
                    ""
                  : lead.assignedTo?._id ?? ""
              }
              onChange={(e) => {
                // keep a simple shape that onSave can detect
                onChange({
                  ...editData,
                  assignedTo: e.target.value ? (e.target.value as any) : null,
                } as any);
              }}
              disabled={!isEditing}
            />
            <p className="text-xs text-muted-foreground">
              Replace with a searchable user picker later.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Internal Notes</Label>
          <Textarea
            id="notes"
            rows={3}
            value={isEditing ? editData.notes ?? "" : lead.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            disabled={!isEditing}
            placeholder="Optional notes about this lead..."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AttachmentsPanel({
  leadId,
  items,
  onUpload,
  onRemove,
  onRefresh,
}: {
  leadId: string;
  items: Array<{
    _id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedBy?: { _id: string; username: string } | null;
    createdAt: string;
  }>;
  onUpload: (file: File) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${
      ["B", "KB", "MB", "GB"][i]
    }`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Attachments</CardTitle>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="max-w-xs"
          />
          <Button
            size="sm"
            onClick={async () => {
              if (!file) return;
              await onUpload(file);
              setFile(null);
              toast.success("File uploaded");
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((a) => (
            <div
              key={a._id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8" />
                <div>
                  <p className="font-medium">{a.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(a.fileSize)} • Uploaded by{" "}
                    {a.uploadedBy?.username || "Unknown"} •{" "}
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={a.fileUrl} target="_blank">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await onRemove(a._id);
                    toast.success("Attachment deleted");
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 opacity-30 mb-4" />
              <p>No attachments yet</p>
              <p className="text-sm">Upload files to share with the team</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ChatPanel({
  leadId,
  messages,
  sending,
  onSend,
}: {
  leadId: string;
  messages: Array<{
    _id: string;
    senderId: { _id: string; username: string } | string;
    content: string;
    timestamp: string;
  }>;
  sending: boolean;
  onSend: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />
          Team Chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] mb-4">
          <div className="space-y-4">
            {messages.map((m) => {
              const senderName =
                typeof m.senderId === "string"
                  ? m.senderId
                  : m.senderId.username;
              return (
                <div key={m._id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                    {senderName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{senderName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm mt-1">{m.content}</p>
                  </div>
                </div>
              );
            })}

            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No messages yet.
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && text.trim()) {
                await onSend(text.trim());
                setText("");
              }
            }}
          />
          <Button
            disabled={!text.trim() || sending}
            onClick={async () => {
              if (!text.trim()) return;
              await onSend(text.trim());
              setText("");
            }}
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotesPanel({
  leadId,
  notes,
  canAdd,
  onAdd,
  onDelete,
}: {
  leadId: string;
  notes: Array<{
    _id: string;
    text: string;
    userId?: { _id: string; username: string };
    createdAt: string;
  }>;
  canAdd: boolean;
  onAdd: (text: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.map((n) => (
            <div key={n._id} className="p-4 border rounded-lg">
              <p className="text-sm">{n.text}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {n.userId?.username || "Unknown"} •{" "}
                {new Date(n.createdAt).toLocaleString()}
              </p>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(n._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {notes.length === 0 && (
            <div className="text-sm text-muted-foreground">No notes yet.</div>
          )}

          {canAdd && (
            <div className="space-y-2">
              <Textarea
                placeholder="Add a note..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <Button
                size="sm"
                onClick={async () => {
                  if (!value.trim()) return;
                  await onAdd(value.trim());
                  setValue("");
                }}
              >
                Add Note
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
