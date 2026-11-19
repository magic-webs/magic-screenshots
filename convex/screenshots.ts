import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import {
  MAX_SCREENSHOTS,
  requireOwnedProject,
  requireOwnedScreenshot,
} from "./lib";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const generateUploadUrl = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const add = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);

    const meta = await ctx.db.system.get("_storage", args.storageId);
    const isImage = ALLOWED_TYPES.includes(meta?.contentType ?? "");
    if (!meta || !isImage || meta.size > MAX_BYTES) {
      await ctx.storage.delete(args.storageId);
      throw new ConvexError("Upload a PNG, JPG or WebP image under 10 MB");
    }

    const existing = await ctx.db
      .query("screenshots")
      .withIndex("by_projectId_and_order", (q) => q.eq("projectId", args.projectId))
      .take(MAX_SCREENSHOTS);
    if (existing.length >= MAX_SCREENSHOTS) {
      await ctx.storage.delete(args.storageId);
      throw new ConvexError(
        "A project can hold up to " + MAX_SCREENSHOTS + " screenshots",
      );
    }
    const last = existing[existing.length - 1];
    return await ctx.db.insert("screenshots", {
      projectId: args.projectId,
      storageId: args.storageId,
      order: last ? last.order + 1 : 0,
      headline: "Your headline here",
      subheadline: "Describe the benefit in a few words",
    });
  },
});

export const updateCopy = mutation({
  args: {
    screenshotId: v.id("screenshots"),
    headline: v.string(),
    subheadline: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOwnedScreenshot(ctx, args.screenshotId);
    await ctx.db.patch("screenshots", args.screenshotId, {
      headline: args.headline.slice(0, 80),
      subheadline: args.subheadline.slice(0, 140),
    });
    return null;
  },
});

export const setCopyBulk = mutation({
  args: {
    projectId: v.id("projects"),
    items: v.array(
      v.object({
        screenshotId: v.id("screenshots"),
        headline: v.string(),
        subheadline: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    for (const item of args.items.slice(0, MAX_SCREENSHOTS)) {
      const shot = await ctx.db.get("screenshots", item.screenshotId);
      if (!shot || shot.projectId !== args.projectId) continue;
      await ctx.db.patch("screenshots", item.screenshotId, {
        headline: item.headline.slice(0, 80),
        subheadline: item.subheadline.slice(0, 140),
      });
    }
    return null;
  },
});

export const move = mutation({
  args: {
    screenshotId: v.id("screenshots"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const shot = await requireOwnedScreenshot(ctx, args.screenshotId);
    const neighbor =
      args.direction === "up"
        ? await ctx.db
            .query("screenshots")
            .withIndex("by_projectId_and_order", (q) =>
              q.eq("projectId", shot.projectId).lt("order", shot.order),
            )
            .order("desc")
            .first()
        : await ctx.db
            .query("screenshots")
            .withIndex("by_projectId_and_order", (q) =>
              q.eq("projectId", shot.projectId).gt("order", shot.order),
            )
            .first();
    if (!neighbor) return null;
    await ctx.db.patch("screenshots", shot._id, { order: neighbor.order });
    await ctx.db.patch("screenshots", neighbor._id, { order: shot.order });
    return null;
  },
});

export const remove = mutation({
  args: { screenshotId: v.id("screenshots") },
  handler: async (ctx, args) => {
    const shot = await requireOwnedScreenshot(ctx, args.screenshotId);
    await ctx.storage.delete(shot.storageId);
    await ctx.db.delete("screenshots", shot._id);
    return null;
  },
});
