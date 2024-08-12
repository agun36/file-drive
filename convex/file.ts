import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Create a new task with the given text, into database
export const createTask = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("You must be signed in to create a task");
        const newTaskId = await ctx.db.insert("files", { text: args.name });
        return newTaskId;
    },
});

export const getFiles = query({
    args: {},
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("You must be signed in to create a task");
        return await ctx.db.query('files').collect();
    },
})