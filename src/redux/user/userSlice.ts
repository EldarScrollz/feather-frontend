import { IUser } from '../../models/IUser';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';



interface IAuthState {
    userData: IUser | null,
}

const initialState: IAuthState =
{
    userData: null,
};

const authSlice = createSlice(
    {
        name: "auth",
        initialState,
        reducers: {
            setUserData: (state, action: PayloadAction<IUser>) => {
                state.userData = action.payload;
            },
            signOut: (state) => {
                state.userData = null;
            }
        },
    });



export const selectIsUserSignedIn = (state: RootState) => { if (state.auth.userData) { return true; } else { return false; } };

export const authReducer = authSlice.reducer;
export const { setUserData, signOut } = authSlice.actions;