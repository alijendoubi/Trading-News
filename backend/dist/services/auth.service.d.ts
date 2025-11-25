export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface UserResponse {
    id: number;
    email: string;
    name: string;
    preferences: Record<string, unknown>;
    createdAt: Date;
}
export declare class AuthService {
    /**
     * Register a new user
     */
    static register(email: string, password: string, name: string): Promise<UserResponse>;
    /**
     * Login user and generate tokens
     */
    static login(email: string, password: string): Promise<{
        user: UserResponse;
        tokens: AuthTokens;
    }>;
    /**
     * Refresh access token
     */
    static refreshToken(refreshToken: string): Promise<AuthTokens>;
    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): Promise<UserResponse>;
    /**
     * Generate access and refresh tokens
     */
    private static generateTokens;
    /**
     * Remove sensitive data from user object
     */
    private static sanitizeUser;
}
//# sourceMappingURL=auth.service.d.ts.map