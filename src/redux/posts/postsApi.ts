import { featherApi } from "../api/featherApi";

import { IPost } from "../../models/IPost";



const postsApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getPosts: builder.query<IPost[], void>({
            query: () => '/posts',
            providesTags: ["Post"]
        }),
        getPost: builder.query<IPost, string | undefined>({
            query: (postId) => `/posts/${postId}`,
            providesTags: ["Post"]
        }),

        createPost: builder.mutation<IPost, Partial<IPost>>({
            query: (post) => ({
                url: '/posts',
                method: 'POST',
                body: post
            }),
            invalidatesTags: ["Post"]
        }),

        updatePost: builder.mutation<IPost, { id: string, oldPostImgQuery?: string | void, body: Partial<IPost>; }>({
            query: ({ id, oldPostImgQuery, body }) => ({
                url: `/posts/${id}`,
                method: 'PATCH',
                body: body,
                params: { oldPostImgQuery }
            }),
            invalidatesTags: ["Post"]
        }),

        deletePost: builder.mutation<string, string>({
            query: (postId) => ({
                url: `/posts/${postId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["Post"]
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