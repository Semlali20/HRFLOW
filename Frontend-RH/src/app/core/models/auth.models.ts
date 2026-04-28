export class User {
    id: number;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    token?: string;
    email: string;
}

export interface AuthUser {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    id: number;
    lastname: string;
    firstname: string;
    email: string;
    title: string;
    userRole: string;
    permissions: string[];
}
