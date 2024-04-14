import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from './user/userSlice';

import { featherApi } from './api/featherApi';
import { postsReducer } from './posts/postsSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postsReducer,
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