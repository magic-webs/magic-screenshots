"use client";

import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScreenshotPreview } from "@/components/screenshot-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  TEMPLATES,
  type DesignColors,
  type ExportTarget,
  type TemplateId,
} from "@/lib/screenshot/config";

export const COLOR_PRESETS: DesignColors[] = [
  { primary: "#5b0f1f", secondary: "#d9467a", text: "#ffffff" }, // RichyReach maroon + pink
  { primary: "#4f46e5", secondary: "#06b6d4", text: "#ffffff" },
  { primary: "#f43f5e", secondary: "#f59e0b", text: "#ffffff" },
  { primary: "#059669", secondary: "#84cc16", text: "#ffffff" },
  { primary: "#7c3aed", secondary: "#ec4899", text: "#ffffff" },
  { primary: "#0f172a", secondary: "#3b82f6", text: "#ffffff" },
  { primary: "#ea580c", secondary: "#facc15", text: "#1c1917" },
];

type Props = {
  target: ExportTarget;
  template: TemplateId;
  colors: DesignColors;
  sample: { url: string | null; headline: string; subheadline: string };
  name: string;
  description: string;
  onTemplate: (id: TemplateId) => void;
  onColors: (colors: Partial<DesignColors>) => void;
  onDetails: (details: { name?: string; description?: string }) => void;
};

export function DesignPanel({
  target,
  template,
  colors,
  sample,
  name,
  description,
  onTemplate,
  onColors,
  onDetails,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Template</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t) => {
              const active = t.id === template;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTemplate(t.id)}
                  title={t.description}
                  aria-pressed={active}
                  className={cn(
                    "group relative flex flex-col gap-1 rounded-lg p-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted",
                  )}
                >
                  <ScreenshotPreview
                    target={target}
                    template={t.id}
                    colors={colors}
                    headline={sample.headline}
                    subheadline={sample.subheadline}
                    imageUrl={sample.url}
                    pixelWidth={180}
                    className="rounded-md"
                  />
                  <span className="truncate px-0.5 text-xs font-medium">{t.name}</span>
                  {active && (
                    <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckIcon className="size-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-3">
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.primary + p.secondary}
                type="button"
                onClick={() => onColors(p)}
                className="size-8 rounded-full ring-offset-2 ring-offset-background outline-none hover:ring-2 hover:ring-ring focus-visible:ring-2 focus-visible:ring-ring"
                style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})` }}
                aria-label={`Use ${p.primary} and ${p.secondary}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["primary", "Primary"],
                ["secondary", "Secondary"],
                ["text", "Text"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} className="gap-1.5">
                <FieldLabel htmlFor={`color-${key}`} className="text-xs">
                  {label}
                </FieldLabel>
                <Input
                  id={`color-${key}`}
                  type="color"
                  value={colors[key]}
                  onChange={(e) => onColors({ [key]: e.target.value })}
                  className="h-9 cursor-pointer p-1"
                />
              </Field>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App details</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="project-name">App name</FieldLabel>
              <Input
                id="project-name"
                defaultValue={name}
                maxLength={80}
                onBlur={(e) => {
                  if (e.target.value.trim() && e.target.value !== name) {
                    onDetails({ name: e.target.value });
                  }
                }}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="project-description">Description</FieldLabel>
              <Textarea
                id="project-description"
                defaultValue={description}
                maxLength={500}
                rows={3}
                placeholder="Used by AI to write captions"
                onBlur={(e) => {
                  if (e.target.value !== description) {
                    onDetails({ description: e.target.value });
                  }
                }}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
