"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Pencil, X, Check, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useMessagesStore } from "@/stores/messages.store";
import { useUserStore } from "@/stores/user-store";
import type { ChatMessage } from "@/types/message";
import useAuthStore from "@/stores/auth.store";

type WithMaybe<T> = T | null | undefined;

export default function ChatPanel({ leadId }: { leadId: string }) {
  const {
    items: messages,
    fetch,
    send,
    edit,
    remove,
    isLoading,
  } = useMessagesStore();

  // Full list if you still need it elsewhere (not required for canEdit)
  const { users } = useUserStore();

  // Authenticated user (the one who is "me")
  const { user: me } = useAuthStore();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  // initial fetch
  useEffect(() => {
    fetch(leadId, 1, 50);
  }, [leadId, fetch]);

  // auto-scroll to bottom when messages list changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  // determine if the current user can edit/delete a given message
  const canEdit = (m: ChatMessage) => {
    if (!me) return false;

    // senderId could be:
    // - a string (id/username/"you")
    // - a populated object with id/_id/username
    const normalize = (v: WithMaybe<string>) => (v ? String(v) : "");

    if (typeof m.senderId === "string") {
      const s = normalize(m.senderId);
      return (
        s.toLowerCase() === "you" || // optimistic local fallback
        s === normalize((me as any)._id) ||
        s === normalize((me as any).id) ||
        s === normalize((me as any).username)
      );
    }

    const sid = m.senderId as any;
    return (
      normalize(sid?._id) === normalize((me as any)._id) ||
      normalize(sid?.id) === normalize((me as any).id) ||
      normalize(sid?.username) === normalize((me as any).username)
    );
  };

  const beginEdit = (m: ChatMessage) => {
    setEditingId(m._id);
    setEditingText(m.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setSavingEdit(false);
  };

  const saveEdit = async () => {
    if (!editingId || !editingText.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      const ok = await edit(leadId, editingId, editingText.trim());
      if (ok) cancelEdit();
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!remove) return; // if your store doesn't have it yet
    const ok = confirm("Delete this message?");
    if (!ok) return;
    await remove(messageId);
  };

  const handleSend = async () => {
    const body = text.trim();
    if (!body || sending) return; // guard double clicks
    setSending(true);
    try {
      const ok = await send(leadId, body);
      if (ok) setText("");
    } finally {
      setSending(false);
    }
  };

  // prevent repeated sends when holding Enter: ignore if event.repeat
  const onComposerKeyDown = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if ((e as any).repeat) return; // ignore key repeat
      e.preventDefault();
      await handleSend();
    }
  };

  const onEditorKeyDown = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if ((e as any).repeat) return;
      e.preventDefault();
      await saveEdit();
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />
          Team Chat
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Messages list */}
        <ScrollArea className="h-[320px] mb-4">
          <div ref={listRef} className="space-y-4 pr-2">
            {messages.map((m) => {
              const sender =
                typeof m.senderId === "string"
                  ? m.senderId === me?.id
                    ? { username: me?.username }
                    : { username: m.senderId } // fallback if not me
                  : (m.senderId as any);

              const isEditingThis = editingId === m._id;

              return (
                <div key={m._id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                    {sender?.username?.charAt(0).toUpperCase() ?? "U"}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm">
                        {sender?.username ?? "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.timestamp
                          ? new Date(m.timestamp).toLocaleString()
                          : ""}
                      </p>
                      {"editedAt" in m && (m as any).editedAt ? (
                        <span className="text-xs text-muted-foreground">
                          (edited)
                        </span>
                      ) : null}

                      {canEdit(m) && !isEditingThis && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => beginEdit(m)}
                            title="Edit message"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-destructive"
                            onClick={() => handleDelete(m._id)}
                            title="Delete message"
                          >
                            <Trash className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* content / editor */}
                    {!isEditingThis ? (
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {m.content}
                      </p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={onEditorKeyDown}
                          rows={3}
                          autoFocus
                          disabled={savingEdit}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={saveEdit}
                            disabled={!editingText.trim() || savingEdit}
                          >
                            {savingEdit ? (
                              "Saving..."
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={savingEdit}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
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

        {/* Composer */}
        <div className="space-y-2">
          <Textarea
            placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onComposerKeyDown}
            rows={3}
            disabled={sending || !!editingId} // disable while sending or editing
          />
          <div className="flex justify-end">
            <Button
              disabled={!text.trim() || sending || isLoading || !!editingId}
              onClick={handleSend}
            >
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
