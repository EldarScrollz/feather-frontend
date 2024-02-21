import { configureStore } from '@reduxjs/toolkit';

import { postsReducer } from './posts/postsSlice';
import { authReducer } from './slices/authSlice';

import { featherApi } from './api/featherApi';

const store = configureStore({
    reducer: {
        allPosts: postsReducer,
        auth: authReducer,
        [featherApi.reducerPath]: featherApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(featherApi.middleware),
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;