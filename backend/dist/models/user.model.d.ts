export interface UserRow {
    id: number;
    email: string;
    name: string;
    password_hash: string;
    preferences: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
}
export declare class UserModel {
    static findByEmail(email: string): Promise<UserRow | null>;
    static findById(id: number): Promise<UserRow | null>;
    static create(email: string, passwordHash: string, name: string): Promise<UserRow>;
    static updatePreferences(userId: number, preferences: Record<string, unknown>): Promise<UserRow>;
    static getAll(limit?: number, offset?: number): Promise<{
        users: UserRow[];
        total: number;
    }>;
}
//# sourceMappingURL=user.model.d.ts.map