/**
 * Shared TypeScript types and interfaces used across frontend and backend
 */
export interface User {
    id: string;
    email: string;
    createdAt: Date;
    preferences?: UserPreferences;
}
export interface UserPreferences {
    theme: 'light' | 'dark';
    notifications: boolean;
    defaultCurrency: string;
}
export type ImpactLevel = 'Low' | 'Medium' | 'High';
export interface EconomicEvent {
    id: string;
    title: string;
    date: Date;
    impact: ImpactLevel;
    country: string;
    forecast?: number;
    actual?: number;
    previous?: number;
    description?: string;
}
export type AssetType = 'forex' | 'crypto' | 'commodity' | 'index';
export interface MarketAsset {
    id: string;
    symbol: string;
    type: AssetType;
    name: string;
    lastPrice: number;
    change: number;
    changeAmount: number;
    high24h?: number;
    low24h?: number;
    volume?: number;
    updatedAt: Date;
}
export interface NewsArticle {
    id: string;
    title: string;
    url: string;
    source: string;
    publishedAt: Date;
    category: string;
    summary?: string;
    imageUrl?: string;
}
export interface Watchlist {
    id: string;
    userId: string;
    assetIds: string[];
    createdAt: Date;
}
export interface UserAlert {
    id: string;
    userId: string;
    type: 'price' | 'economic' | 'news';
    settings: AlertSettings;
    active: boolean;
    createdAt: Date;
}
export interface AlertSettings {
    assetId?: string;
    eventId?: string;
    priceTarget?: number;
    threshold?: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
}
export interface AuthCredentials {
    email: string;
    password: string;
}
export interface JwtPayload {
    sub: string;
    email: string;
    iat: number;
    exp: number;
}
//# sourceMappingURL=types.d.ts.map