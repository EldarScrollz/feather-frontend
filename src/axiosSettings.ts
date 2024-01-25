import customAxios from "axios";
import { InternalAxiosRequestConfig } from "axios";

const instance = customAxios.create(
    {
        baseURL: process.env.REACT_APP_BACKEND,
    });

instance.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => 
{
    config.headers.authorization = window.localStorage.getItem("jsonWebToken");
    return config;
});

export default instance;