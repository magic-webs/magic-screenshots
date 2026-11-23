import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { MAX_SCREENSHOTS, requireOwnedProject, requireUserId } from "./lib";
import { templateId } from "./schema";

const hexColor = /^#[0-9a-fA-F]{6}$/;

export const create = mutation({
  args: { name: v.string(), description: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const name = args.name.trim();
    if (!name) throw new ConvexError("App name is required");
    return await ctx.db.insert("projects", {
      userId,
      name: name.slice(0, 80),
      description: args.description.trim().slice(0, 500),
      templateId: "classic",
      primaryColor: "#0f766e",
      secondaryColor: "#2dd4bf",
      textColor: "#ffffff",
    });
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
    return await Promise.all(
      projects.map(async (p) => {
        const first = await ctx.db
          .query("screenshots")
          .withIndex("by_projectId_and_order", (q) => q.eq("projectId", p._id))
          .first();
        return {
          _id: p._id,
          _creationTime: p._creationTime,
          name: p.name,
          description: p.description,
          templateId: p.templateId,
          coverUrl: first ? await ctx.storage.getUrl(first.storageId) : null,
        };
      }),
    );
  },
});

export const get = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const projectId = ctx.db.normalizeId("projects", args.projectId);
    if (!projectId) return null;
    const project = await ctx.db.get("projects", projectId);
    if (!project || project.userId !== userId) return null;
    const shots = await ctx.db
      .query("screenshots")
      .withIndex("by_projectId_and_order", (q) => q.eq("projectId", projectId))
      .take(MAX_SCREENSHOTS);
    const screenshots = await Promise.all(
      shots.map(async (s) => ({
        _id: s._id,
        order: s.order,
        headline: s.headline,
        subheadline: s.subheadline,
        url: await ctx.storage.getUrl(s.storageId),
      })),
    );
    return {
      _id: project._id,
      name: project.name,
      description: project.description,
      templateId: project.templateId,
      primaryColor: project.primaryColor,
      secondaryColor: project.secondaryColor,
      textColor: project.textColor,
      screenshots,
    };
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    templateId: v.optional(templateId),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, ...fields }) => {
    await requireOwnedProject(ctx, projectId);
    const patch: typeof fields = {};
    if (fields.name !== undefined) {
      const name = fields.name.trim();
      if (!name) throw new ConvexError("App name is required");
      patch.name = name.slice(0, 80);
    }
    if (fields.description !== undefined) {
      patch.description = fields.description.trim().slice(0, 500);
    }
    if (fields.templateId !== undefined) patch.templateId = fields.templateId;
    for (const key of ["primaryColor", "secondaryColor", "textColor"] as const) {
      const value = fields[key];
      if (value === undefined) continue;
      if (!hexColor.test(value)) throw new ConvexError("Invalid color " + key);
      patch[key] = value;
    }
    await ctx.db.patch("projects", projectId, patch);
    return null;
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    const shots = await ctx.db
      .query("screenshots")
      .withIndex("by_projectId_and_order", (q) => q.eq("projectId", args.projectId))
      .take(MAX_SCREENSHOTS * 2);
    for (const s of shots) {
      await ctx.storage.delete(s.storageId);
      await ctx.db.delete("screenshots", s._id);
    }
    await ctx.db.delete("projects", args.projectId);
    return null;
  },
});

/**
 * Move projects created anonymously in this browser (before sign-in existed)
 * to the signed-in user. Possessing the 64-char random ownerKey is the proof
 * of ownership; claimed projects drop the key so it can't be reused.
 */
export const claimAnonymous = mutation({
  args: { ownerKey: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (args.ownerKey.length < 16) return 0;
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_ownerKey", (q) => q.eq("ownerKey", args.ownerKey))
      .take(100);
    let claimed = 0;
    for (const p of projects) {
      if (p.userId !== undefined) continue;
      await ctx.db.patch("projects", p._id, { userId, ownerKey: undefined });
      claimed++;
    }
    return claimed;
  },
});
