import axios from "axios";
// import { InternalAxiosRequestConfig } from "axios";

export const axiosCustom = axios.create(
    {
        withCredentials: true,
        baseURL: process.env.REACT_APP_BACKEND,
    });

// axiosCustom.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => 
// {
//     config.headers.authorization = window.localStorage.getItem("accessToken");
//     return config;
// });