import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "./users";


async function hasAccessToOrg(
    ctx: QueryCtx | MutationCtx,
    orgId: string,
    tokenIdentifier: string
) {
    const user = await getUser(ctx, tokenIdentifier);
    const hasAccess = user.orgIds.includes(orgId) || user.tokenIdentifier === orgId;
    if (!hasAccess) throw new ConvexError("You don't have access to this organization");

    return hasAccess;
}

// Create a new task with the given text, into database
export const createTask = mutation({
    args: { name: v.string(), orgId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        console.log(identity)
        if (!identity) throw new ConvexError("You must be signed in to create a task");
        const hasAccess = await hasAccessToOrg(
            ctx, args.orgId,
            identity.tokenIdentifier
        );
        if (!hasAccess) throw new ConvexError("You don't have access to this organization");
        const newTaskId = await ctx.db.insert("files",
            { text: args.name, orgId: args.orgId }
        );
        return newTaskId;
    },
});

export const getFiles = query({
    args: {
        orgId: v.string(),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return []
        const hasAccess = await hasAccessToOrg(
            ctx, args.orgId,
            identity.tokenIdentifier
        );
        if (!hasAccess) return []
        return await ctx.db.query('files').withIndex('by_orgId', q => q.eq('orgId', args.orgId)).collect();


        // return await ctx.db.query('files').collect();
    },
})