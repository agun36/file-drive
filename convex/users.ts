import { ConvexError, v } from "convex/values";
import { internalMutation, MutationCtx, QueryCtx } from "./_generated/server";

// Define your orgIds array outside of the functions
const orgIds = [
    'org_2kbOnRn2yRZ7y14u6O296DZmV3d',
    'org_2kbPps1dcN3BHGXmxnS9uZ6dP2H',
    'org_2kbN2wC5z301ffcs1VGwLK47ql2',
    'org_2l0hmj9JVdyQqd3AvDqnLx5a26a'
];

export async function getUser(ctx: QueryCtx | MutationCtx, tokenIdentifier: string) {
    const user = await ctx.db
        .query("users")
        .withIndex('by_tokenIdentifier', (q) =>
            q.eq('tokenIdentifier', tokenIdentifier)
        )
        .first();
    if (!user) throw new ConvexError("Expected user to be defined");
    console.log(user);
    return user;
}

export const createUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
    },
    async handler(ctx, args) {
        await ctx.db.insert('users', {
            tokenIdentifier: args.tokenIdentifier,
            orgIds: orgIds
        });
    }
});

export const addOrgIdToUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string(),
    },
    async handler(ctx, args) {
        const user = await getUser(ctx, args.tokenIdentifier);
        await ctx.db.patch(user._id, {
            orgIds: [...user.orgIds, args.orgId]
        });
    }
});
