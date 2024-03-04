import { featherApi } from "../api/featherApi";
import { IComment } from "../../models/IComment";
import { postsApi } from "../posts/postsApi";



const commentsApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getComments: builder.query<IComment[], void>({
            query: () => "/comments",
            // providesTags: (result) => result
            //     ? [
            //         ...result.map(({ _id }) => ({ type: 'Comment' as const, id: _id })),
            //         { type: 'Comment', id: 'AllComments' },
            //     ]
            //     : [{ type: 'Comment', id: 'AllComments' }],
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
        }),

        createComment: builder.mutation<IComment, Partial<IComment>>({
            query: (body) => ({
                url: '/comments',
                method: 'POST',
                body: body
            }),

            invalidatesTags: [{ type: 'Comment', id: 'AllPostComments' }],

            async onQueryStarted(body, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    postsApi.util.updateQueryData('getPosts', undefined, (draft) => {
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

        deleteComment: builder.mutation<string, { commentId: string, body: Partial<IComment>; }>({
            query: ({ commentId, body }) => ({
                url: `/comments/${commentId}`,
                method: 'DELETE',
                body: body
            }),

            invalidatesTags: [{ type: 'Comment', id: 'AllPostComments' }],

            async onQueryStarted(body, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    postsApi.util.updateQueryData('getPosts', undefined, (draft) => {
                        const foundPost = draft.find(post => post._id === body.body.postId);
                        
                        if (foundPost && foundPost.commentsCount !== undefined) foundPost.commentsCount--;
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