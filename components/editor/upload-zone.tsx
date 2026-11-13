"use client";

import { useRef, useState } from "react";
import { UploadIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const ACCEPT = ["image/png", "image/jpeg", "image/webp"];

type Props = {
  disabled?: boolean;
  uploading: number;
  remaining: number;
  onFiles: (files: File[]) => void;
  compact?: boolean;
};

export function UploadZone({ disabled, uploading, remaining, onFiles, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const blocked = disabled || remaining <= 0;

  function handle(list: FileList | null) {
    if (!list || blocked) return;
    const files = Array.from(list).filter((f) => ACCEPT.includes(f.type));
    if (files.length) onFiles(files.slice(0, remaining));
  }

  return (
    <button
      type="button"
      disabled={blocked}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60",
        compact ? "h-full min-h-48 p-4" : "p-10",
        dragging ? "border-primary bg-primary/5" : "hover:border-foreground/30 hover:bg-muted/50",
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
        {uploading > 0 ? <Spinner /> : <UploadIcon className="size-5" />}
      </span>
      <span className="text-sm font-medium">
        {uploading > 0
          ? `Uploading ${uploading} file${uploading > 1 ? "s" : ""}…`
          : remaining <= 0
            ? "Screenshot limit reached"
            : "Drop screenshots or click to upload"}
      </span>
      {!compact && (
        <span className="text-xs text-muted-foreground">
          PNG, JPG or WebP · portrait screenshots work best · {remaining} slot
          {remaining === 1 ? "" : "s"} left
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
    </button>
  );
}
