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
  // App users. Credentials, usernames and sessions live in the Convex Auth
  // components; this table only holds the app-side user record.
  users: defineTable({}),

  projects: defineTable({
    // Signed-in owner. Optional only for projects made before sign-in existed,
    // which are claimed by their browser's legacy ownerKey (see projects.claimAnonymous).
    userId: v.optional(v.id("users")),
    // Legacy anonymous per-browser key. Cleared once the project is claimed.
    ownerKey: v.optional(v.string()),
    name: v.string(),
    description: v.string(),
    templateId,
    primaryColor: v.string(),
    secondaryColor: v.string(),
    textColor: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_ownerKey", ["ownerKey"]),

  screenshots: defineTable({
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
    order: v.number(),
    headline: v.string(),
    subheadline: v.string(),
  }).index("by_projectId_and_order", ["projectId", "order"]),
});
