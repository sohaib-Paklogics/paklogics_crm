import { Loader2 } from "lucide-react";

const Loader = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
      <p className="text-sm">{text}</p>
    </div>
  );
};

export default Loader;
