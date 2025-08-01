import { Loader2 } from "lucide-react";

// app/dashboard/loading.js
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );
}
