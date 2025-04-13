import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    return await ctx.db.insert("companies", {
      ...args,
      status: "active"
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await getAuthUserId(ctx);
    return await ctx.db
      .query("companies")
      .collect();
  },
});
