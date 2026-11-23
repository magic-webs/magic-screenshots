"use client";

import {
  ArrowRightIcon,
  CheckIcon,
  FileArchiveIcon,
  FolderIcon,
  ImageIcon,
  LayoutTemplateIcon,
  UploadIcon,
  WandIcon,
} from "lucide-react";
import { BRAND_NAME, Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";
import { EXPORT_TARGETS, TEMPLATES } from "@/lib/screenshot/config";

/** Scrolls the hero sign-in into view and focuses the username field. */
export function focusSignIn() {
  const input = document.getElementById("hero-username");
  if (!input) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  input.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  window.setTimeout(() => input.focus({ preventScroll: true }), reduce ? 0 : 450);
}

function SectionHeading({
  eyebrow,
  title,
  text,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  text: string;
  centered?: boolean;
}) {
  return (
    <Reveal className={centered ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="text-sm font-medium text-teal-700">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-base text-pretty text-muted-foreground sm:text-lg">{text}</p>
    </Reveal>
  );
}

const STEPS = [
  {
    icon: UploadIcon,
    title: "Drop in your captures",
    text: "Up to 10 PNG, JPEG or WebP screenshots, straight from the simulator or your phone.",
  },
  {
    icon: LayoutTemplateIcon,
    title: "Pick a look",
    text: `${TEMPLATES.length} templates, your brand colours and real iPhone and Android frames. Every change previews live.`,
  },
  {
    icon: FileArchiveIcon,
    title: "Export for both stores",
    text: "One ZIP with every required size, already sorted into App Store and Google Play folders.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pt-24 sm:pt-32">
      <SectionHeading
        centered
        eyebrow="How it works"
        title="From raw captures to a store page in three steps"
        text="No design tool, no templates to wrangle, no resizing by hand."
      />
      <ol className="mt-12 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal
            as="li"
            key={step.title}
            delay={[0, 80, 140][i]}
            className="relative flex flex-col gap-4 rounded-2xl border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <step.icon className="size-5" />
              </span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                0{i + 1}
              </span>
            </div>
            <div>
              <h3 className="font-semibold tracking-[-0.01em]">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

const CAPTIONS = [
  { color: "from-teal-500 to-emerald-400", headline: "Close every ring", sub: "Daily goals that stick" },
  { color: "from-emerald-500 to-lime-400", headline: "See your progress grow", sub: "Weekly trends at a glance" },
  { color: "from-rose-500 to-amber-400", headline: "Never miss a workout", sub: "Smart, gentle reminders" },
];

export function CaptionsSection() {
  return (
    <section
      id="captions"
      className="mx-auto grid w-full max-w-6xl scroll-mt-20 grid-cols-1 items-center gap-12 px-4 pt-24 sm:pt-32 lg:grid-cols-2 lg:gap-16"
    >
      <div className="flex flex-col gap-6">
        <SectionHeading
          eyebrow="AI captions"
          title="Headlines that sell, written for you"
          text="Describe your app once. Claude writes a short, benefit-led headline and subline for every screenshot. Edit any of them before you export."
        />
        <Reveal delay={80} as="ul" className="flex flex-col gap-2.5 text-sm">
          {["One click for the whole set", "Short enough to read at thumbnail size", "Always editable, never locked in"].map(
            (item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <CheckIcon className="size-3" />
                </span>
                {item}
              </li>
            ),
          )}
        </Reveal>
      </div>

      <Reveal delay={100} className="rounded-2xl border bg-card p-4 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.18)] sm:p-5">
        <div className="rounded-xl border bg-muted/40 p-3.5">
          <p className="text-xs font-medium text-muted-foreground">App description</p>
          <p className="mt-1 text-sm">FitTrack is a fitness tracker for busy people who want to build daily habits.</p>
        </div>
        <div className="mt-3 flex items-center gap-2 px-1 text-xs text-muted-foreground">
          <WandIcon className="size-3.5 text-teal-700" />
          Wrote 3 captions
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {CAPTIONS.map((c, i) => (
            <li key={c.headline} className="flex items-center gap-3 rounded-xl border bg-background p-2.5">
              <span className={`flex h-14 w-8 shrink-0 items-end justify-center rounded-md bg-linear-to-b ${c.color} pb-1`}>
                <span className="h-6 w-4 rounded-[3px] bg-white/85" />
              </span>
              <div className="caption-in min-w-0" style={{ "--caption-delay": `${300 + i * 140}ms` } as React.CSSProperties}>
                <p className="truncate text-sm font-semibold">{c.headline}</p>
                <p className="truncate text-xs text-muted-foreground">{c.sub}</p>
              </div>
              <span className="ml-auto hidden font-mono text-[0.7rem] text-muted-foreground tabular-nums min-[380px]:inline">
                0{i + 1}.png
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

export function ExportSection() {
  const groups = [
    { store: "App Store", folder: "app-store" },
    { store: "Google Play", folder: "google-play" },
  ];
  return (
    <section
      id="export"
      className="mx-auto grid w-full max-w-6xl scroll-mt-20 grid-cols-1 items-center gap-12 px-4 pt-24 sm:pt-32 lg:grid-cols-2 lg:gap-16"
    >
      <Reveal
        delay={100}
        className="order-2 rounded-2xl border bg-card p-4 font-mono text-[0.8rem] shadow-[0_18px_40px_-20px_rgb(0_0_0/0.18)] sm:p-5 lg:order-1"
      >
        <div className="flex items-center gap-2 border-b pb-3 font-sans text-sm font-medium">
          <FileArchiveIcon className="size-4 text-teal-700" />
          fittrack-screenshots.zip
        </div>
        <ul className="mt-3 flex flex-col gap-1.5">
          {groups.map((g) => (
            <li key={g.folder}>
              <p className="flex items-center gap-2 py-1">
                <FolderIcon className="size-3.5 text-muted-foreground" />
                {g.folder}/
              </p>
              <ul className="ml-[0.4rem] flex flex-col border-l pl-4">
                {EXPORT_TARGETS.filter((t) => t.store === g.store).map((t) => (
                  <li key={t.id} className="flex items-center gap-2 py-1">
                    <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{t.folder.split("/")[1]}/</span>
                    <span className="ml-auto shrink-0 text-muted-foreground tabular-nums">
                      {t.width}×{t.height}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Reveal>
      <div className="order-1 lg:order-2">
        <SectionHeading
          eyebrow="Export"
          title="Every size both stores ask for, sorted"
          text={`One download covers ${EXPORT_TARGETS.length} store sizes, from the 6.9" iPhone to Android phones. Files are numbered in order and ready to drag into App Store Connect and Play Console.`}
        />
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-24 sm:pt-32">
      <Reveal className="relative overflow-hidden rounded-3xl bg-[#0b0b14] px-6 py-14 text-center text-white sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-80 max-w-2xl rounded-full bg-[radial-gradient(closest-side,rgb(20_184_166/0.42),transparent)]"
        />
        <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
          Your next release deserves better screenshots
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-base text-pretty text-white/65 sm:text-lg">
          Make your first set in a few minutes. Sign in with a passkey, no password needed.
        </p>
        <Button
          onClick={focusSignIn}
          className="relative mt-8 h-11 rounded-xl bg-white px-5 text-sm text-[#0b0b14] hover:bg-white/90"
        >
          Make your screenshots
          <ArrowRightIcon />
        </Button>
      </Reveal>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 flex w-full max-w-6xl flex-col items-center justify-between gap-4 border-t px-4 py-8 text-sm text-muted-foreground sm:flex-row">
      <Logo className="text-foreground" />
      <p>
        © {BRAND_NAME}. Screenshots for the App Store and Google Play.
      </p>
    </footer>
  );
}
