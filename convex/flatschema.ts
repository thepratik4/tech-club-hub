//schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  flatProfiles: defineTable({
    houseName: v.string(),
    address: v.string(),
    totalRent: v.number(),
    maxOccupancy: v.number(),
    location: v.string(),
    distanceFromCollege: v.number(),
    hasWifi: v.boolean(),
    hasGeyser: v.boolean(),
    hasParking: v.boolean(),
    allowsGuests: v.boolean(),
  }),
});
