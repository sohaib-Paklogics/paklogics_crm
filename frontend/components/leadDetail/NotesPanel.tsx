"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const NotesPanel = ({
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
}) => {
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
};

export default NotesPanel;
