import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { useUser } from "@clerk/clerk-react";
import { env } from "process";
import exp from "constants";

// ✅ Create a new hackathon group
export const createHackathonGroup = mutation({
  args: {
    groupName: v.string(),
    description: v.optional(v.string()),
    creatorId: v.string(),
    maxMembers: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const groupId = await ctx.db.insert("groups", {
        groupName: args.groupName,
        description: args.description,
        creatorId: args.creatorId,
        status: "open",
        pendingMembers: [],
        approvedMembers: [args.creatorId], // ✅ Ensures at least creator is approved
        memberCount: 1,
        maxMembers: args.maxMembers,
        posts: [],
        createdAt: Date.now(),
        groupImage: undefined,
      });

      return { success: true, groupId };
    } catch (error) {
      console.error("Error creating group:", error);
      throw new Error("Failed to create group");
    }
  },
});

export const getMemeberDetils = query({
  args: {},
  handler: async (ctx, args) => {},
});

export const getAllOngoingHackathons = query({
  args: {
    userId: v.optional(v.string()), // Make userId optional
  },
  handler: async (ctx, args) => {
    try {
      const hackathons = await ctx.db
        .query("groups")
        .filter(
          (q) =>
            args.userId
              ? q.and(
                  q.eq(q.field("status"), "open"),
                  q.neq(q.field("creatorId"), args.userId) // Exclude user's own hackathons
                )
              : q.eq(q.field("status"), "open") // If userId is not provided, show all
        )
        .order("desc")
        .collect();

      return { success: true, hackathons };
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      return { success: false, error: "Failed to fetch hackathons" };
    }
  },
});

// ✅ Request to join a hackathon group
export const requestToJoinGroup = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    if (group.memberCount >= group.maxMembers) {
      throw new Error("Group is full");
    }

    if (group.pendingMembers.includes(args.userId)) {
      throw new Error("Already requested to join");
    }

    if (group.approvedMembers?.includes(args.userId)) {
      throw new Error("Already a member");
    }

    await ctx.db.patch(args.groupId, {
      pendingMembers: [...(group.pendingMembers || []), args.userId],
    });

    return { success: true };
  },
});

// ✅ Approve a group join request
export const approveGroupRequest = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.string(),
    creatorId: v.string(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    if (group.creatorId !== args.creatorId) {
      throw new Error("Only the creator can approve requests");
    }

    if (!group.pendingMembers?.includes(args.userId)) {
      throw new Error("No pending request found");
    }

    if (group.memberCount >= group.maxMembers) {
      throw new Error("Group is full");
    }

    await ctx.db.patch(args.groupId, {
      pendingMembers: (group.pendingMembers || []).filter(
        (id) => id !== args.userId
      ),
      approvedMembers: [...(group.approvedMembers || []), args.userId],
      memberCount: (group.memberCount || 0) + 1,
    });

    return { success: true };
  },
});

export const getMyCreatedHackathons = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const myHackathons = await ctx.db
        .query("groups")
        .filter((q) => q.eq(q.field("creatorId"), args.userId))
        .order("desc")
        .collect();

      return { success: true, myHackathons };
    } catch (error) {
      console.error("Error fetching my created hackathons:", error);
      return { success: false, error: "Failed to fetch your hackathons" };
    }
  },
});

// ✅ Create a new college event
export const createCollegeEvent = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    location: v.string(),
    type: v.union(
      v.literal("academic"),
      v.literal("sports"),
      v.literal("cultural"),
      v.literal("other")
    ),
    maxParticipants: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    organizer: v.optional(v.string()),
    contactInfo: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    try {
      const eventId = await ctx.db.insert("sema", {
        userId: args.userId,
        title: args.title,
        description: args.description,
        startDate: args.startDate,
        endDate: args.endDate,
        location: args.location,
        status: args.status, // Initial status is pending
        type: args.type,
        maxParticipants: args.maxParticipants,
        currentParticipants: 0, // Start with 0 participants
        registeredUsers: [],
        registeredUsersName: [], // Start with empty array
        createdAt: Date.now(),
        updatedAt: Date.now(),
        organizer: args.organizer,
        contactInfo: args.contactInfo,
        category: args.category,
        tags: args.tags || [],
        attachments: args.attachments || [],
        feedback: [], // Initialize empty feedback array
      });

      return { success: true, eventId };
    } catch (error) {
      console.error("Error creating event:", error);
      throw new Error("Failed to create event");
    }
  },
});

// ✅ Get all events by status
export const getEventsByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    try {
      const events = await ctx.db
        .query("sema")
        .filter((q) => q.eq(q.field("status"), args.status))
        .order("desc")
        .collect();

      return { success: true, events };
    } catch (error) {
      console.error("Error fetching events:", error);
      return { success: false, error: "Failed to fetch events" };
    }
  },
});

export const getGroupMembers = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    try {
      const group = await ctx.db.get(args.groupId);
      if (!group) throw new Error("Group not found");

      return { success: true, members: group.approvedMembers };
    } catch (error) {
      console.error("Error fetching group members:", error);
      return { success: false, error: "Failed to fetch members" };
    }
  },
});

// ✅ Register for an event
export const registerForEvent = mutation({
  args: {
    eventId: v.id("sema"),
    userId: v.string(),
    userFullName: v.string(), // Add userFullName to the arguments
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    if (event.currentParticipants >= event.maxParticipants) {
      throw new Error("Event is full");
    }

    if (event.registeredUsers.includes(args.userId)) {
      throw new Error("Already registered for this event");
    }

    await ctx.db.patch(args.eventId, {
      registeredUsers: [...event.registeredUsers, args.userId],
      registeredUsersName: [...event.registeredUsersName, args.userFullName], // Use userFullName here
      currentParticipants: event.currentParticipants + 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ✅ Add feedback for an event
export const addEventFeedback = mutation({
  args: {
    eventId: v.id("sema"),
    userId: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    if (!event.registeredUsers.includes(args.userId)) {
      throw new Error("Only registered users can provide feedback");
    }

    const newFeedback = {
      userId: args.userId,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    };

    const currentFeedback = event.feedback || [];

    await ctx.db.patch(args.eventId, {
      feedback: [...currentFeedback, newFeedback],
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
export const getOngoingAndUpcomingEvents = query({
  args: {},
  handler: async (ctx) => {
    try {
      const currentTime = Date.now();

      // Query for ongoing and upcoming events
      const events = await ctx.db
        .query("sema")
        .order("asc") // Sort events by start date
        .collect();

      return { success: true, events };
    } catch (error) {
      console.error("Error fetching ongoing and upcoming events:", error);
      return { success: false, error: "Failed to fetch events" };
    }
  },
});

export const updateEventStatus = mutation({
  args: {
    eventId: v.id("sema"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    try {
      const { eventId, status } = args;
      const event = await ctx.db.get(eventId);

      if (!event) {
        throw new Error("Event not found");
      }

      await ctx.db.patch(eventId, {
        status,
        updatedAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating event status:", error);
      throw new Error("Failed to update event status");
    }
  },
});
export const updateCollegeEvent = mutation({
  args: {
    eventId: v.id("sema"),
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    location: v.string(),
    type: v.union(
      v.literal("academic"),
      v.literal("sports"),
      v.literal("cultural"),
      v.literal("other")
    ),
    maxParticipants: v.number(),
    organizer: v.optional(v.string()),
    contactInfo: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    try {
      const { eventId, ...updateData } = args;
      const event = await ctx.db.get(eventId);

      if (!event) {
        throw new Error("Event not found");
      }

      await ctx.db.patch(eventId, {
        ...updateData,
        updatedAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating event:", error);
      throw new Error("Failed to update event");
    }
  },
});

export const getRegisteredUserNames = query({
  args: {
    eventId: v.id("sema"), // Expecting the event ID as an argument
  },
  handler: async (ctx, args) => {
    // Fetch the event from the database using the eventId
    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    // Return the list of user names of the registered users
    return { registeredUserNames: event.registeredUsersName };
  },
});
