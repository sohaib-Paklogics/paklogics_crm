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
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Lead Pipeline</h1>
        <p className="mt-0.5 sm:mt-1 text-sm text-gray-600">{subtitle}</p>
        <p className="text-xs text-muted-foreground mt-1">Total leads: {totalLeads}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <div className="w-full min-w-0">
          {/* If SearchBar accepts className, also pass className="w-full" */}
          <SearchBar onCommit={onSearch} />
        </div>

        {canCreate && (
          <Button onClick={onAddLead} disabled={addLeadLoading} className="w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4 mr-2" />
            {addLeadLoading ? "Opening…" : "Add Lead"}
          </Button>
        )}
      </div>
    </div>
  );
}
