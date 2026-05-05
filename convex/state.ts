import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("global_state")
      .withIndex("by_family", (q) => q.eq("id", args.id))
      .first();
  },
});

export const save = mutation({
  args: { id: v.string(), data: v.any() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("global_state")
      .withIndex("by_family", (q) => q.eq("id", args.id))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { data: args.data });
    } else {
      await ctx.db.insert("global_state", { id: args.id, data: args.data });
    }
  },
});
