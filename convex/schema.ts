import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const templateId = v.union(
  v.literal("classic"),
  v.literal("bold"),
  v.literal("minimal"),
  v.literal("spotlight"),
  v.literal("split"),
);

export default defineSchema({
  projects: defineTable({
    // Anonymous owner key stored in the browser. Swap for an auth identity later.
    ownerKey: v.string(),
    name: v.string(),
    description: v.string(),
    templateId,
    primaryColor: v.string(),
    secondaryColor: v.string(),
    textColor: v.string(),
  }).index("by_ownerKey", ["ownerKey"]),

  screenshots: defineTable({
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
    order: v.number(),
    headline: v.string(),
    subheadline: v.string(),
  }).index("by_projectId_and_order", ["projectId", "order"]),
});
