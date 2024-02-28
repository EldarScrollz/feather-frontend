import { IUser } from "./IUser";

export interface IComment {
    readonly _id: string,
    postId: string,
    commentParentId: string | null,
    text: string,
    user: IUser | string,
    repliesCount: number,
    isEdited: boolean,
    readonly createdAt: string,
    updatedAt: string,
}