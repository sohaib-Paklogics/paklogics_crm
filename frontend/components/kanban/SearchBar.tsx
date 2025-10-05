"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

type Props = {
  onCommit: (q: string) => void;
  placeholder?: string;
  debounceMs?: number;
  value?: string;
};

export default function SearchBar({ onCommit, placeholder = "Search in board…", debounceMs = 250, value = "" }: Props) {
  const [text, setText] = useState(value);

  // debounce commit while typing
  useEffect(() => {
    const t = setTimeout(() => onCommit(text), debounceMs);
    return () => clearTimeout(t);
  }, [text, debounceMs, onCommit]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") onCommit(text);
    },
    [text, onCommit],
  );

  const clear = useCallback(() => setText(""), []);

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-[220px] sm:w-[260px]">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="h-9 pr-9"
        />
        {text ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
            onClick={clear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
        )}
      </div>
    </div>
  );
}
