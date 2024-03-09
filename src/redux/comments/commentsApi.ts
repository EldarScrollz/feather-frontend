import { featherApi } from "../api/featherApi";

import { IComment } from "../../models/IComment";
import { postsApi } from "../posts/postsApi";



const commentsApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getComments: builder.query<IComment[], void>({
            query: () => "/comments",
        }),
        getCommentsByPostId: builder.query<IComment[], string | undefined>({
            query: (postId) => `/comments/${postId}`,
            providesTags: (result, error, postId) => result
                ? [
                    { type: 'Comment', id: postId },
                    { type: 'Comment', id: 'AllPostComments' },
                ]
                : [{ type: 'Comment', id: 'AllPostComments' }],
        }),

        getReplies: builder.query<IComment[], string>({
            query: (commentId) => `/comments/replies/${commentId}`,
            providesTags: (result, error, commentId) => result
                ? [
                    { type: 'Comment', id: commentId },
                    { type: 'Comment', id: 'AllPostComments' },
                ]
                : [{ type: 'Comment', id: 'AllPostComments' }],
        }),

        createComment: builder.mutation<IComment, Partial<IComment>>({
            query: (body) => ({
                url: '/comments',
                method: 'POST',
                body: body
            }),

            invalidatesTags: [{ type: 'Comment', id: 'AllPostComments' }],

            async onQueryStarted(body, { dispatch, queryFulfilled, getState }) {
                const invalidatedQueries = postsApi.util.selectInvalidatedBy(getState(), [{ type: 'Post', id: `AllPosts${body.postId}` }]);

                if (invalidatedQueries.length === 0) return;

                const originalArg = invalidatedQueries[invalidatedQueries.length - 1].originalArgs;

                const patchResult = dispatch(
                    postsApi.util.updateQueryData('getPosts', originalArg, (draft) => {
                        const foundPost = draft.find(post => post._id === body.postId);

                        if (foundPost && foundPost.commentsCount !== undefined) foundPost.commentsCount++;
                        return draft;
                    })
                );

                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error("createComment onQueryStarted error!", error);
                    patchResult.undo();
                }
            },
        }),

        updateComment: builder.mutation<IComment, { commentId: string, body: Partial<IComment>; }>({
            query: ({ commentId, body }) => ({
                url: `/comments/${commentId}`,
                method: 'PATCH',
                body: body
            }),
            invalidatesTags: (result, error, args) => [{ type: 'Comment', id: args.body.postId }],
        }),

        deleteComment: builder.mutation<string, { commentId: string, deleteCount: number, body: Partial<IComment>; }>({
            query: ({ commentId, deleteCount, body }) => ({
                url: `/comments/${commentId}`,
                method: 'DELETE',
                body: body
            }),

            invalidatesTags: [{ type: 'Comment', id: 'AllPostComments' }],

            async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
                const invalidatedQueries = postsApi.util.selectInvalidatedBy(getState(), [{ type: 'Post', id: `AllPosts${args.body.postId}` }]);

                if (invalidatedQueries.length === 0) return;

                const originalArg = invalidatedQueries[invalidatedQueries.length - 1].originalArgs;

                const patchResult = dispatch(
                    postsApi.util.updateQueryData('getPosts', originalArg, (draft) => {
                        const foundPost = draft.find(post => post._id === args.body.postId);

                        if (foundPost && foundPost.commentsCount !== undefined) foundPost.commentsCount = (foundPost.commentsCount - args.deleteCount);
                        return draft;
                    })
                );

                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error("deleteComment onQueryStarted error!", error);
                    patchResult.undo();
                }
            },
        })
    })
});

export const {
    useGetCommentsQuery,
    useGetCommentsByPostIdQuery,
    useGetRepliesQuery,

    useCreateCommentMutation,

    useUpdateCommentMutation,

    useDeleteCommentMutation
} = commentsApi;