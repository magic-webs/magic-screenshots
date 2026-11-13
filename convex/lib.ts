import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const MAX_SCREENSHOTS = 10;

export async function requireOwnedProject(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  ownerKey: string,
) {
  const project = await ctx.db.get("projects", projectId);
  if (!project || project.ownerKey !== ownerKey) {
    throw new ConvexError("Project not found");
  }
  return project;
}

export async function requireOwnedScreenshot(
  ctx: QueryCtx | MutationCtx,
  screenshotId: Id<"screenshots">,
  ownerKey: string,
) {
  const shot = await ctx.db.get("screenshots", screenshotId);
  if (!shot) throw new ConvexError("Screenshot not found");
  await requireOwnedProject(ctx, shot.projectId, ownerKey);
  return shot;
}
