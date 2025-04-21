import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  groups: defineTable({
    groupName: v.string(),
    description: v.optional(v.string()),
    creatorId: v.string(),
    status: v.union(v.literal("open"), v.literal("closed")),
    pendingMembers: v.array(v.string()),
    approvedMembers: v.optional(v.array(v.string())),
    memberCount: v.number(),
    maxMembers: v.number(),
    posts: v.array(v.id("posts")),
    createdAt: v.number(),
    groupImage: v.optional(v.string()),
  })
    .index("by_creator", ["creatorId"])
    .index("by_member", ["approvedMembers"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  posts: defineTable({
    groupId: v.id("groups"),
    userId: v.string(),
    message: v.string(),
    createdAt: v.number(),
    type: v.string(),
    addedMembers: v.array(v.string()),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    phoneNumber: v.string(),
    groups: v.array(v.id("groups")),
    status: v.string(),
    profilePicture: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_name", ["name"]),

  sema: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    location: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    type: v.union(
      v.literal("academic"),
      v.literal("sports"),
      v.literal("cultural"),
      v.literal("other")
    ),
    maxParticipants: v.number(),
    currentParticipants: v.number(),
    registeredUsers: v.array(v.string()),
    registeredUsersName: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    attachments: v.optional(v.array(v.string())),
    organizer: v.optional(v.string()),
    contactInfo: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    feedback: v.optional(
      v.array(
        v.object({
          userId: v.string(),
          rating: v.number(),
          comment: v.optional(v.string()),
          createdAt: v.number(),
        })
      )
    ),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_date", ["startDate"])
    .index("by_created", ["createdAt"]),
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
