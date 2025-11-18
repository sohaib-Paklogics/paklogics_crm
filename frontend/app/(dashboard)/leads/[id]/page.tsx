// app/leads/[id]/page.tsx or similar
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { MainLayout } from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import useAuthStore from "@/stores/auth.store";
import { useLeadsStore } from "@/stores/leads.store";
import { Lead } from "@/types/lead";

import LeadHeader from "@/components/leadDetail/LeadHeader";
import LeadDetailsForm from "@/components/leadDetail/LeadDetailsForm";
import AttachmentsPanel from "@/components/leadDetail/AttachmentsPanel";
import ChatPanel from "@/components/leadDetail/ChatPanel";
import NotesPanel from "@/components/leadDetail/NotesPanel";
import TestsPanel from "@/components/leadDetail/TestsPanel";
import EventsPanel from "@/components/leadDetail/EventsPanel";
import Loader from "@/components/common/Loader";

export default function LeadDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leadId = params.id as string;

  const initialTab = (searchParams.get("tab") || "details") as
    | "details"
    | "attachments"
    | "chat"
    | "notes"
    | "tests"
    | "events";

  const { user, hasPermission } = useAuthStore();
  const { getOne, update, assign } = useLeadsStore();

  const [lead, setLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "true");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const found = await getOne(leadId);
      if (!found) return;
      setLead(found as Lead);
      setEditData(found as Lead);
    })();
  }, [leadId, getOne]);

  const canEdit = useMemo(() => {
    if (!user || !lead) return false;
    return hasPermission({ action: "update", resource: "leads" });
  }, [user, lead, hasPermission]);

  const onSave = async () => {
    if (!lead || saving) return;

    setSaving(true);

    const normalizeStage = (s: any) => {
      if (!s) return undefined;
      if (typeof s === "string") return s;
      if (typeof s === "object" && s._id) return s._id as string;
      return undefined;
    };

    const payload: Partial<Lead> = {
      clientName: editData.clientName,
      jobDescription: editData.jobDescription,
      source: editData.source,
      stage: normalizeStage((editData as any).stage ?? (lead as any).stage),
      notes: editData.notes,
    };

    const updated = await update(lead._id, payload);

    const prevAssignee = lead.assignedTo?._id || null;
    const nextAssignee =
      (editData as any).assignedTo?._id ??
      (typeof (editData as any).assignedTo === "string" ? (editData as any).assignedTo : null) ??
      null;

    if (updated && prevAssignee !== nextAssignee) {
      await assign(lead._id, nextAssignee);
    }

    if (updated) {
      setLead(updated as Lead);
      setIsEditing(false);
    }
    setSaving(false);
  };

  if (!lead) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <Loader />
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
          isSaving={saving}
        />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className={`grid w-full ${user?.role !== "developer" ? "grid-cols-6" : "grid-cols-3"}`}>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            {user?.role !== "developer" && (
              <>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="tests">Tests</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <LeadDetailsForm isEditing={isEditing && canEdit} lead={lead} editData={editData} onChange={setEditData} />
          </TabsContent>

          <TabsContent value="attachments" className="space-y-6">
            <AttachmentsPanel leadId={lead._id} />
          </TabsContent>

          <TabsContent value="chat">
            <ChatPanel leadId={lead._id} />
          </TabsContent>

          {user?.role !== "developer" && (
            <>
              <TabsContent value="notes">
                <NotesPanel leadId={lead._id} />
              </TabsContent>

              <TabsContent value="tests">
                <TestsPanel leadId={lead._id} />
              </TabsContent>

              <TabsContent value="events">
                <EventsPanel leadId={lead._id} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
}
