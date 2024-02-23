import { IUser } from "../../models/IUser";
import { featherApi } from "../api/featherApi";

const postsApi = featherApi.injectEndpoints({
    endpoints: builder => ({
        getMe: builder.query<IUser, void>({
            query: () => '/auth/me',
        }),
        signUpUser: builder.query<IUser, { email: string, password: string; }>({
            query: () => '/auth/register',
        }),
        signInUser: builder.query<IUser, { email: string, password: string; }>({
            query: () => '/auth/login',
        })
    })
});