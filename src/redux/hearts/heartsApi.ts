import { featherApi } from "../api/featherApi";
import { IHeart } from "../../models/IHeart";

const heartsApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getAllHearts: builder.query<IHeart[], void>({
            query: () => "/hearts"
        }),
        hasUserHeartedPost: builder.query<IHeart, { postId: string | undefined, userId: string | undefined; }>({
            query: ({ postId, userId }) => `hearts/hasUserHeart/${postId}/${userId}`
        }),
        getHeartByPostId: builder.query<IHeart, string>({
            query: (postId) => `/hearts/${postId}`
        }),

        createHeart: builder.mutation<IHeart, string>({
            query: (postId) => ({
                url: `/hearts/${postId}`,
                method: 'POST'
            })
        }),

        deleteHeart: builder.mutation<string, { postId: string, userId: string; }>({
            query: ({ postId, userId }) => ({
                url: `/hearts/${postId}/${userId}`,
                method: 'DELETE'
            })
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