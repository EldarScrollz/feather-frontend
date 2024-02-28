import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const featherApi = createApi({
  reducerPath: 'featherApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND,
    credentials: "include",
  }),
  tagTypes: ["Post", "Comment"],
  endpoints: builder => ({})
});