import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  global_state: defineTable({
    id: v.string(),
    data: v.any(),
  }).index("by_family", ["id"]),
});
