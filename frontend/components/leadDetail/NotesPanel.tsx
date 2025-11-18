// components/leadDetail/NotesPanel.tsx
"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { useNotesStore } from "@/stores/notes.store";
import useAuthStore from "@/stores/auth.store";
import Loader from "@/components/common/Loader";

export default function NotesPanel({ leadId }: { leadId: string }) {
  const { items: notes, fetch, create, remove, isLoading } = useNotesStore();
  const { hasPermission } = useAuthStore();
  const [value, setValue] = useState("");

  const canAdd = hasPermission({ action: "create", resource: "leads" });

  useEffect(() => {
    fetch(leadId, 1, 20);
  }, [leadId, fetch]);

  const addNote = async () => {
    if (!value.trim()) return;
    const ok = await create(leadId, value.trim());
    if (ok) {
      setValue("");
      await fetch(leadId, 1, 20);
    }
  };

  const deleteNote = async (noteId: string) => {
    const ok = await remove(leadId, noteId);
    if (ok) {
      await fetch(leadId, 1, 20);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notes</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Internal notes are visible only inside Validiz CRM, not to the client or candidate.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((n) => (
              <div key={n._id} className="p-4 border rounded-lg bg-white space-y-2">
                <p className="text-sm whitespace-pre-wrap">{n.text}</p>
                <p className="text-xs text-muted-foreground">
                  {n.userId?.username || "Unknown"} • {new Date(n.createdAt).toLocaleString()}
                </p>
                <div className="mt-1">
                  <Button variant="outline" size="sm" onClick={() => deleteNote(n._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}

            {notes.length === 0 && !isLoading && (
              <div className="text-sm text-muted-foreground">
                No notes yet. Use notes to record key decisions, feedback, or context about this lead.
              </div>
            )}

            {canAdd && (
              <div className="space-y-2 pt-2 border-t mt-4">
                <Textarea placeholder="Add a note..." value={value} onChange={(e) => setValue(e.target.value)} />
                <div className="flex justify-end">
                  <Button size="sm" onClick={addNote} disabled={!value.trim()}>
                    Add Note
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
