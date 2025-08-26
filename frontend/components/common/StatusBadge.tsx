import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  XCircle,
  PlayCircle,
  PauseCircle,
  Loader2,
  Circle,
} from "lucide-react";
import * as React from "react";

type VariantKey = "success" | "destructive" | "warning" | "info" | "default";

export interface StatusBadgeProps {
  status: any;
  className?: string;
  /**
   * Optional hard override if you want to force a style regardless of heuristics
   */
  variantOverride?: VariantKey;
}

/** Normalize arbitrary text to a stable token */
function normalizeToken(input: string): string {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

/** Pretty-print a token into title case words */
function prettyLabel(token: string): string {
  if (!token) return "—";
  return token
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

/**
 * Heuristic classifier that maps a normalized token to:
 * - label
 * - icon
 * - variant (color theme)
 */
function classifyStatus(token: string): {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  variant: VariantKey;
} {
  // Groups of keywords that imply a "meaning"
  const SUCCESS = new Set([
    "success",
    "succeeded",
    "synced",
    "ok",
    "healthy",
    "passing",
    "passed",
    "completed",
    "done",
    "resolved",
    "approved",
    "active",
    "live",
    "up",
    "ready",
    "verified",
    "accepted",
    "published",
  ]);

  const DANGER = new Set([
    "failed",
    "failure",
    "error",
    "errored",
    "reject",
    "rejected",
    "declined",
    "fatal",
    "critical",
    "down",
    "offline",
    "terminated",
    "canceled",
    "cancelled",
    "expired",
    "revoked",
    "blocked",
    "deleted",
    "archived",
    "closed",
  ]);

  const WARNING = new Set([
    "pending",
    "waiting",
    "on_hold",
    "hold",
    "paused",
    "pause",
    "investigating",
    "needs_attention",
    "delayed",
    "stuck",
    "review",
    "qa",
    "code_review",
    "verification",
    "escalated",
    "degraded",
  ]);

  const INFO = new Set([
    "processing",
    "in_progress",
    "running",
    "building",
    "deploying",
    "syncing",
    "starting",
    "initializing",
    "provisioning",
    "migrating",
    "updating",
    "rolling_out",
    "queued",
    "scheduling",
    "scheduled",
    "active", // also success-y; keep here for "playing" icon feel
    "open",
  ]);

  // Pipeline stage hints
  const STAGE_TODO = new Set(["new", "todo", "to_do", "backlog"]);
  const STAGE_DOING = new Set(["doing", "in_progress", "wip"]);
  const STAGE_REVIEW = new Set([
    "review",
    "qa",
    "testing",
    "code_review",
    "verify",
    "verification",
  ]);
  const STAGE_DONE = new Set(["done", "completed", "shipped", "delivered"]);

  // Exact matches go first
  if (SUCCESS.has(token) || STAGE_DONE.has(token)) {
    return { label: prettyLabel(token), icon: CheckCircle, variant: "success" };
  }
  if (DANGER.has(token)) {
    return { label: prettyLabel(token), icon: XCircle, variant: "destructive" };
  }
  if (WARNING.has(token) || STAGE_REVIEW.has(token)) {
    // nuanced warning states (waiting/review/hold)
    const icon =
      token.includes("pause") || token.includes("hold")
        ? PauseCircle
        : AlertCircle;
    return { label: prettyLabel(token), icon, variant: "warning" };
  }
  if (INFO.has(token) || STAGE_DOING.has(token)) {
    // motion/progress states
    const icon =
      token === "queued" || token.includes("queue")
        ? Loader2
        : token === "active"
        ? PlayCircle
        : RefreshCw;
    return { label: prettyLabel(token), icon, variant: "info" };
  }
  if (STAGE_TODO.has(token)) {
    return { label: prettyLabel(token), icon: Clock, variant: "default" };
  }

  // Fuzzy fallbacks (contains/startsWith)
  if (/^(pass|success|complete|resolve|approve)/.test(token)) {
    return { label: prettyLabel(token), icon: CheckCircle, variant: "success" };
  }
  if (
    /^(fail|error|reject|cancel|declin|critical|fatal|down|offline|delete|archive|close)/.test(
      token
    )
  ) {
    return { label: prettyLabel(token), icon: XCircle, variant: "destructive" };
  }
  if (/^(pend|wait|hold|investigat|escalat|degrad|delay|block)/.test(token)) {
    return { label: prettyLabel(token), icon: AlertCircle, variant: "warning" };
  }
  if (
    /^(process|progress|run|build|deploy|sync|start|init|provision|migrat|update|queue|sched|rolling)/.test(
      token
    )
  ) {
    const icon = /queue/.test(token) ? Loader2 : RefreshCw;
    return { label: prettyLabel(token), icon, variant: "info" };
  }
  if (/^(new|todo|backlog|to_do)/.test(token)) {
    return { label: prettyLabel(token), icon: Clock, variant: "default" };
  }

  // Totally unknown → neutral
  return { label: prettyLabel(token), icon: Circle, variant: "default" };
}

const variantStyles: Record<VariantKey, string> = {
  success: "bg-green-100 text-green-800",
  destructive: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-100 text-blue-800",
  default: "bg-gray-100 text-gray-800",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  variantOverride,
}) => {
  const token = normalizeToken(String(status ?? ""));
  const { label, icon: Icon, variant } = classifyStatus(token);
  const finalVariant = variantOverride ?? variant;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 h-6 text-xs font-medium",
        "whitespace-nowrap select-none",
        variantStyles[finalVariant],
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
    </Badge>
  );
};

export default StatusBadge;
