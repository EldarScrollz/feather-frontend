import { featherApi } from "../api/featherApi";

import { IHeart } from "../../models/IHeart";
import { postsApi } from "../posts/postsApi";

const heartsApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getAllHearts: builder.query<IHeart[], void>({
            query: () => "/v1/hearts",
        }),
        getHeartByPostId: builder.query<IHeart[], string | undefined>({
            query: (postId) => `/v1/hearts/${postId}`,
            providesTags: (result, error, postId) => [{ type: 'Heart', id: postId }]
        }),
        hasUserHeartedPost: builder.query<IHeart, { postId: string | undefined, userId: string | undefined; }>({
            query: ({ postId, userId }) => `/v1/hearts/has-user-heart/${postId}/${userId}`,
            providesTags: (result, error, args) => [{ type: 'Heart', id: args.postId }]
        }),

        createHeart: builder.mutation<IHeart, string>({
            query: (postId) => ({
                url: `/v1/hearts/${postId}`,
                method: 'POST'
            }),

            invalidatesTags: (result, error, postId) => [
                { type: 'Heart', id: postId },
            ],

            async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
                const invalidatedQueries = postsApi.util.selectInvalidatedBy(getState(), [{ type: 'Post', id: `AllPosts${postId}` }]);

                if (invalidatedQueries.length === 0) return console.warn('invalidatedQueries.length === 0');

                const originalArg = invalidatedQueries[invalidatedQueries.length - 1].originalArgs;

                const patchResult = dispatch(
                    postsApi.util.updateQueryData('getPosts', originalArg, (draft) => {
                        const foundPost = draft.find(post => post._id === postId);

                        if (foundPost && foundPost.heartsCount !== undefined) foundPost.heartsCount++;
                        return draft;
                    })
                );

                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error("createHeart onQueryStarted error!", error);
                    patchResult.undo();
                }
            },
        }),

        deleteHeart: builder.mutation<string, { postId: string, userId: string; }>({
            query: ({ postId, userId }) => ({
                url: `/v1/hearts/${postId}/${userId}`,
                method: 'DELETE'
            }),

            invalidatesTags: (result, error, args) => [
                { type: 'Heart', id: args.postId },
            ],

            async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
                const invalidatedQueries = postsApi.util.selectInvalidatedBy(getState(), [{ type: 'Post', id: `AllPosts${args.postId}` }]);

                if (invalidatedQueries.length === 0) return console.warn('invalidatedQueries.length === 0');

                const originalArg = invalidatedQueries[invalidatedQueries.length - 1].originalArgs;

                const patchResult = dispatch(
                    postsApi.util.updateQueryData('getPosts', originalArg, (draft) => {
                        const foundPost = draft.find(post => post._id === args.postId);

                        if (foundPost && foundPost.heartsCount !== undefined) foundPost.heartsCount--;
                        return draft;
                    })
                );

                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error("deleteHeart onQueryStarted error!", error);
                    patchResult.undo();
                }
            },
        })
    })
});

export const {
    useGetAllHeartsQuery,
    useHasUserHeartedPostQuery,
    useGetHeartByPostIdQuery,

    useCreateHeartMutation,

    useDeleteHeartMutation
} = heartsApi;