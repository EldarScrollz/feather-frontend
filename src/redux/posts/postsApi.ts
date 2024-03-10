import { featherApi } from "../api/featherApi";

import { IPost } from "../../models/IPost";



export const postsApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getPosts: builder.query<IPost[], string>({
            query: (sort) => sort ? `/posts?sortBy=${sort}` : '/posts',
            providesTags: (result) => result
                ? [
                    ...result.map(({ _id }) => ({ type: 'Post' as const, id: `AllPosts${_id}` })),
                    { type: 'Post', id: 'AllPosts' },
                ]
                : [{ type: 'Post', id: 'AllPosts' }],   
        }),
        getPost: builder.query<IPost, string | undefined>({
            query: (postId) => `/posts/${postId}`,
            providesTags: (result, error, postId) => result ? [{ type: 'Post', id: postId },] : ["Post"],
            async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
                const invalidatedQueries = postsApi.util.selectInvalidatedBy(getState(), [{ type: 'Post', id: `AllPosts${postId}` }]);

                if (invalidatedQueries.length === 0) return;

                const originalArg = invalidatedQueries[invalidatedQueries.length - 1].originalArgs;

                const patchResult = dispatch(
                    postsApi.util.updateQueryData('getPosts', originalArg, (draft) => {
                        const foundPost = draft.find(post => post._id === postId);

                        if (foundPost && foundPost.viewsCount !== undefined) foundPost.viewsCount++;
                        return draft;
                    })
                );

                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error("getPost onQueryStarted error!", error);
                    patchResult.undo();
                }
            },
        }),

        createPost: builder.mutation<IPost, Partial<IPost>>({
            query: (post) => ({
                url: '/posts',
                method: 'POST',
                body: post
            }),
            invalidatesTags: [{ type: 'Post', id: 'AllPosts' }],
        }),

        updatePost: builder.mutation<IPost, { id: string, oldPostImgQuery?: string | void, body: Partial<IPost>; }>({
            query: ({ id, oldPostImgQuery, body }) => ({
                url: `/posts/${id}?oldPostImg=${oldPostImgQuery}`,
                method: 'PATCH',
                body: body,
            }),
            invalidatesTags: (result, error, args) => [{ type: 'Post', id: `AllPosts${args.id}` }],
        }),

        deletePost: builder.mutation<string, string>({
            query: (postId) => ({
                url: `/posts/${postId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Post', id: 'AllPosts' }],
        }),

        getTopTags: builder.query<string[], void>({
            query: () => '/posts/topTags'
        })
    })
});

export const {
    useGetPostsQuery,
    useGetPostQuery,

    useCreatePostMutation,

    useUpdatePostMutation,

    useDeletePostMutation,

    useGetTopTagsQuery } = postsApi;