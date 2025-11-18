// components/leadDetail/AttachmentsPanel.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Upload, Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAttachmentsStore } from "@/stores/attachments.store";
import ButtonLoader from "../common/ButtonLoader";
import Loader from "../common/Loader";

export default function AttachmentsPanel({ leadId }: { leadId: string }) {
  const { items, fetch, upload, remove, isUploading, isLoading } = useAttachmentsStore();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(leadId, 1, 20);
  }, [leadId, fetch]);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${["B", "KB", "MB", "GB"][i]}`;
  };

  const handleUpload = async () => {
    if (!file) return;
    const created = await upload(leadId, file);
    if (created) {
      setFile(null);
      await fetch(leadId, 1, 20);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Attachments</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Store job descriptions, CVs, emails, and other supporting files against this lead.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="max-w-xs text-xs"
            disabled={isUploading}
          />
          <Button size="sm" onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? <ButtonLoader /> : <Upload className="mr-2 h-4 w-4" />}
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((a) => (
              <div key={a._id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm break-all">{a.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(a.fileSize)} • Uploaded by {a.uploadedBy?.username || "Unknown"} •{" "}
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
                      const ok = await remove(a._id);
                      if (ok) {
                        await fetch(leadId, 1, 20);
                        toast.success("Attachment deleted");
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            {items.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 opacity-30 mb-4" />
                <p className="text-sm font-medium">No attachments yet</p>
                <p className="text-xs mt-1">Upload files to keep everything about this lead in one place.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
