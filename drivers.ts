import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    return await ctx.db.insert("drivers", {
      ...args,
      status: "active"
    });
  },
});

export const listByCompany = query({
  args: {
    companyId: v.id("companies")
  },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    return await ctx.db
      .query("drivers")
      .withIndex("by_company", q => q.eq("companyId", args.companyId))
      .collect();
  },
});
