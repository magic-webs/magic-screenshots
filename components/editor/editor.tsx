"use client";

import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  DownloadIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthToken } from "@convex-dev/auth/react";
import { SiteHeader } from "@/components/site-header";
import { DesignPanel } from "@/components/editor/design-panel";
import { ScreenshotCard } from "@/components/editor/screenshot-card";
import { UploadZone } from "@/components/editor/upload-zone";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import {
  EXPORT_TARGETS,
  PREVIEW_TARGET,
  type DesignColors,
  type Platform,
  type TemplateId,
} from "@/lib/screenshot/config";
import { downloadBlob, exportZip, renderToBlob, slugify } from "@/lib/screenshot/client";

const MAX_SCREENSHOTS = 10;

type Copy = { headline: string; subheadline: string };

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof ConvexError) return String(err.data);
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function EditorSkeleton() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[340px_1fr]">
        <Skeleton className="h-[600px] rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[9/19] rounded-xl" />
          ))}
        </div>
      </main>
    </>
  );
}

export function Editor({ projectId }: { projectId: string }) {
  const authToken = useAuthToken();
  const router = useRouter();
  const project = useQuery(api.projects.get, { projectId });

  const updateProject = useMutation(api.projects.update);
  const removeProject = useMutation(api.projects.remove);
  const generateUploadUrl = useMutation(api.screenshots.generateUploadUrl);
  const addScreenshot = useMutation(api.screenshots.add);
  const updateCopy = useMutation(api.screenshots.updateCopy);
  const setCopyBulk = useMutation(api.screenshots.setCopyBulk);
  const moveScreenshot = useMutation(api.screenshots.move);
  const removeScreenshot = useMutation(api.screenshots.remove);

  const [platform, setPlatform] = useState<Platform>("ios");
  const [uploading, setUploading] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Copy>>({});
  const [colorDraft, setColorDraft] = useState<Partial<DesignColors>>({});
  const copyTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const colorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const colors = useMemo<DesignColors>(
    () => ({
      primary: colorDraft.primary ?? project?.primaryColor ?? "#0f766e",
      secondary: colorDraft.secondary ?? project?.secondaryColor ?? "#2dd4bf",
      text: colorDraft.text ?? project?.textColor ?? "#ffffff",
    }),
    [colorDraft, project?.primaryColor, project?.secondaryColor, project?.textColor],
  );

  if (project === undefined) return <EditorSkeleton />;

  if (project === null) {
    return (
      <>
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-6">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Project not found</EmptyTitle>
              <EmptyDescription>
                It may have been deleted, or it belongs to another account.
              </EmptyDescription>
            </EmptyHeader>
            <Link href="/" className={buttonVariants()}>
              Back to projects
            </Link>
          </Empty>
        </main>
      </>
    );
  }

  const pid = project._id;
  const template = project.templateId as TemplateId;
  const target = PREVIEW_TARGET[platform];
  const shots = project.screenshots.map((s) => ({
    ...s,
    ...(drafts[s._id] ?? { headline: s.headline, subheadline: s.subheadline }),
  }));
  const remaining = MAX_SCREENSHOTS - shots.length;
  const design = { template, colors };
  const busy = generating || exportProgress !== null;

  async function onFiles(files: File[]) {
    setUploading((n) => n + files.length);
    for (const file of files) {
      try {
        const uploadUrl = await generateUploadUrl({ projectId: pid });
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
        await addScreenshot({ projectId: pid, storageId });
      } catch (err) {
        toast.add({
          type: "error",
          title: `Could not upload ${file.name}`,
          description: errorMessage(err, "Please try again."),
        });
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function onCopyChange(id: Id<"screenshots">, copy: Copy) {
    setDrafts((d) => ({ ...d, [id]: copy }));
    clearTimeout(copyTimers.current[id]);
    copyTimers.current[id] = setTimeout(async () => {
      try {
        await updateCopy({ screenshotId: id, ...copy });
        setDrafts((d) => {
          const current = d[id];
          if (!current || current.headline !== copy.headline || current.subheadline !== copy.subheadline) {
            return d;
          }
          const next = { ...d };
          delete next[id];
          return next;
        });
      } catch (err) {
        toast.add({ type: "error", title: "Could not save caption", description: errorMessage(err, "") });
      }
    }, 600);
  }

  function onColors(next: Partial<DesignColors>) {
    const merged = { ...colorDraft, ...next };
    setColorDraft(merged);
    if (colorTimer.current) clearTimeout(colorTimer.current);
    colorTimer.current = setTimeout(async () => {
      try {
        await updateProject({
          projectId: pid,
          primaryColor: merged.primary,
          secondaryColor: merged.secondary,
          textColor: merged.text,
        });
        setColorDraft({});
      } catch (err) {
        toast.add({ type: "error", title: "Could not save colors", description: errorMessage(err, "") });
      }
    }, 400);
  }

  async function onTemplate(id: TemplateId) {
    try {
      await updateProject({ projectId: pid, templateId: id });
    } catch (err) {
      toast.add({ type: "error", title: "Could not change template", description: errorMessage(err, "") });
    }
  }

  async function onDetails(details: { name?: string; description?: string }) {
    try {
      await updateProject({ projectId: pid, ...details });
    } catch (err) {
      toast.add({ type: "error", title: "Could not save details", description: errorMessage(err, "") });
    }
  }

  async function onGenerate() {
    if (!project) return;
    const withUrls = shots.filter((s): s is typeof s & { url: string } => s.url !== null);
    if (!withUrls.length) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          appName: project.name,
          description: project.description,
          screenshots: withUrls.map((s) => ({ id: s._id, url: s.url })),
        }),
      });
      const data = (await res.json()) as
        | { items: { id: Id<"screenshots">; headline: string; subheadline: string }[] }
        | { error: string };
      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "AI request failed");
      }
      const items = data.items.map((i) => ({
        screenshotId: i.id,
        headline: i.headline,
        subheadline: i.subheadline,
      }));
      await setCopyBulk({ projectId: pid, items });
      setDrafts({});
      toast.add({ type: "success", title: "Captions generated", description: "Edit any caption to fine-tune it." });
    } catch (err) {
      toast.add({ type: "error", title: "AI generation failed", description: errorMessage(err, "Please try again.") });
    } finally {
      setGenerating(false);
    }
  }

  async function onExport() {
    if (!project || !shots.length) return;
    setExportProgress("Preparing…");
    try {
      await exportZip(
        project.name,
        design,
        shots.map((s) => ({ url: s.url, headline: s.headline, subheadline: s.subheadline })),
        EXPORT_TARGETS,
        (done, total) => setExportProgress(`${done}/${total}`),
      );
    } catch (err) {
      toast.add({ type: "error", title: "Export failed", description: errorMessage(err, "Please try again.") });
    } finally {
      setExportProgress(null);
    }
  }

  async function onDownloadOne(index: number) {
    if (!project) return;
    const s = shots[index];
    try {
      const blob = await renderToBlob(target, design, s);
      downloadBlob(
        blob,
        `${slugify(project.name)}-${platform}-${String(index + 1).padStart(2, "0")}.png`,
      );
    } catch (err) {
      toast.add({ type: "error", title: "Download failed", description: errorMessage(err, "") });
    }
  }

  async function onDeleteProject() {
    try {
      await removeProject({ projectId: pid });
      router.push("/");
    } catch (err) {
      toast.add({ type: "error", title: "Could not delete project", description: errorMessage(err, "") });
    }
  }

  return (
    <>
      <SiteHeader>
        <Button
          variant="outline"
          onClick={onGenerate}
          disabled={busy || shots.length === 0}
        >
          {generating ? <Spinner /> : <SparklesIcon />}
          <span className="hidden sm:inline">Generate captions with AI</span>
          <span className="sm:hidden">AI</span>
        </Button>
        <Button onClick={onExport} disabled={busy || shots.length === 0}>
          {exportProgress ? <Spinner /> : <DownloadIcon />}
          <span className="tabular-nums">
            {exportProgress ? (
              <>
                <span className="hidden sm:inline">Exporting </span>
                {exportProgress}
              </>
            ) : (
              <>
                Export<span className="hidden sm:inline"> ZIP</span>
              </>
            )}
          </span>
        </Button>
      </SiteHeader>

      <main className="mx-auto grid w-full max-w-7xl flex-1 items-start gap-6 px-[max(1rem,env(safe-area-inset-left))] py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:grid-cols-[340px_1fr]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
          <div className="flex items-center gap-2">
            <Link href="/" className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label="Back">
              <ArrowLeftIcon />
            </Link>
            <h1 className="truncate text-lg font-semibold">{project.name}</h1>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Delete project" />
                }
              >
                <Trash2Icon />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes {project.name} and all of its uploaded screenshots.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={onDeleteProject}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <DesignPanel
            target={target}
            template={template}
            colors={colors}
            sample={
              shots[0] ?? {
                url: null,
                headline: "Your headline here",
                subheadline: "Describe the benefit",
              }
            }
            name={project.name}
            description={project.description}
            onTemplate={onTemplate}
            onColors={onColors}
            onDetails={onDetails}
          />
        </aside>

        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Tabs value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <TabsList>
                <TabsTrigger value="ios">
                  <span className="hidden sm:inline">App Store · </span>iPhone
                </TabsTrigger>
                <TabsTrigger value="android">
                  <span className="hidden sm:inline">Google Play · </span>Android
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Badge variant="outline">
              Preview {target.width}×{target.height}
            </Badge>
            <p className="ml-auto hidden text-xs text-muted-foreground md:block">
              ZIP includes {EXPORT_TARGETS.map((t) => `${t.store} ${t.label}`).join(", ")}
            </p>
          </div>

          {shots.length === 0 ? (
            <UploadZone uploading={uploading} remaining={remaining} onFiles={onFiles} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shots.map((s, i) => (
                <ScreenshotCard
                  key={s._id}
                  index={i}
                  total={shots.length}
                  target={target}
                  template={template}
                  colors={colors}
                  url={s.url}
                  headline={s.headline}
                  subheadline={s.subheadline}
                  onChange={(copy) => onCopyChange(s._id, copy)}
                  onMove={(direction) =>
                    void moveScreenshot({ screenshotId: s._id, direction }).catch((err) =>
                      toast.add({ type: "error", title: "Could not reorder", description: errorMessage(err, "") }),
                    )
                  }
                  onDelete={() =>
                    void removeScreenshot({ screenshotId: s._id }).catch((err) =>
                      toast.add({ type: "error", title: "Could not delete", description: errorMessage(err, "") }),
                    )
                  }
                  onDownload={() => void onDownloadOne(i)}
                />
              ))}
              {remaining > 0 && (
                <UploadZone compact uploading={uploading} remaining={remaining} onFiles={onFiles} />
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
