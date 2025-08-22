"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { useNotesStore } from "@/stores/notes.store";
import useAuthStore from "@/stores/auth-store";

export default function NotesPanel({ leadId }: { leadId: string }) {
  const { items: notes, fetch, create, remove } = useNotesStore();
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
    await remove(leadId, noteId);
    await fetch(leadId, 1, 20);
  };

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
                  onClick={() => deleteNote(n._id)}
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
              <Button size="sm" onClick={addNote}>
                Add Note
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
