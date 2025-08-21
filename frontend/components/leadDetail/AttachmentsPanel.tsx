"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Upload, Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const AttachmentsPanel = ({
  leadId,
  items,
  onUpload,
  onRemove,
  onRefresh,
}: {
  leadId: string;
  items: Array<{
    _id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedBy?: { _id: string; username: string } | null;
    createdAt: string;
  }>;
  onUpload: (file: File) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}) => {
  const [file, setFile] = useState<File | null>(null);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${
      ["B", "KB", "MB", "GB"][i]
    }`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Attachments</CardTitle>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="max-w-xs"
          />
          <Button
            size="sm"
            onClick={async () => {
              if (!file) return;
              await onUpload(file);
              setFile(null);
              toast.success("File uploaded");
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((a) => (
            <div
              key={a._id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8" />
                <div>
                  <p className="font-medium">{a.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(a.fileSize)} • Uploaded by{" "}
                    {a.uploadedBy?.username || "Unknown"} •{" "}
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={a.fileUrl} target="_blank">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await onRemove(a._id);
                    toast.success("Attachment deleted");
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 opacity-30 mb-4" />
              <p>No attachments yet</p>
              <p className="text-sm">Upload files to share with the team</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttachmentsPanel;
