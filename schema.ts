import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  companies: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    status: v.string(),
  }).index("by_name", ["name"]),

  drivers: defineTable({
    companyId: v.id("companies"),
    name: v.string(),
    phone: v.string(),
    status: v.string(), // active, inactive
    currentLocation: v.optional(v.object({
      lat: v.number(),
      lng: v.number()
    }))
  }).index("by_company", ["companyId"]),

  deliveries: defineTable({
    companyId: v.id("companies"),
    driverId: v.optional(v.id("drivers")),
    customerName: v.string(),
    customerPhone: v.string(),
    customerAddress: v.string(),
    status: v.string(), // pending, assigned, in-progress, delivered
    createdAt: v.number(),
    deliveredAt: v.optional(v.number())
  })
    .index("by_company", ["companyId"])
    .index("by_driver", ["driverId"])
    .index("by_status", ["status"])
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
