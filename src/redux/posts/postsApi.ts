import { featherApi } from "../api/featherApi";

import { IPost } from "../../models/IPost";

const postsApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getPosts: builder.query<IPost[], void>({
            query: () => '/posts',
            providesTags: ['Post']
        }),
        getPost: builder.query<IPost, string | undefined>({
            query: (postId) => `/posts/${postId}`
        }),
        createPost: builder.mutation<IPost, { title: string, tags: string[], text: string, postImg: string; }>({
            query: post => ({
                url: '/posts',
                method: 'POST',
                body: post
            }),
            invalidatesTags: ['Post']
        }),
        updatePost: builder.mutation<IPost, { id: string, oldPostImgQuery: string, title: string, tags: string[], text: string, postImg: string; }>({
            query: ({ id, oldPostImgQuery, ...post }) => ({
                url: `/posts/${id}${oldPostImgQuery}`,
                method: 'PATCH',
                body: post
            }),
            invalidatesTags: ['Post']
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

    useGetTopTagsQuery } = postsApi;