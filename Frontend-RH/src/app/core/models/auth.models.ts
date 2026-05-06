export class User {
    id: number;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    token?: string;
    email: string;
}

/**
 * AuthUser matches the backend AuthResponse DTO:
 * POST /auth/login → { accessToken, refreshToken, tokenType, userId, firstName, lastName, email, role, permissions[] }
 */
export interface AuthUser {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    /** Backend field: userId */
    id: number;
    /** Backend field: lastName */
    lastname: string;
    /** Backend field: firstName */
    firstname: string;
    email: string;
    title: string;
    /** Backend field: role */
    userRole: string;
    permissions: string[];
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface TokenRefreshRequest {
    refreshToken: string;
}

export interface TokenRefreshResponse {
    accessToken: string;
    refreshToken: string;
}
