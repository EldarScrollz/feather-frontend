/// <reference types="react-scripts" />

declare namespace NodeJS {
    interface ProcessEnv {
        //types of envs
        REACT_APP_BACKEND: string;
        REACT_APP_NOIMG: string;
    }
}