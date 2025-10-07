"use client";

import { cn } from "@/lib/utils";
import {
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Icon as LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatVariant = "blue" | "brown" | "yellow" | "green";

type StatItem = {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: string; 
  icon: typeof LucideIcon;
  variant: StatVariant;
};

function variantClasses(variant: StatVariant) {
  switch (variant) {
    case "blue":
      return {
        chipBg: "bg-blue-50",
        chipText: "text-blue-500",
        pillBg: "bg-blue-50",
        pillText: "text-blue-600",
      };
    case "brown":
      // matches your primary #6E4318 vibe
      return {
        chipBg: "bg-[#6C431826]/15",
        chipText: "text-[#6E4318]",
        pillBg: "bg-[#6C431826]/15",
        pillText: "text-[#6E4318]",
      };
    case "yellow":
      // secondary #FDB52A tone
      return {
        chipBg: "bg-[#FDB52A]/15",
        chipText: "text-[#FDB52A]",
        pillBg: "bg-[#FDB52A]/15",
        pillText: "text-[#FDB52A]",
      };
    case "green":
      return {
        chipBg: "bg-green-50",
        chipText: "text-[#0CCC35]",
        pillBg: "bg-green-50",
        pillText: "text-[#0CCC35]",
      };
  }
}

function StatCard({ item }: { item: StatItem }) {
  const ui = variantClasses(item.variant);
  const Icon = item.icon;

  return (
    <Card className="rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-neutral-700">
            {item.title}
          </CardTitle>
          <div
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg",
              ui.chipBg,
              ui.chipText
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={cn("text-3xl font-bold tracking-tight", ui.text)}>
          {item.value}
        </div>
        {/* {item.delta && (
          <div
            className={cn(
              "mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium",
              ui.pillBg,
              ui.pillText
            )}
          >
            {item.delta}
          </div>
        )} */}
       
      </CardContent>
    </Card>
  );
}

export default function StatsOverview({
  stats,
  isLoading,
  user,
}: {
  stats: {
    total: number;
    newLeads: number;
    interviewScheduled: number;
    completed: number;
    deltas?: {
      total?: string;
      newLeads?: string;
      interviewScheduled?: string;
      completed?: string;
    };
  };
  isLoading?: boolean;
  user: { role: string };
}) {
  const roleSubtitle =
    user.role === "admin" || user.role === "superadmin"
      ? "All leads"
      : user.role === "business_developer"
      ? "Your leads"
      : "Assigned to you";

  const items: StatItem[] = [
    {
      title: "Total Leads",
      value: isLoading ? "…" : stats.total,
      subtitle: roleSubtitle,
      delta: stats.deltas?.total ?? "+12% from last month",
      icon: FileText,
      variant: "blue",
    },
    {
      title: "New Leads",
      value: isLoading ? "…" : stats.newLeads,
      subtitle: "Awaiting action",
      delta: stats.deltas?.newLeads ?? "+23% from last week",
      icon: TrendingUp,
      variant: "brown",
    },
    {
      title: "Interviews",
      value: isLoading ? "…" : stats.interviewScheduled,
      subtitle: "Scheduled",
      delta: stats.deltas?.interviewScheduled ?? "+8% from last week",
      icon: Calendar,
      variant: "yellow",
    },
    {
      title: "Completed",
      value: isLoading ? "…" : stats.completed,
      subtitle: "Successfully closed",
      delta: stats.deltas?.completed ?? "+15% from last month",
      icon: Users,
      variant: "green",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.title} item={item} />
      ))}
    </div>
  );
}
