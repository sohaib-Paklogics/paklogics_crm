"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { MainLayout } from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Stores
import useAuthStore from "@/stores/auth-store";
import { useLeadsStore } from "@/stores/leads.store";
import { useNotesStore } from "@/stores/notes.store";
import { useAttachmentsStore } from "@/stores/attachments.store";
import { useMessagesStore } from "@/stores/messages.store";
import { Lead } from "@/types/lead";
import LeadHeader from "@/components/leadDetail/LeadHeader";
import LeadDetailsForm from "@/components/leadDetail/LeadDetailsForm";
import AttachmentsPanel from "@/components/leadDetail/AttachmentsPanel";
import ChatPanel from "@/components/leadDetail/ChatPanel";
import NotesPanel from "@/components/leadDetail/NotesPanel";
import TestsPanel from "@/components/leadDetail/TestsPanel";
import { useTestTasksStore } from "@/stores/testTasks.store";
import { useUserStore } from "@/stores/user-store";

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

  const {
    list: listTasks,
    fetch: fetchTasks,
    create: createTask,
    assign: assignTask,
    setStatus: setTaskStatus,
    review: reviewTask,
    remove: removeTask,
    isLoading: tasksLoading,
    addAttachments,
    removeAttachment: taskAttachment,
    replaceAttachment,
  } = useTestTasksStore();

  const { users, fetchUsers, loading } = useUserStore();

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
      fetchTasks(leadId, 1, 20);
      fetchUsers?.({ page: 1, limit: 10 } as any);
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

  const tasks = listTasks(lead._id);

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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
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

          <TabsContent value="tests">
            <TestsPanel
              leadId={lead._id}
              items={tasks}
              loading={tasksLoading}
              users={users || []}
              onRefresh={() => fetchTasks(lead._id, 1, 20)}
              onCreate={async (p, files) => {
                const ok = await createTask(lead._id, p, files);
                if (ok) toast.success("Test task created");
              }}
              onAssign={async (id, assignee) => {
                const ok = await assignTask(id, assignee);
                if (ok) toast.success("Assignee updated");
              }}
              onSetStatus={async (id, s) => {
                const ok = await setTaskStatus(id, s);
                if (ok) toast.success("Status updated");
              }}
              onReview={async (id, payload) => {
                const ok = await reviewTask(id, payload);
                if (ok) toast.success("Review saved");
              }}
              onRemove={async (id) => {
                const ok = await removeTask(lead._id, id);
                if (ok) toast.success("Task deleted");
              }}
              onAddAttachments={addAttachments}
              onRemoveAttachment={taskAttachment}
              onReplaceAttachment={replaceAttachment}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
