export type Platform = "ios" | "android";

export type TemplateId = "classic" | "bold" | "minimal" | "spotlight" | "split";

export type TemplateInfo = {
  id: TemplateId;
  name: string;
  description: string;
};

export const TEMPLATES: TemplateInfo[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Gradient background, centered headline, device below.",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Oversized left-aligned headline with a tilted device.",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Light, clean canvas with dark type and an accent bar.",
  },
  {
    id: "spotlight",
    name: "Spotlight",
    description: "Dark backdrop with a glowing halo behind the device.",
  },
  {
    id: "split",
    name: "Split",
    description: "Device drops in from the top, copy anchored at the bottom.",
  },
];

export type ExportTarget = {
  id: string;
  platform: Platform;
  store: "App Store" | "Google Play";
  label: string;
  width: number;
  height: number;
  folder: string;
};

/** Store-accepted portrait sizes. */
export const EXPORT_TARGETS: ExportTarget[] = [
  {
    id: "ios-6.9",
    platform: "ios",
    store: "App Store",
    label: 'iPhone 6.9"',
    width: 1320,
    height: 2868,
    folder: "app-store/iphone-6.9",
  },
  {
    id: "ios-6.5",
    platform: "ios",
    store: "App Store",
    label: 'iPhone 6.5"',
    width: 1242,
    height: 2688,
    folder: "app-store/iphone-6.5",
  },
  {
    id: "android-phone",
    platform: "android",
    store: "Google Play",
    label: "Phone",
    width: 1080,
    height: 1920,
    folder: "google-play/phone",
  },
];

export const PREVIEW_TARGET: Record<Platform, ExportTarget> = {
  ios: EXPORT_TARGETS[0],
  android: EXPORT_TARGETS[2],
};

export type DesignColors = {
  primary: string;
  secondary: string;
  text: string;
};
