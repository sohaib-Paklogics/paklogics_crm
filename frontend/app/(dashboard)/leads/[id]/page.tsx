"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { MainLayout } from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Stores
import useAuthStore from "@/stores/auth-store";
import { useLeadsStore } from "@/stores/leads.store";
import { Lead } from "@/types/lead";
import LeadHeader from "@/components/leadDetail/LeadHeader";
import LeadDetailsForm from "@/components/leadDetail/LeadDetailsForm";

// ⬇️ Panels now self-contained
import AttachmentsPanel from "@/components/leadDetail/AttachmentsPanel";
import ChatPanel from "@/components/leadDetail/ChatPanel";
import NotesPanel from "@/components/leadDetail/NotesPanel";
import TestsPanel from "@/components/leadDetail/TestsPanel";
import Loader from "@/components/common/Loader";
import EventsPanel from "@/components/leadDetail/EventsPanel";

export default function LeadDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leadId = params.id as string;

  const initialTab = (searchParams.get("tab") || "details") as
    | "details"
    | "attachments"
    | "chat"
    | "notes"
    | "tests";

  const { user, hasPermission } = useAuthStore();
  const { getOne, update, assign } = useLeadsStore();

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
    })();
  }, [leadId, getOne]);

  const canEdit = useMemo(() => {
    if (!user || !lead) return false;
    return hasPermission({ action: "update", resource: "leads" });
  }, [user, lead, hasPermission]);

  const onSave = async () => {
    if (!lead) return;
    const payload: Partial<Lead> = {
      clientName: editData.clientName,
      jobDescription: editData.jobDescription,
      source: editData.source,
      stage: editData.stage,
      notes: editData.notes,
    };

    const updated = await update(lead._id, payload);
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
        <Loader />
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <LeadDetailsForm
              isEditing={isEditing && canEdit}
              lead={lead}
              editData={editData}
              onChange={setEditData}
            />
          </TabsContent>

          {/* ⬇️ Only pass leadId now */}
          <TabsContent value="attachments" className="space-y-6">
            <AttachmentsPanel leadId={lead._id} />
          </TabsContent>

          <TabsContent value="chat">
            <ChatPanel leadId={lead._id} />
          </TabsContent>

          <TabsContent value="notes">
            <NotesPanel leadId={lead._id} />
          </TabsContent>

          <TabsContent value="tests">
            <TestsPanel leadId={lead._id} />
          </TabsContent>

          <TabsContent value="events">
            <EventsPanel leadId={lead._id} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
