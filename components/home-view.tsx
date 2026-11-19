"use client";

import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from "convex/react";
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
import { SignInCard } from "@/components/auth/sign-in-card";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
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

const FEATURES = [
  { icon: ImagesIcon, title: "Upload screenshots", text: "Drop up to 10 raw app screenshots." },
  { icon: LayoutTemplateIcon, title: "5 templates", text: "Pick a style and brand colors." },
  { icon: SmartphoneIcon, title: "iPhone & Android frames", text: "Real device frames, store sizes." },
  { icon: SparklesIcon, title: "AI captions", text: "Claude writes benefit-led headlines." },
];

export function HomeView() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:py-16">
        <section className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Hero />
          <AuthLoading>
            <Skeleton className="h-80 rounded-xl" />
          </AuthLoading>
          <Unauthenticated>
            <SignInCard
              title="Sign in to start"
              description="Use a passkey, so there's no password to remember. A new username creates an account."
            />
          </Unauthenticated>
          <Authenticated>
            <NewProjectCard />
          </Authenticated>
        </section>
        <Authenticated>
          <ProjectList />
        </Authenticated>
      </main>
    </>
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

function Hero() {
  return (
    <div className="flex flex-col gap-6">
      <Badge variant="secondary" className="w-fit">
        App Store + Google Play
      </Badge>
      <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
        Store-ready screenshots from your raw app captures
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Upload your screenshots, choose one of {TEMPLATES.length} templates, and export
        pixel-perfect iPhone and Android images sized for both stores, framed and captioned.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex items-start gap-3 rounded-xl border p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <f.icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">{f.title}</p>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectList() {
  const projects = useQuery(api.projects.listMine);
  return (
    <section className="mt-16 flex flex-col gap-4">
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
              className="group overflow-hidden rounded-xl border transition-colors hover:border-foreground/30"
            >
              <div className="flex h-36 items-center justify-center overflow-hidden bg-muted">
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.coverUrl}
                    alt=""
                    className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
                  />
                ) : (
                  <ImagesIcon className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-3">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {TEMPLATES.find((t) => t.id === p.templateId)?.name} template
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
