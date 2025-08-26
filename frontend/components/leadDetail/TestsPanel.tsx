"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type {
  TestTask,
  TestTaskPriority,
  TestTaskStatus,
} from "@/types/test-task";
import TestReviewDialog from "../modals/TestReviewDialog";
import { useTestTasksStore } from "@/stores/testTasks.store";
import { useUserStore } from "@/stores/user-store";
import type { AdminUser } from "@/types/types";
import { toast } from "sonner";
import TaskRow from "./TaskRow";

const UNASSIGNED = "__none__";

export default function TestsPanel({ leadId }: { leadId: string }) {
  const {
    list,
    fetch,
    create,
    assign,
    setStatus,
    review,
    remove,
    isLoading,
    addAttachments,
    removeAttachment,
    replaceAttachment,
  } = useTestTasksStore();

  const { users, fetchUsers } = useUserStore();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TestTaskPriority>("medium");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [assignee, setAssignee] = useState<string>(UNASSIGNED);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetch(leadId, 1, 20);
    fetchUsers?.({ page: 1, limit: 50 } as any);
  }, [leadId, fetch, fetchUsers]);

  const items = list(leadId);
  const canSubmit = title.trim().length >= 2 && assignee !== UNASSIGNED;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<TestTask> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      assignedTo: assignee !== UNASSIGNED ? assignee : undefined,
    };
    const ok = await create(leadId, payload, files);
    if (ok) {
      toast.success("Test task created");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setAssignee(UNASSIGNED);
      setFiles([]);
      fetch(leadId, 1, 20);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-validiz-brown">Add Test Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 md:grid-cols-5 gap-3"
            onSubmit={submit}
          >
            <div className="md:col-span-2">
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TestTaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due</Label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Assign</Label>
              <Select value={assignee} onValueChange={(v) => setAssignee(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="capitalize" value={UNASSIGNED}>
                    Unassigned
                  </SelectItem>
                  {(users || []).map((u) => {
                    const val = (u as any)._id ?? (u as any).id;
                    return (
                      <SelectItem className="capitalize" key={val} value={val}>
                        {u.username}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-5">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="md:col-span-5">
              <Label>Attachments</Label>
              <Input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
              {files.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {files.length} file(s) selected
                </p>
              )}
            </div>

            <div className="md:col-span-5 flex justify-end">
              <Button type="submit" disabled={!canSubmit}>
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-validiz-brown">
              Tasks ({items.length})
            </CardTitle>
            <Button variant="outline" onClick={() => fetch(leadId, 1, 20)}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading…</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No test tasks yet.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((t, i) => (
                <TaskRow
                  key={t._id ?? (t as any).id ?? `${t.title}-${i}`}
                  task={t}
                  users={users || []}
                  onAssign={assign}
                  onSetStatus={setStatus}
                  onReview={review}
                  onRemove={(id) => remove(leadId, id)}
                  onAddAttachments={addAttachments}
                  onRemoveAttachment={removeAttachment}
                  onReplaceAttachment={replaceAttachment}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
