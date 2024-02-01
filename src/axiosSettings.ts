import customAxios from "axios";
import { InternalAxiosRequestConfig } from "axios";

const instance = customAxios.create(
    {
        withCredentials: true,
        baseURL: process.env.REACT_APP_BACKEND,
    });

// instance.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => 
// {
//     config.headers.authorization = window.localStorage.getItem("accessToken");
//     return config;
// });

export default instance;