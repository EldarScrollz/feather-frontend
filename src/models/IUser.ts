export interface IUser {
    readonly _id: string,
    email: string,
    passwordHash: string,
    name: string,
    jwtRefreshToken: string,
    userAvatar: string,
    readonly createdAt: string,
    updatedAt: string,
}