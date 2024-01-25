import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customAxios from "../../axiosSettings";

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () =>
{
    const { data } = await customAxios.get("/posts");
    return data;
});

export const fetchTopTags = createAsyncThunk("posts/fetchTopTags", async () =>
{
    const { data } = await customAxios.get("/posts/topTags");
    return data;
});



interface IPostsState
{
    posts: {
        items: [],
        status: string;
    };

    tags: {
        items: [],
        status: string;
    };
}

const initialState: IPostsState =
{
    posts: {
        items: [],
        status: "loading"
    },
    tags: {
        items: [],
        status: "loading"
    }
};

const postSlice = createSlice(
    {
        name: "posts",
        initialState,
        reducers:
        {
            sortPost: (state, action) =>
            {
                let sortResult = [];

                switch (action.payload)
                {
                    case "new posts":
                        sortResult = [...state.posts.items].sort((a: { createdAt: Date; }, b: { createdAt: Date; }) => { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
                        state.posts.items = sortResult as [];
                        break;

                    case "old posts":
                        sortResult = [...state.posts.items].sort((a: { createdAt: Date; }, b: { createdAt: Date; }) => { return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); });
                        state.posts.items = sortResult as [];
                        break;

                    case "ascending hearts":
                        sortResult = [...state.posts.items].sort((a: { heartsCount: number; }, b: { heartsCount: number; }) => { return a.heartsCount - b.heartsCount; });
                        state.posts.items = sortResult as [];
                        break;

                    case "descending hearts":
                        sortResult = [...state.posts.items].sort((a: { heartsCount: number; }, b: { heartsCount: number; }) => { return b.heartsCount - a.heartsCount; });
                        state.posts.items = sortResult as [];
                        break;

                    case "ascending views":
                        sortResult = [...state.posts.items].sort((a: { viewsCount: number; }, b: { viewsCount: number; }) => { return a.viewsCount - b.viewsCount; });
                        state.posts.items = sortResult as [];
                        break;

                    case "descending views":
                        sortResult = [...state.posts.items].sort((a: { viewsCount: number; }, b: { viewsCount: number; }) => { return b.viewsCount - a.viewsCount; });
                        state.posts.items = sortResult as [];
                        break;
                }
            },               //(state: { posts: { items: { heartsCount: { count: number; }, _id: string; }[]; }; }, action)
            updateHeartsCount: (state: {posts:{items:{_id: string ,heartsCount: number}[]}}, action) =>
            {
                state.posts.items.forEach((e, index) => 
                {
                    if (e._id === action.payload._id) { state.posts.items[index].heartsCount = action.payload.count; }
                });
            }
        },
        extraReducers: (builder) =>
        {
            // Posts:
            builder.addCase(fetchPosts.pending, (state) => 
            {
                state.posts.items = [];
                state.posts.status = "loading";
            });
            builder.addCase(fetchPosts.fulfilled, (state, action) => 
            {
                const initialSortedPosts = [...action.payload].sort((a: { createdAt: Date; }, b: { createdAt: Date; }) => { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });

                state.posts.items = /* action.payload */ initialSortedPosts as [];
                state.posts.status = "loaded";
            });
            builder.addCase(fetchPosts.rejected, (state) => 
            {
                state.posts.items = [];
                state.posts.status = "error";
            });
            //-----------------------------------------------------
            // Tags:
            builder.addCase(fetchTopTags.pending, (state) => 
            {
                state.tags.items = [];
                state.posts.status = "loading";
            });
            builder.addCase(fetchTopTags.fulfilled, (state, action) => 
            {
                state.tags.items = action.payload;
                state.tags.status = "loaded";
            });
            builder.addCase(fetchTopTags.rejected, (state) => 
            {
                state.tags.items = [];
                state.tags.status = "error";
            });
            //-----------------------------------------------------

        }
    }
);

export const { sortPost, updateHeartsCount } = postSlice.actions;

export const postsReducer = postSlice.reducer;