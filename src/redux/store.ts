import { configureStore } from '@reduxjs/toolkit';

import { postsReducer } from './slices/postsSlice';
import { authReducer } from './slices/authSlice';

const store = configureStore({
    reducer: {
        allPosts: postsReducer,
        auth: authReducer,
    },
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch