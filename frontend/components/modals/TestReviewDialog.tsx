import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

const TestReviewDialog = ({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (p: {
    score?: number;
    resultNotes?: string;
    status?: "reviewed" | "passed" | "failed";
  }) => Promise<any>;
}) => {
  const [score, setScore] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState<"reviewed" | "passed" | "failed">(
    "reviewed"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Review Test Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Score (0-100)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 85"
            />
          </div>
          <div>
            <Label>Decision</Label>
            <Select
              value={decision}
              onValueChange={(v) => setDecision(v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                onSubmit({
                  status: decision,
                  score: score ? Number(score) : undefined,
                  resultNotes: notes || undefined,
                })
              }
            >
              Save Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestReviewDialog;
