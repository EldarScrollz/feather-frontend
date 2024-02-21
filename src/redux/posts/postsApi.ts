import { IPost } from "../../models/IPost";
import { featherApi } from "../api/featherApi";

const postsApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getPosts: builder.query<IPost[], void>({
            query: () => '/posts'
        }),
        getTopTags: builder.query<string[], void>({
            query: () => '/posts/topTags'
        })
    })
});

export const { useGetPostsQuery, useGetTopTagsQuery } = postsApi;