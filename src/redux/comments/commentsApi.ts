import { featherApi } from "../api/featherApi";
import { IComment } from "../../models/IComment";



const commentsApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getComments: builder.query<IComment[], void>({
            query: () => "/comments",
            providesTags: ["Comment"]
        }),
        getCommentsByPostId: builder.query<IComment[], string | undefined>({
            query: (postId) => `/comments/${postId}`,
            providesTags: ["Comment"]
        }),
        getReplies: builder.query<IComment[], string>({
            query: (commentId) => `/comments/replies/${commentId}`,
            providesTags: ["Comment"]
        }),

        createComment: builder.mutation<IComment, Partial<IComment>>({
            query: (body) => ({
                url: '/comments',
                method: 'POST',
                body: body
            }),
            invalidatesTags: ["Comment"]
        }),

        updateComment: builder.mutation<IComment, { commentId: string, body: Partial<IComment>; }>({
            query: ({ commentId, body }) => ({
                url: `/comments/${commentId}`,
                method: 'PATCH',
                body: body
            }),
            invalidatesTags: ["Comment"]
        }),

        deleteComment: builder.mutation<string, { commentId: string, body: Partial<IComment>; }>({
            query: ({ commentId, body }) => ({
                url: `/comments/${commentId}`,
                method: 'DELETE',
                body: body
            }),
            invalidatesTags: ["Comment"]
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