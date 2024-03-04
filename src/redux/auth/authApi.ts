import { IUser } from "../../models/IUser";

import { featherApi } from "../api/featherApi";

const authApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getSignedInUser: builder.query<IUser, void>({
            query: () => '/auth/me',
        }),

        signUpUser: builder.mutation<IUser, Partial<IUser>>({
            query: (body) => ({
                url: '/auth/register',
                method: 'POST',
                body: body
            })
        }),
        signInUser: builder.mutation<IUser, Partial<IUser>>({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                body: body
            })
        }),
        signOutUser: builder.mutation<string, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            })
        }),

        editUser: builder.mutation<IUser, { oldAvatar: string, body: Partial<IUser>; }>({
            query: ({ oldAvatar, body }) => ({
                url: `/auth/editProfile?oldAvatar=${oldAvatar}`,
                method: 'PATCH',
                body: body,
            }),
            invalidatesTags: [{ type: 'Post', id: 'AllPosts' }]
        }),

        deleteUser: builder.mutation<string, { userId: string, password: string; }>({
            query: ({ userId, password }) => ({
                url: `/auth/deleteProfile/${userId}/${password}`,
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