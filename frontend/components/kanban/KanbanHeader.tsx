"use client";
import { Button } from "@/components/ui/button";
import SearchBar from "./SearchBar";
import { Plus } from "lucide-react";
import useAuthStore from "@/stores/auth.store";

type Props = {
  onSearch: (q: string) => void;
  onAddLead: () => void;
  addLeadLoading?: boolean;
  totalLeads: number;
  subtitle?: string;
};

export default function KanbanHeader({
  onSearch,
  onAddLead,
  addLeadLoading = false,
  totalLeads,
  subtitle = "Track leads through your sales pipeline",
}: Props) {
  const { user, hasPermission } = useAuthStore();
  const canCreate = user?.role !== "developer" && hasPermission({ action: "create", resource: "leads" });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-neutral-200">
      <div>
        <h1 className="text-3xl font-bold">Lead Pipeline</h1>
        <p className="text-gray-600 mt-1">{subtitle}</p>
        <p className="text-xs text-muted-foreground mt-1">Total leads: {totalLeads}</p>
      </div>

      <div className="flex items-center gap-2">
        <SearchBar onCommit={onSearch} />
        {canCreate && (
          <Button onClick={onAddLead} disabled={addLeadLoading}>
            <Plus className="w-4 h-4 mr-2" />
            {addLeadLoading ? "Opening…" : "Add Lead"}
          </Button>
        )}
      </div>
    </div>
  );
}
