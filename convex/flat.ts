import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFlatProfiles = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("flatProfiles").collect();
    return profiles.map((profile) => ({
      ...profile,
      rentPerPerson: Math.ceil(profile.totalRent / profile.maxOccupancy),
    }));
  },
});

export const addFlatProfile = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("flatProfiles", args);
  },
});

export const deleteFlatProfile = mutation({
  args: {
    id: v.id("flatProfiles"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
