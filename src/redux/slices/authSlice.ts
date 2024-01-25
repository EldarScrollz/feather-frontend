import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customAxios from "../../axiosSettings";
import { IOnSubmitProps } from '../../pages/signIn/SignIn';
import { RootState } from '../store';



export const fetchAuth = createAsyncThunk('auth/fetchAuth', async (params: IOnSubmitProps) =>
{
    const { data } = await customAxios.post("/auth/login", params);
    return data;
});



export const fetchMe = createAsyncThunk('auth/fetchMe', async () =>
{
        const { data } = await customAxios.get("/auth/me");
        return data;
});



export const fetchRegister = createAsyncThunk('auth/fetchRegister', async (params: IOnSubmitProps) =>
{
    const data = await customAxios.post("/auth/register", params).then((res) => res.data).catch((error) => error.response.data);
    return data;
});



interface AuthState
{
    userData: { errorMessage?: string; } | null,
    status: string;
}

const initialState: AuthState =
{
    userData: null,
    status: "loading"
};

const authSlice = createSlice(
    {
        name: "auth",
        initialState,
        reducers: {
            signOut: (state) =>
            {
                state.userData = null;
            }
        },
        extraReducers: (builder) =>
        {
            // fetchAuth
            builder.addCase(fetchAuth.pending, (state) => 
            {
                state.userData = null;
                state.status = "loading";
            });
            builder.addCase(fetchAuth.fulfilled, (state, action) => 
            {
                state.userData = action.payload;
                state.status = "loaded";
            });
            builder.addCase(fetchAuth.rejected, (state) => 
            {
                state.userData = null;
                state.status = "error";
            });
            //-------------------------------------------------------
            // fetchMe
            builder.addCase(fetchMe.pending, (state) => 
            {
                state.userData = null;
                state.status = "loading";
            });
            builder.addCase(fetchMe.fulfilled, (state, action) => 
            {
                state.userData = action.payload;
                state.status = "loaded";
            });
            builder.addCase(fetchMe.rejected, (state) => 
            {
                state.status = "error";
            });
            //-------------------------------------------------------
            // fetchRegister
            builder.addCase(fetchRegister.pending, (state) => 
            {
                state.userData = null;
                state.status = "loading";
            });
            builder.addCase(fetchRegister.fulfilled, (state, action) => 
            {
                state.userData = action.payload;
                state.status = "loaded";
            });
            builder.addCase(fetchRegister.rejected, (state) => 
            {
                state.userData = null;
                state.status = "error";
            });
            //-------------------------------------------------------
        }
    }
);

export const selectIsAuth = (state: RootState) => { if (state.auth.userData !== null && !state.auth.userData.errorMessage) { return true; } else { return false; } };

export const authReducer = authSlice.reducer;
export const { signOut } = authSlice.actions;