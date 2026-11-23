"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ImagesIcon,
  LayoutTemplateIcon,
  SmartphoneIcon,
  SparklesIcon,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { SignInInline } from "@/components/auth/sign-in-card";
import { BRAND_NAME } from "@/components/brand/logo";
import {
  CaptionsSection,
  ExportSection,
  FinalCta,
  focusSignIn,
  HowItWorks,
  SiteFooter,
} from "@/components/landing/sections";
import { Showcase } from "@/components/landing/showcase";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { TEMPLATES } from "@/lib/screenshot/config";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: ImagesIcon, title: "Upload screenshots", text: "Drop up to 10 raw app screenshots." },
  { icon: LayoutTemplateIcon, title: "5 templates", text: "Pick a style and brand colors." },
  { icon: SmartphoneIcon, title: "iPhone & Android frames", text: "Real device frames, store sizes." },
  { icon: SparklesIcon, title: "AI captions", text: "Claude writes benefit-led headlines." },
];

export function HomeView() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  return (
    <>
      <SiteHeader>{!isLoading && !isAuthenticated && <LandingNav />}</SiteHeader>
      <main className="w-full flex-1 pt-12 pb-16 sm:pt-20">
        {isAuthenticated ? (
          <>
            <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              <div className="flex flex-col gap-6">
                <HeroCopy />
                <FeatureList />
              </div>
              <NewProjectCard />
            </section>
            <ProjectList />
          </>
        ) : (
          <>
            <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center">
              <HeroCopy centered animated />
              <div
                id="start"
                className="landing-rise mt-9 w-full max-w-md scroll-mt-24"
                style={{ "--rise-delay": "420ms", "--rise-distance": "8px" } as React.CSSProperties}
              >
                {isLoading ? (
                  <Skeleton className="h-[4.5rem] rounded-xl" />
                ) : (
                  <SignInInline />
                )}
              </div>
            </section>
            <Showcase />
            <HowItWorks />
            <CaptionsSection />
            <ExportSection />
            <FinalCta />
          </>
        )}
      </main>
      {!isAuthenticated && <SiteFooter />}
    </>
  );
}

function LandingNav() {
  return (
    <nav className="flex items-center gap-1">
      {[
        { href: "#how", label: "How it works" },
        { href: "#captions", label: "AI captions" },
        { href: "#export", label: "Export" },
      ].map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="hidden rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground md:inline"
        >
          {l.label}
        </a>
      ))}
      <Button size="sm" className="ml-2" onClick={focusSignIn}>
        Get started
      </Button>
    </nav>
  );
}

function NewProjectCard() {
  const router = useRouter();
  const createProject = useMutation(api.projects.create);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const id = await createProject({ name, description });
      router.push(`/projects/${id}`);
    } catch (err) {
      toast.add({
        type: "error",
        title: "Could not create project",
        description: err instanceof ConvexError ? String(err.data) : "Please try again.",
      });
      setCreating(false);
    }
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>Start a new project</CardTitle>
          <CardDescription>
            Tell us about your app. The description helps the AI write better captions.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="app-name">App name</FieldLabel>
              <Input
                id="app-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. FitTrack"
                maxLength={80}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="app-description">Short description</FieldLabel>
              <Textarea
                id="app-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does your app do and who is it for?"
                maxLength={500}
                rows={4}
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!name.trim() || creating}
          >
            {creating && <Spinner />}
            Create project
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

const HEADLINE = ["Store", "screenshots", "that", "sell", "your", "app."];
// Delays shrink as the line goes on, so the words arrive as one wave.
const WORD_DELAYS = [0, 70, 130, 180, 225, 265];

function HeroCopy({ centered = false, animated = false }: { centered?: boolean; animated?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-5", centered && "items-center")}>
      <span
        className={cn(
          "inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs",
          animated && "landing-fade",
        )}
      >
        <span className="size-1.5 rounded-full bg-linear-to-r from-teal-400 to-emerald-400" />
        App Store + Google Play, with AI captions
      </span>
      <h1 className="text-[2.6rem] leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
        {HEADLINE.map((word, i) => (
          <span key={word}>
            <span
              className={cn(
                "inline-block",
                animated && "word-in",
                word === "sell" &&
                  "bg-linear-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text pr-[0.04em] text-transparent",
              )}
              style={animated ? ({ "--word-delay": `${WORD_DELAYS[i]}ms` } as React.CSSProperties) : undefined}
            >
              {word}
            </span>
            {i < HEADLINE.length - 1 && " "}
          </span>
        ))}
      </h1>
      <p
        className={cn(
          "max-w-xl text-lg text-pretty text-muted-foreground sm:text-xl sm:leading-relaxed",
          centered && "mx-auto",
          animated && "landing-rise",
        )}
        style={animated ? ({ "--rise-delay": "320ms", "--rise-distance": "8px" } as React.CSSProperties) : undefined}
      >
        Drop in raw captures. {BRAND_NAME} frames them in real devices, writes the
        headlines with AI and exports every size both stores ask for.
      </p>
    </div>
  );
}

function FeatureList({ columns = 2 }: { columns?: 2 | 4 }) {
  return (
    <ul
      className={cn(
        "grid gap-x-6 gap-y-4 text-left sm:grid-cols-2",
        columns === 4 && "lg:grid-cols-4",
      )}
    >
      {FEATURES.map((f) => (
        <li key={f.title} className="flex items-start gap-3">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground/80">
            <f.icon className="size-3.5" />
          </span>
          <p className="text-sm leading-snug">
            <span className="font-medium">{f.title}.</span>{" "}
            <span className="text-muted-foreground">{f.text}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

function ProjectList() {
  const projects = useQuery(api.projects.listMine);
  return (
    <section className="mx-auto mt-16 flex w-full max-w-7xl flex-col gap-4 px-4">
      <h2 className="text-xl font-semibold">Your projects</h2>
      {projects === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImagesIcon />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Create your first project above to start generating store screenshots.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((p) => (
            <Link
              key={p._id}
              href={`/projects/${p._id}`}
              className="group overflow-hidden rounded-xl border transition-[border-color,transform] duration-150 ease-ui hover:border-foreground/30 active:scale-[0.98]"
            >
              <div className="flex h-36 items-center justify-center overflow-hidden bg-muted">
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.coverUrl}
                    alt=""
                    className="h-full w-full object-cover object-top transition-transform duration-300 ease-ui group-hover:scale-[1.03]"
                  />
                ) : (
                  <ImagesIcon className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-3">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {TEMPLATES.find((t) => t.id === p.templateId)?.name ?? "Custom"} template
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
