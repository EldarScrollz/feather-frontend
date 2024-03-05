import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface IPostsState {
    sortBy: string,
}

const initialState: IPostsState =
{
    sortBy: "new posts",
};

const postsSlice = createSlice(
    {
        name: "posts",
        initialState,
        reducers: {
            setSortBy: (state, action: PayloadAction<string>) => {
                state.sortBy = action.payload;
            },
        }
    });

export const postsReducer = postsSlice.reducer;
export const { setSortBy } = postsSlice.actions;