import { IUser } from "./IUser";

export interface IPost {
    readonly _id: string,
    title: string,
    text: string,
    tags: string[],
    viewsCount: number,
    heartsCount: number,
    commentsCount: number,
    user: IUser,
    postImg: string,
    readonly createdAt: Date,
    updatedAt: Date,
}