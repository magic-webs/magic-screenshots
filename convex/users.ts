import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation, query } from "./_generated/server";

/** Called by Convex Auth when a new passkey account signs up. */
export const createUser = internalMutation({
  args: {
    method: v.object({ name: v.literal("usernamePasskey"), profile: v.object({}) }),
  },
  returns: v.id("users"),
  handler: async (ctx) => {
    return await ctx.db.insert("users", {});
  },
});

/** The signed-in user, or null when signed out. */
export const me = query({
  args: {},
  returns: v.union(v.null(), v.object({ _id: v.id("users"), username: v.union(v.string(), v.null()) })),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const username = await ctx.runQuery(components.authUsername.public.getUsername, {
      userId,
    });
    return { _id: userId, username };
  },
});
