import { IUser } from "./IUser";

export interface IComment {
    readonly _id: string,
    postId: string,
    commentParentId: string,
    text: string,
    user: IUser,
    repliesCount: number,
    isEdited: boolean,
    readonly createdAt: string,
    updatedAt: string,
}