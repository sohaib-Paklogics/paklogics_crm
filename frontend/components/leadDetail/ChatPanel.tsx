"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { ScrollArea } from "../ui/scroll-area";

const ChatPanel = ({
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
}) => {
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
};

export default ChatPanel;
