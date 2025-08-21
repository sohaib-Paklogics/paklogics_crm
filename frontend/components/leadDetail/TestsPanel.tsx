// TestsPanel.tsx (or wherever this file is)
"use client";

import { useRef, useState } from "react";
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
import type { AdminUser } from "@/types/types";
import TestReviewDialog from "../modals/TestReviewDialog";

const UNASSIGNED = "__none__";

const TestsPanel = ({
  leadId,
  items,
  loading,
  users,
  onRefresh,
  onCreate,
  onAssign,
  onSetStatus,
  onReview,
  onRemove,
  onAddAttachments, // NEW
  onRemoveAttachment, // NEW
  onReplaceAttachment, // NEW
}: {
  leadId: string;
  items: TestTask[];
  loading: boolean;
  users: AdminUser[];
  onRefresh: () => void;
  onCreate: (p: Partial<TestTask>, files?: File[]) => Promise<any>; // updated
  onAssign: (id: string, assignee: string | null) => Promise<any>;
  onSetStatus: (id: string, status: TestTaskStatus) => Promise<any>;
  onReview: (
    id: string,
    payload: {
      score?: number;
      resultNotes?: string;
      status?: "reviewed" | "passed" | "failed";
    }
  ) => Promise<any>;
  onRemove: (id: string) => Promise<any>;
  onAddAttachments: (id: string, files: File[]) => Promise<any>;
  onRemoveAttachment: (id: string, attachmentId: string) => Promise<any>;
  onReplaceAttachment: (
    id: string,
    attachmentId: string,
    file: File
  ) => Promise<any>;
}) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TestTaskPriority>("medium");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [assignee, setAssignee] = useState<string>(UNASSIGNED);
  const [files, setFiles] = useState<File[]>([]);

  const canSubmit = title.trim().length >= 2;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<TestTask> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      assignedTo: assignee !== UNASSIGNED ? assignee : undefined,
    };
    await onCreate(payload, files);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setAssignee(UNASSIGNED);
    setFiles([]);
    onRefresh();
  };

  const devs = users;

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
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {devs.map((u) => {
                    const val = (u as any)._id ?? (u as any).id;
                    return (
                      <SelectItem key={val} value={val}>
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

            {/* NEW: attachments on create */}
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
            <Button variant="outline" onClick={onRefresh}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
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
                  users={users}
                  onAssign={onAssign}
                  onSetStatus={onSetStatus}
                  onReview={onReview}
                  onRemove={onRemove}
                  onAddAttachments={onAddAttachments}
                  onRemoveAttachment={onRemoveAttachment}
                  onReplaceAttachment={onReplaceAttachment}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestsPanel;

/* ---------------- Row + Review dialog + Attachments UI ---------------- */

const TaskRow = ({
  task,
  users,
  onAssign,
  onSetStatus,
  onReview,
  onRemove,
  onAddAttachments,
  onRemoveAttachment,
  onReplaceAttachment,
}: {
  task: TestTask;
  users: AdminUser[];
  onAssign: (id: string, assignee: string | null) => Promise<any>;
  onSetStatus: (id: string, status: TestTaskStatus) => Promise<any>;
  onReview: (
    id: string,
    payload: {
      score?: number;
      resultNotes?: string;
      status?: "reviewed" | "passed" | "failed";
    }
  ) => Promise<any>;
  onRemove: (id: string) => Promise<any>;
  onAddAttachments: (id: string, files: File[]) => Promise<any>;
  onRemoveAttachment: (id: string, attachmentId: string) => Promise<any>;
  onReplaceAttachment: (
    id: string,
    attachmentId: string,
    file: File
  ) => Promise<any>;
}) => {
  const [reviewOpen, setReviewOpen] = useState(false);
  const addInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const statusColor: Record<TestTaskStatus, string> = {
    pending: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    submitted: "bg-purple-100 text-purple-800",
    reviewed: "bg-amber-100 text-amber-800",
    passed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    canceled: "bg-zinc-200 text-zinc-700",
  };

  const assigned =
    task.assignedTo && typeof task.assignedTo === "object"
      ? (task.assignedTo as any)
      : null;

  const currentAssigneeVal =
    (assigned?._id as string | undefined) ??
    (task.assignedTo as any as string | undefined) ??
    UNASSIGNED;

  return (
    <div className="border rounded-md p-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{task.title}</h4>
            <Badge className={statusColor[task.status]}>
              {task.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {task.priority}
            </Badge>
          </div>
          {!!task.description && (
            <p className="text-xs text-gray-600">{task.description}</p>
          )}
          <p className="text-xs text-gray-500">
            Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : "—"}
          </p>
          <p className="text-xs text-gray-500">
            Assigned: {assigned ? assigned.username : "Unassigned"}
          </p>
          {typeof task.score === "number" && (
            <p className="text-xs text-gray-500">Score: {task.score}</p>
          )}
          {!!task.resultNotes && (
            <p className="text-xs text-gray-500">Notes: {task.resultNotes}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={currentAssigneeVal}
            onValueChange={(v) =>
              onAssign(task._id, v === UNASSIGNED ? null : v)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Assign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
              {users.map((u) => {
                const val = (u as any)._id ?? (u as any).id;
                return (
                  <SelectItem key={val} value={val}>
                    {u.username}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select
            value={task.status}
            onValueChange={(v) => onSetStatus(task._id, v as TestTaskStatus)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {[
                "pending",
                "in_progress",
                "submitted",
                "reviewed",
                "passed",
                "failed",
                "canceled",
              ].map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setReviewOpen(true)}>
            Review
          </Button>
          <Button variant="destructive" onClick={() => onRemove(task._id)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Attachments section */}
      <div className="mt-3 border-t pt-3">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-medium">Attachments</h5>
          <div>
            <input
              ref={addInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) await onAddAttachments(task._id, files);
                e.currentTarget.value = "";
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => addInputRef.current?.click()}
            >
              Add files
            </Button>
          </div>
        </div>

        {!task.attachments || task.attachments.length === 0 ? (
          <p className="text-xs text-gray-500 mt-2">No attachments.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {task.attachments.map((a) => (
              <li
                key={a._id}
                className="flex items-center justify-between text-sm"
              >
                <div className="min-w-0">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline break-all"
                    title={a.originalFilename || a.publicId}
                  >
                    {a.originalFilename || a.publicId}
                  </a>
                  <span className="ml-2 text-xs text-gray-500">
                    {a.format?.toUpperCase?.()}{" "}
                    {a.bytes ? `• ${(a.bytes / 1024).toFixed(0)} KB` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* replace */}
                  <input
                    ref={(el) => {
                      if (el) replaceInputRefs.current[a._id] = el;
                    }}
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) await onReplaceAttachment(task._id, a._id, f);
                      e.currentTarget.value = "";
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => replaceInputRefs.current[a._id]?.click()}
                  >
                    Replace
                  </Button>

                  {/* remove */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemoveAttachment(task._id, a._id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <TestReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        onSubmit={async (payload) => {
          await onReview(task._id, payload);
          setReviewOpen(false);
        }}
      />
    </div>
  );
};
