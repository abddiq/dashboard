import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    customerName: v.string(),
    customerPhone: v.string(),
    customerAddress: v.string(),
  },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    return await ctx.db.insert("deliveries", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const assignDriver = mutation({
  args: {
    deliveryId: v.id("deliveries"),
    driverId: v.id("drivers")
  },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    return await ctx.db.patch(args.deliveryId, {
      driverId: args.driverId,
      status: "assigned"
    });
  },
});

export const updateStatus = mutation({
  args: {
    deliveryId: v.id("deliveries"),
    status: v.string()
  },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    const updates: any = { status: args.status };
    if (args.status === "delivered") {
      updates.deliveredAt = Date.now();
    }
    return await ctx.db.patch(args.deliveryId, updates);
  },
});

export const listByCompany = query({
  args: {
    companyId: v.id("companies")
  },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    return await ctx.db
      .query("deliveries")
      .withIndex("by_company", q => q.eq("companyId", args.companyId))
      .collect();
  },
});
