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
    })
});

export const {
    useGetSignedInUserQuery,

    useSignUpUserMutation,
    useSignInUserMutation,
    useSignOutUserMutation
} = authApi;