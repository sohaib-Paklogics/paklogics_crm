import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  /** 1-based current page */
  page: number;
  /** total number of pages (>=1) */
  pageCount: number;
  /** update page (1..pageCount) */
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  const clamp = (p: number) => Math.min(Math.max(1, p), pageCount || 1);
  const prev = () => onPageChange(clamp(page - 1));
  const next = () => onPageChange(clamp(page + 1));

  // build page list with ellipsis (1, …, mid-2..mid+2, …, last)
  const pages: (number | "ellipsis")[] = React.useMemo(() => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const items = new Set<number>();
    items.add(1);
    items.add(pageCount);
    for (let p = page - 2; p <= page + 2; p++) if (p >= 1 && p <= pageCount) items.add(p);
    const sorted = [...items].sort((a, b) => a - b);
    const result: (number | "ellipsis")[] = [];
    for (let i = 0; i < sorted.length; i++) {
      result.push(sorted[i]);
      const nextVal = sorted[i + 1];
      if (nextVal && nextVal - sorted[i] > 1) result.push("ellipsis");
    }
    return result;
  }, [page, pageCount]);

  return (
    <nav role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)}>
      <ul className="flex flex-row items-center gap-1">
        <li>
          <Button variant="ghost" size="sm" onClick={prev} disabled={page <= 1} aria-label="Go to previous page">
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Previous</span>
          </Button>
        </li>

        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <li key={`e${idx}`} aria-hidden className="flex h-9 w-9 items-center justify-center">
              <MoreHorizontal className="h-4 w-4" />
            </li>
          ) : (
            <li key={p}>
              <Button
                variant={p === page ? "outline" : "ghost"}
                size="icon"
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPageChange(p)}
                className="h-9 w-9"
              >
                {p}
              </Button>
            </li>
          ),
        )}

        <li>
          <Button variant="ghost" size="sm" onClick={next} disabled={page >= pageCount} aria-label="Go to next page">
            <span className="mr-1 hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
}
