"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DownloadIcon,
  Trash2Icon,
} from "lucide-react";
import { ScreenshotPreview } from "@/components/screenshot-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DesignColors, ExportTarget, TemplateId } from "@/lib/screenshot/config";

type Props = {
  index: number;
  total: number;
  target: ExportTarget;
  template: TemplateId;
  colors: DesignColors;
  url: string | null;
  headline: string;
  subheadline: string;
  onChange: (copy: { headline: string; subheadline: string }) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
  onDownload: () => void;
};

export function ScreenshotCard({
  index,
  total,
  target,
  template,
  colors,
  url,
  headline,
  subheadline,
  onChange,
  onMove,
  onDelete,
  onDownload,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
      <div className="overflow-hidden rounded-lg border">
        <ScreenshotPreview
          target={target}
          template={template}
          colors={colors}
          headline={headline}
          subheadline={subheadline}
          imageUrl={url}
        />
      </div>
      <Input
        value={headline}
        maxLength={80}
        placeholder="Headline"
        aria-label={`Headline for screenshot ${index + 1}`}
        onChange={(e) => onChange({ headline: e.target.value, subheadline })}
        className="font-medium"
      />
      <Textarea
        value={subheadline}
        maxLength={140}
        rows={2}
        placeholder="Subheadline"
        aria-label={`Subheadline for screenshot ${index + 1}`}
        onChange={(e) => onChange({ headline, subheadline: e.target.value })}
        className="min-h-0 resize-none text-sm"
      />
      <div className="flex items-center gap-1">
        <span className="mr-auto text-xs text-muted-foreground">
          {index + 1} / {total}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={index === 0}
          onClick={() => onMove("up")}
          aria-label="Move earlier"
        >
          <ArrowLeftIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={index === total - 1}
          onClick={() => onMove("down")}
          aria-label="Move later"
        >
          <ArrowRightIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onDownload} aria-label="Download PNG">
          <DownloadIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label="Delete screenshot">
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}
