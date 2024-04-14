import { IUser } from "../../models/IUser";

import { featherApi } from "../api/featherApi";

const authApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getSignedInUser: builder.query<IUser, void>({
            query: () => '/v1/user/me',
        }),

        signUpUser: builder.mutation<IUser, Partial<IUser>>({
            query: (body) => ({
                url: '/v1/user/sign-up',
                method: 'POST',
                body: body
            })
        }),
        signInUser: builder.mutation<IUser, Partial<IUser>>({
            query: (body) => ({
                url: '/v1/user/sign-in',
                method: 'POST',
                body: body
            })
        }),
        signOutUser: builder.mutation<string, void>({
            query: () => ({
                url: '/v1/user/sign-out',
                method: 'POST',
            })
        }),

        editUser: builder.mutation<IUser, { oldAvatar: string, body: Partial<IUser>; }>({
            query: ({ oldAvatar, body }) => ({
                url: `/v1/user/edit-user?oldAvatar=${oldAvatar}`,
                method: 'PATCH',
                body: body,
            }),
            invalidatesTags: [{ type: 'Post', id: 'AllPosts' }]
        }),

        deleteUser: builder.mutation<string, { password: string; }>({
            query: ({ password }) => ({
                url: `/v1/user/delete-user/${password}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Post', id: 'AllPosts' }]
        }),
    })
});

export const {
    useGetSignedInUserQuery,

    useSignUpUserMutation,
    useSignInUserMutation,
    useSignOutUserMutation,

    useEditUserMutation,
    useDeleteUserMutation,
} = authApi;