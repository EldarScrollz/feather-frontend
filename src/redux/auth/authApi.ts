import { IUser } from "../../models/IUser";

import { featherApi } from "../api/featherApi";

const authApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getSignedInUser: builder.query<IUser, void>({
            query: () => '/v1/auth/me',
        }),

        signUpUser: builder.mutation<IUser, Partial<IUser>>({
            query: (body) => ({
                url: '/v1/auth/register',
                method: 'POST',
                body: body
            })
        }),
        signInUser: builder.mutation<IUser, Partial<IUser>>({
            query: (body) => ({
                url: '/v1/auth/login',
                method: 'POST',
                body: body
            })
        }),
        signOutUser: builder.mutation<string, void>({
            query: () => ({
                url: '/v1/auth/logout',
                method: 'POST',
            })
        }),

        editUser: builder.mutation<IUser, { oldAvatar: string, body: Partial<IUser>; }>({
            query: ({ oldAvatar, body }) => ({
                url: `/v1/auth/editProfile?oldAvatar=${oldAvatar}`,
                method: 'PATCH',
                body: body,
            }),
            invalidatesTags: [{ type: 'Post', id: 'AllPosts' }]
        }),

        deleteUser: builder.mutation<string, { password: string; }>({
            query: ({ password }) => ({
                url: `/v1/auth/deleteProfile/${password}`,
                method: 'DELETE',
            })
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