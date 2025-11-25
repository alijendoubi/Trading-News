/**
 * Backend-specific API types and interfaces
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    details?: unknown;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
export interface PaginationParams {
    page: number;
    pageSize: number;
    search?: string;
    sort?: string;
    order?: 'ASC' | 'DESC';
}
export interface ApiError {
    status: number;
    message: string;
    details?: unknown;
}
//# sourceMappingURL=api.d.ts.map