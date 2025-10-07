"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ColumnSkeletonProps = {
  cards?: number; // how many placeholder cards to render
};

export default function ColumnSkeleton({ cards = 4 }: ColumnSkeletonProps) {
  return (
    <Card className="min-w-[320px]" aria-busy="true" aria-live="polite">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <div className="ml-auto">
            <Skeleton className="h-4 w-10" />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="rounded-md border p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
