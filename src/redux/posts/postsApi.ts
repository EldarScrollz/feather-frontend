import { featherApi } from "../api/featherApi";

import { IPost } from "../../models/IPost";



const postsApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getPosts: builder.query<IPost[], void>({
            query: () => '/posts',
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
            async onQueryStarted(postId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    postsApi.util.updateQueryData('getPosts', undefined, (draft) => {
                        const foundPost = draft.find(post => post._id === postId);
                        foundPost?.viewsCount && foundPost.viewsCount++;
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
                url: `/posts/${id}`,
                method: 'PATCH',
                body: body,
                params: { oldPostImgQuery }
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