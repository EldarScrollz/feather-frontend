import { featherApi } from "../api/featherApi";

import { IHeart } from "../../models/IHeart";
import { postsApi } from "../posts/postsApi";

const heartsApi = featherApi.injectEndpoints({ //todo: do the same manual cache thing that I did with posts?
    endpoints: builder => ({
        getAllHearts: builder.query<IHeart[], void>({
            query: () => "/hearts",
            // providesTags: (result) => result
            //     ? [
            //         ...result.map(({ _id }) => ({ type: 'Heart' as const, id: _id })),
            //         { type: 'Heart', id: 'AllHearts' },
            //     ]
            //     : [{ type: 'Heart', id: 'AllHearts' }],
        }),
        getHeartByPostId: builder.query<IHeart[], string | undefined>({
            query: (postId) => `/hearts/${postId}`,
            providesTags: (result, error, postId) => [{ type: 'Heart', id: postId }]
        }),
        hasUserHeartedPost: builder.query<IHeart, { postId: string | undefined, userId: string | undefined; }>({
            query: ({ postId, userId }) => `hearts/hasUserHeart/${postId}/${userId}`,
            providesTags: (result, error, args) => [{ type: 'Heart', id: args.postId }]
        }),

        createHeart: builder.mutation<IHeart, string>({
            query: (postId) => ({
                url: `/hearts/${postId}`,
                method: 'POST'
            }),

            invalidatesTags: (result, error, postId) => [
                { type: 'Heart', id: postId },
                // { type: 'Post', id: `AllPosts${postId}` }
            ],

            async onQueryStarted(postId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    postsApi.util.updateQueryData('getPosts', undefined, (draft) => {
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
                url: `/hearts/${postId}/${userId}`,
                method: 'DELETE'
            }),

            invalidatesTags: (result, error, args) => [
                { type: 'Heart', id: args.postId },
                // { type: 'Post', id: `AllPosts${args.postId}` }
            ],

            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    postsApi.util.updateQueryData('getPosts', undefined, (draft) => {
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