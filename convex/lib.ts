import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const MAX_SCREENSHOTS = 10;

/** The signed-in user's id, or throws when the caller is signed out. */
export async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Sign in to continue");
  return userId;
}

export async function requireOwnedProject(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
) {
  const userId = await requireUserId(ctx);
  const project = await ctx.db.get("projects", projectId);
  if (!project || project.userId !== userId) {
    throw new ConvexError("Project not found");
  }
  return project;
}

export async function requireOwnedScreenshot(
  ctx: QueryCtx | MutationCtx,
  screenshotId: Id<"screenshots">,
) {
  const shot = await ctx.db.get("screenshots", screenshotId);
  if (!shot) throw new ConvexError("Screenshot not found");
  await requireOwnedProject(ctx, shot.projectId);
  return shot;
}
